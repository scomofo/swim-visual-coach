import { useEffect, useRef } from 'react';

import { DP } from '../../data/drillMotion';

// Authored hand/elbow loops (one full stroke cycle), not IK-solved for the whole
// path, so the elbow can't flip/twist as the hand sweeps through catch-pull-push-recovery.
const HAND_PATH = [
  [178, 6, 30], [196, 22, 26], [172, 70, 24], [110, 92, 14],
  [30, 96, 4], [-50, 70, 6], [-104, 22, 16],
  [-112, -40, 44], [-62, -80, 62], [24, -92, 66], [110, -64, 52], [162, -22, 38],
];
const ELBOW_PATH = [
  [92, 14, 22], [100, 18, 20], [130, 20, 22], [95, 10, 16],
  [55, -6, 10], [10, -16, 10], [-30, -30, 16],
  [-70, -30, 30], [-20, -70, 38], [60, -75, 44], [130, -40, 34], [150, -8, 26],
];
const TORSO = [[-20, 23, 22], [12, 25, 24], [55, 23, 21], [100, 26, 26], [140, 28, 30], [170, 25, 31], [190, 15, 17], [203, 10, 10]];
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, u) => a + (b - a) * u;

function spline(pts, t) {
  const n = pts.length;
  const f = (((t % 1) + 1) % 1) * n;
  const i = Math.floor(f);
  const u = f - i;
  const p0 = pts[(i - 1 + n) % n];
  const p1 = pts[i % n];
  const p2 = pts[(i + 1) % n];
  const p3 = pts[(i + 2) % n];
  const o = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const a = p0[k];
    const b = p1[k];
    const c = p2[k];
    const d = p3[k];
    o[k] = 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  }
  return o;
}

function ik(S, H, L1, L2, pole) {
  let dx = H[0] - S[0];
  let dy = H[1] - S[1];
  let dz = H[2] - S[2];
  let d = Math.hypot(dx, dy, dz) || 1e-4;
  const max = L1 + L2 - 1;
  if (d > max) {
    const k = max / d;
    dx *= k; dy *= k; dz *= k; d = max;
    H = [S[0] + dx, S[1] + dy, S[2] + dz];
  }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ax = [dx / d, dy / d, dz / d];
  const dot = pole[0] * ax[0] + pole[1] * ax[1] + pole[2] * ax[2];
  let px = pole[0] - ax[0] * dot;
  let py = pole[1] - ax[1] * dot;
  let pz = pole[2] - ax[2] * dot;
  const pl = Math.hypot(px, py, pz) || 1e-4;
  px /= pl; py /= pl; pz /= pl;
  return { elbow: [S[0] + ax[0] * a + px * h, S[1] + ax[1] * a + py * h, S[2] + ax[2] * a + pz * h], hand: H };
}

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function pool(n, tag, attrs, parent) {
  const a = [];
  for (let i = 0; i < n; i++) a.push(el(tag, attrs, parent));
  return a;
}
function hideFrom(arr, i) {
  for (; i < arr.length; i++) if (arr[i].style.display !== 'none') arr[i].style.display = 'none';
}

// Owns the whole visualization: water, caustics, bubbles/splash, and the articulated
// swimmer rig (IK arms, whip kick, body roll), driven by one requestAnimationFrame loop
// against an SVG scene graph. Reads live config each frame via getCfg() instead of props,
// so drill/mode/speed changes never require re-mounting the scene.
class SwimScene {
  constructor(host, getCfg) {
    this.host = host;
    this.getCfg = getCfg;
    this.t = 0; this.kp = 0; this.strokes = 0; this.time = 0; this.last = 0; this.bSmooth = 0;
    this.bub = []; this.drops = []; this.rings = []; this.wake = []; this.motes = [];
    this.above = { 1: true, '-1': true };
    this.build();
    this.frame = this.frame.bind(this);
    this.onResize = this.onResize.bind(this);
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(host);
    this.onResize();
    this.raf = requestAnimationFrame(this.frame);
  }
  stop() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
  }

  build() {
    const svg = el('svg', { width: '100%', height: '100%', preserveAspectRatio: 'none' }, this.host);
    svg.style.display = 'block';
    this.svg = svg;
    const defs = el('defs', {}, svg);

    this.wGrad = el('linearGradient', { id: 'swWater', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    this.wStops = [
      el('stop', { offset: '0', 'stop-color': '#0b3f57' }, this.wGrad),
      el('stop', { offset: '0.16', 'stop-color': '#12617d' }, this.wGrad),
      el('stop', { offset: '0.42', 'stop-color': '#0b3f5c' }, this.wGrad),
      el('stop', { offset: '0.76', 'stop-color': '#062639' }, this.wGrad),
      el('stop', { offset: '1', 'stop-color': '#020617' }, this.wGrad),
    ];
    const sg = el('linearGradient', { id: 'swShaft', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#9be7ff', 'stop-opacity': '0.30' }, sg);
    el('stop', { offset: '0.5', 'stop-color': '#67e8f9', 'stop-opacity': '0.07' }, sg);
    el('stop', { offset: '1', 'stop-color': '#67e8f9', 'stop-opacity': '0' }, sg);
    const cg = el('radialGradient', { id: 'swCaustic' }, defs);
    el('stop', { offset: '0', 'stop-color': '#d6faff', 'stop-opacity': '0.20' }, cg);
    el('stop', { offset: '1', 'stop-color': '#d6faff', 'stop-opacity': '0' }, cg);
    const bg = el('linearGradient', { id: 'swBody', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#16303f' }, bg);
    el('stop', { offset: '0.42', 'stop-color': '#5b93ab' }, bg);
    el('stop', { offset: '1', 'stop-color': '#132531' }, bg);
    const vg = el('linearGradient', { id: 'swVig', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#020617', 'stop-opacity': '0' }, vg);
    el('stop', { offset: '1', 'stop-color': '#020617', 'stop-opacity': '0.88' }, vg);
    const sb = el('linearGradient', { id: 'swBand', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0', 'stop-color': '#b4f0ff', 'stop-opacity': '0' }, sb);
    el('stop', { offset: '0.78', 'stop-color': '#b4f0ff', 'stop-opacity': '0.17' }, sb);
    el('stop', { offset: '1', 'stop-color': '#b4f0ff', 'stop-opacity': '0' }, sb);

    this.water = el('rect', { x: 0, y: 0, width: '100%', height: '100%', fill: 'url(#swWater)' }, svg);
    const gShafts = el('g', {}, svg); gShafts.style.mixBlendMode = 'screen';
    this.shafts = pool(8, 'polygon', { fill: 'url(#swShaft)' }, gShafts);
    const gMotes = el('g', { fill: '#dff6ff' }, svg);
    this.moteEls = pool(44, 'circle', { r: 1 }, gMotes);
    this.band = el('rect', { fill: 'url(#swBand)' }, svg);
    this.wakeEls = pool(20, 'ellipse', { fill: 'none', stroke: '#a9e8ff', 'stroke-width': 1.4 }, el('g', {}, svg));
    this.surf1 = el('path', { fill: 'none', stroke: 'rgba(200,248,255,0.6)', 'stroke-width': 1.6 }, svg);
    this.surf2 = el('path', { fill: 'none', stroke: 'rgba(200,248,255,0.16)', 'stroke-width': 1 }, svg);

    this.ghost = this.makeActor(svg, true);
    this.actors = [this.makeActor(svg, false), this.makeActor(svg, false)];

    const gBub = el('g', {}, svg);
    this.bubEls = pool(80, 'circle', { fill: 'none', stroke: '#d6f6ff', 'stroke-width': 0.9 }, gBub);
    const gDrop = el('g', { fill: '#e8fbff' }, svg);
    this.dropEls = pool(34, 'ellipse', {}, gDrop);
    const gRing = el('g', { fill: 'none', stroke: '#d9f6ff', 'stroke-width': 1.5 }, svg);
    this.ringEls = pool(16, 'ellipse', {}, gRing);
    const gC = el('g', {}, svg); gC.style.mixBlendMode = 'overlay';
    this.caustics = pool(6, 'circle', { fill: 'url(#swCaustic)' }, gC);
    this.vig = el('rect', { fill: 'url(#swVig)' }, svg);
    this.guide1 = el('line', { 'stroke-dasharray': '10 12', 'stroke-width': 1.4, stroke: 'rgba(207,250,254,0.55)' }, svg);
    this.guide2 = el('line', { 'stroke-width': 1, stroke: 'rgba(207,250,254,0.16)' }, svg);
    this.phaseText = el('text', {
      'font-family': 'Inter, system-ui, sans-serif', 'font-size': 13, 'font-weight': 700,
      fill: 'rgba(226,242,254,0.92)', 'text-anchor': 'middle', 'letter-spacing': '0.14em',
      stroke: 'rgba(2,10,18,0.65)', 'stroke-width': 3, 'paint-order': 'stroke',
    }, svg);
  }

  makeActor(svg, isGhost) {
    const g = el('g', {}, svg);
    if (isGhost) { g.setAttribute('opacity', '0.15'); g.setAttribute('fill', '#a5f3fc'); g.setAttribute('stroke', '#a5f3fc'); }
    const outline = isGhost ? {} : { stroke: 'rgba(3,12,20,0.5)', 'stroke-width': 1.4 };
    const limb = () => [
      el('path', { fill: 'none', 'stroke-linecap': 'round' }, g),
      el('path', { fill: 'none', 'stroke-linecap': 'round' }, g),
      el('ellipse', outline, g),
      el('circle', outline, g),
    ];
    const a = { g, farLeg: limb(), farArm: limb() };
    a.torso = el('path', outline, g);
    a.spine = el('path', { fill: 'none', stroke: '#7ba7bd', 'stroke-width': 1.6, opacity: 0.3 }, g);
    a.head = el('ellipse', outline, g);
    a.cap = el('ellipse', isGhost ? {} : { fill: '#f97316' }, g);
    a.goggles = el('ellipse', { fill: 'rgba(18,48,66,0.88)' }, g);
    a.gloss = el('ellipse', { fill: '#ffffff', opacity: 0.32 }, g);
    a.nearArm = limb(); a.nearLeg = limb();
    return a;
  }

  onResize() {
    const r = this.host.getBoundingClientRect();
    this.W = Math.max(320, r.width);
    this.H = Math.max(240, r.height);
    this.svg.setAttribute('viewBox', '0 0 ' + this.W + ' ' + this.H);
    this.scale = (this.W * 0.82) / 640;
    this.cx = this.W * 0.45;
    this.cy = this.H * 0.52;
    this.surf = Math.max(26, this.cy - 72 * this.scale);
    const s = this.surf / this.H;
    this.wStops[1].setAttribute('offset', s.toFixed(3));
    this.wStops[2].setAttribute('offset', Math.min(0.99, s + 0.26).toFixed(3));
    this.band.setAttribute('x', 0); this.band.setAttribute('width', this.W);
    this.band.setAttribute('y', this.surf - 46); this.band.setAttribute('height', 62);
    this.vig.setAttribute('x', 0); this.vig.setAttribute('width', this.W);
    this.vig.setAttribute('y', this.H * 0.52); this.vig.setAttribute('height', this.H * 0.48);
    this.motes = [];
    for (let i = 0; i < this.moteEls.length; i++) {
      this.motes.push({
        x: Math.random() * this.W,
        y: this.surf + Math.random() * (this.H - this.surf),
        r: 0.6 + Math.random() * 1.7,
        s: 0.4 + Math.random() * 1.1,
      });
    }
  }

  frame(ts) {
    this.raf = requestAnimationFrame(this.frame);
    const cfg = this.getCfg();
    if (!cfg) return;
    const dt = Math.min(0.05, this.last ? (ts - this.last) / 1000 : 0.016);
    this.last = ts;
    const step = cfg.reducedMotion ? 0 : dt;
    const P = cfg.params;
    const sp = cfg.speed * (cfg.wrong ? 1.3 : 1);
    this.time += step;
    this.t = (this.t + step * P.tempo * sp) % 1;
    this.strokes += step * P.tempo * sp;
    this.kp = (this.kp + step * ((P.tempo > 0 ? P.tempo * 3 : 1.05) * sp)) % 1;
    this.dt = step;
    this.draw(cfg);
  }

  draw(cfg) {
    const W = this.W;
    const H = this.H;
    const P = cfg.params;
    const flow = P.flow * 300 * cfg.speed;

    for (let i = 0; i < this.shafts.length; i++) {
      const x = ((i * 181.7 - this.time * flow * 0.32) % (W + 420) + W + 420) % (W + 420) - 210;
      const w = 24 + 28 * (0.5 + 0.5 * Math.sin(this.time * 0.5 + i));
      this.shafts[i].setAttribute('points',
        (x - w / 2) + ',' + this.surf + ' ' + (x + w / 2) + ',' + this.surf + ' ' + (x - 70 + w * 1.7) + ',' + H + ' ' + (x - 70 - w * 1.7) + ',' + H);
    }
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      const e = this.moteEls[i];
      m.x -= flow * m.s * this.dt;
      if (m.x < -6) { m.x = W + 6; m.y = this.surf + Math.random() * (H - this.surf); }
      e.setAttribute('cx', m.x.toFixed(1));
      e.setAttribute('cy', (m.y + Math.sin(this.time * 0.6 + m.x * 0.01) * 2).toFixed(1));
      e.setAttribute('r', m.r.toFixed(2));
      e.setAttribute('opacity', (0.10 + 0.15 * m.s).toFixed(2));
    }
    let d1 = '';
    let d2 = '';
    for (let x = 0; x <= W; x += 14) {
      const y = this.surf + Math.sin(x * 0.014 - this.time * 1.5) * 3 + Math.sin(x * 0.031 + this.time * 0.9) * 1.8;
      d1 += (x === 0 ? 'M' : 'L') + x.toFixed(0) + ' ' + y.toFixed(1);
      const y2 = this.surf - 10 + Math.sin(x * 0.019 + this.time * 1.1) * 2.4;
      d2 += (x === 0 ? 'M' : 'L') + x.toFixed(0) + ' ' + y2.toFixed(1);
    }
    this.surf1.setAttribute('d', d1);
    this.surf2.setAttribute('d', d2);
    for (let i = 0; i < this.caustics.length; i++) {
      const x = ((i * 257 - this.time * flow * 0.45) % (W + 520) + W + 520) % (W + 520) - 260;
      const e = this.caustics[i];
      e.setAttribute('cx', x.toFixed(1));
      e.setAttribute('cy', (this.surf + 60).toFixed(1));
      e.setAttribute('r', 210);
    }

    if (P.split) {
      this.ghost.g.style.display = 'none';
      this.actors[0].g.style.display = '';
      this.actors[1].g.style.display = '';
      this.guide1.style.display = 'none'; this.guide2.style.display = 'none';
      this.pose(cfg, { arms: 'stroke', kick: 0.5, roll: 0.64, tempo: P.tempo, flow: P.flow, glide: 0.08, breath: 0.34 }, { dy: -12 * this.scale, sc: 0.62 }, this.actors[0]);
      this.pose(cfg, { arms: 'stroke', kick: 0.8, roll: 0.10, tempo: P.tempo, flow: P.flow, glide: 0, breath: 0 }, { dy: H * 0.17, sc: 0.62, wrong: true, dt: 0.37 }, this.actors[1]);
    } else {
      this.actors[1].g.style.display = 'none';
      this.actors[0].g.style.display = '';
      this.ghost.g.style.display = cfg.ghost ? '' : 'none';
      if (cfg.ghost) this.pose(cfg, P, { dt: -0.26, ghost: true }, this.ghost);
      this.pose(cfg, P, { wrong: cfg.wrong }, this.actors[0]);
    }

    this.step(flow);
  }

  step(flow) {
    let n = 0;
    for (let i = this.bub.length - 1; i >= 0; i--) {
      const b = this.bub[i];
      b.y -= (14 + b.r * 7) * this.dt * 3;
      b.x += (b.vx - flow * 0.25) * this.dt + Math.sin(this.time * 3 + b.seed) * 0.35;
      b.life -= this.dt;
      if (b.y < this.surf || b.life <= 0) {
        if (b.y < this.surf + 6 && b.r > 1.8) this.rings.push({ x: b.x, y: this.surf, r: b.r, a: 0.3 });
        this.bub.splice(i, 1); continue;
      }
      if (n < this.bubEls.length) {
        const e = this.bubEls[n++];
        e.style.display = '';
        e.setAttribute('cx', b.x.toFixed(1)); e.setAttribute('cy', b.y.toFixed(1));
        e.setAttribute('r', b.r.toFixed(2));
        e.setAttribute('opacity', (clamp(b.life, 0, 1) * 0.8).toFixed(2));
        e.setAttribute('stroke-width', Math.max(0.6, b.r * 0.28).toFixed(2));
      }
    }
    hideFrom(this.bubEls, n);

    n = 0;
    for (let i = this.wake.length - 1; i >= 0; i--) {
      const w = this.wake[i];
      w.x -= w.sp * this.dt; w.life -= this.dt; w.r += 24 * this.dt;
      if (w.life <= 0) { this.wake.splice(i, 1); continue; }
      if (n < this.wakeEls.length) {
        const e = this.wakeEls[n++];
        e.style.display = '';
        e.setAttribute('cx', w.x.toFixed(1)); e.setAttribute('cy', w.y.toFixed(1));
        e.setAttribute('rx', (w.r * 3.2).toFixed(1)); e.setAttribute('ry', (w.r * 0.34).toFixed(1));
        e.setAttribute('opacity', (clamp(w.life / w.max, 0, 1) * 0.13).toFixed(2));
      }
    }
    hideFrom(this.wakeEls, n);

    n = 0;
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.r += 95 * this.dt; r.a -= this.dt * 0.9;
      if (r.a <= 0) { this.rings.splice(i, 1); continue; }
      if (n < this.ringEls.length) {
        const e = this.ringEls[n++];
        e.style.display = '';
        e.setAttribute('cx', r.x.toFixed(1)); e.setAttribute('cy', r.y.toFixed(1));
        e.setAttribute('rx', r.r.toFixed(1)); e.setAttribute('ry', (r.r * 0.26).toFixed(1));
        e.setAttribute('opacity', r.a.toFixed(2));
      }
    }
    hideFrom(this.ringEls, n);

    n = 0;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.vy += 620 * this.dt; d.x += d.vx * this.dt; d.y += d.vy * this.dt; d.life -= this.dt;
      if (d.life <= 0 || d.y > this.surf) {
        if (d.y > this.surf) this.rings.push({ x: d.x, y: this.surf, r: 1, a: 0.22 });
        this.drops.splice(i, 1); continue;
      }
      if (n < this.dropEls.length) {
        const e = this.dropEls[n++];
        e.style.display = '';
        e.setAttribute('cx', d.x.toFixed(1)); e.setAttribute('cy', d.y.toFixed(1));
        e.setAttribute('rx', (d.r * 0.7).toFixed(2)); e.setAttribute('ry', (d.r * 1.3).toFixed(2));
        e.setAttribute('opacity', clamp(d.life * 1.4, 0, 1).toFixed(2));
      }
    }
    hideFrom(this.dropEls, n);
  }

  pose(cfg, P, o, A) {
    const S = this.scale * (o.sc || 1);
    const cx = this.cx;
    const cy = this.cy + (o.dy || 0);
    const wrong = !!o.wrong;
    const ghost = !!o.ghost;
    const t = (((this.t + (o.dt || 0)) % 1) + 1) % 1;
    const glide = P.glide || 0;
    const tw = ((t - (glide * Math.sin(TAU * t)) / TAU) % 1 + 1) % 1;

    let roll;
    if (wrong) roll = 0.10 * Math.sin(TAU * tw);
    else if (P.arms === 'skate') roll = -P.roll * (0.92 + 0.05 * Math.sin(this.time * 0.7));
    else roll = P.roll * Math.sin(TAU * (tw + 0.06));

    let pitch = wrong ? -0.15 : -0.015;
    if (P.press) pitch += 0.055 * Math.sin(this.time * 0.55);
    const bob = (wrong ? 5 : 2.4) * Math.sin(this.time * (wrong ? 2.4 : 0.9)) * S;

    let bTarget = 0;
    if (P.breath >= 1) bTarget = clamp(Math.sin(this.time * 0.62), 0, 1);
    else if (P.breath > 0 && Math.floor(this.strokes) % 3 === 0 && tw > 0.10 && tw < 0.44) {
      bTarget = Math.sin((Math.PI * (tw - 0.10)) / 0.34);
    }
    if (!ghost) this.bSmooth += (bTarget - this.bSmooth) * Math.min(1, this.dt * 7);
    const breath = wrong ? 0 : this.bSmooth;

    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    const cp = Math.cos(pitch);
    const spp = Math.sin(pitch);
    const world = (p) => {
      const y = p[1] * cr - p[2] * sr;
      const z = p[1] * sr + p[2] * cr;
      return [p[0] * cp - y * spp, p[0] * spp + y * cp, z];
    };
    const pr = (p) => {
      const w = world(p);
      return [cx + w[0] * S, cy + (w[1] - w[2] * 0.30) * S + bob, w[2]];
    };

    const hl = (part) => {
      const a = cfg.activeTag;
      if (!a || ghost) return false;
      const l = a.toLowerCase();
      if (part === 'head') return l.indexOf('head') >= 0;
      if (part === 'chest') return l.indexOf('chest') >= 0 || l.indexOf('press') >= 0;
      if (part === 'hips') return l.indexOf('hip') >= 0 || l.indexOf('leg') >= 0 || l.indexOf('kick') >= 0;
      return false;
    };
    const tone = (z, part) => {
      if (ghost) return '#a5f3fc';
      if (hl(part)) return '#22d3ee';
      const u = clamp((z + 78) / 156, 0, 1);
      return 'rgb(' + Math.round(lerp(28, 98, u)) + ',' + Math.round(lerp(56, 142, u)) + ',' + Math.round(lerp(76, 168, u)) + ')';
    };

    const arms = [];
    const legs = [];
    for (const side of [1, -1]) {
      const sh = [170, 0, 30 * side];
      let elbowPos;
      let handPos;
      if (P.arms === 'stroke') {
        const ph2 = tw + (side === 1 ? 0 : 0.5);
        const hb = spline(HAND_PATH, ph2);
        const eb = spline(ELBOW_PATH, ph2);
        handPos = [170 + hb[0], hb[1], hb[2] * side];
        elbowPos = [170 + eb[0], eb[1], eb[2] * side];
      } else {
        const target = P.arms === 'extend'
          ? [372, 5 + 4 * Math.sin(this.time * 0.7 + side), 22 * side]
          : (side === -1 ? [376, 3, 18 * side] : [44, 34, 32 * side]);
        const sol = ik(sh, target, 110, 100, [0.7, -0.4, 0.5 * side]);
        elbowPos = sol.elbow; handPos = sol.hand;
      }
      arms.push({ side, sh: pr(sh), el: pr(elbowPos), hd: pr(handPos) });

      const hip = [12, 0, 16 * side];
      const KA = (P.kick || 0) * (wrong ? 1.9 : 1.15);
      const ph = TAU * this.kp + (side === 1 ? 0 : Math.PI);
      const a1 = KA * 0.5 * Math.sin(ph);
      const a2 = KA * 0.95 * Math.sin(ph - 0.7);
      const a3 = KA * 1.7 * Math.sin(ph - 1.5);
      const kn = [hip[0] - 112 * Math.cos(a1), hip[1] + 112 * Math.sin(a1), hip[2]];
      const an = [kn[0] - 106 * Math.cos(a2), kn[1] + 106 * Math.sin(a2), kn[2]];
      const to = [an[0] - 32 * Math.cos(a3 + 0.16), an[1] + 32 * Math.sin(a3 + 0.16), an[2]];
      legs.push({ side, hip: pr(hip), kn: pr(kn), an: pr(an), to: pr(to) });
    }
    const far = arms[0].sh[2] < arms[1].sh[2] ? 0 : 1;
    const near = 1 - far;

    const seg = (e, a, b, w, part) => {
      e.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1));
      e.setAttribute('stroke-width', Math.max(2, w * S * (1 + ((a[2] + b[2]) / 2) * 0.0016)).toFixed(2));
      if (!ghost) e.setAttribute('stroke', tone((a[2] + b[2]) / 2, part));
    };
    const setArm = (slot, X) => {
      seg(slot[0], X.sh, X.el, 27, 'arm');
      seg(slot[1], X.el, X.hd, 19, 'arm');
      slot[3].setAttribute('cx', X.el[0].toFixed(1)); slot[3].setAttribute('cy', X.el[1].toFixed(1));
      slot[3].setAttribute('r', (10 * S).toFixed(1));
      if (!ghost) slot[3].setAttribute('fill', tone(X.el[2], 'arm'));
      slot[2].setAttribute('cx', X.hd[0].toFixed(1)); slot[2].setAttribute('cy', X.hd[1].toFixed(1));
      slot[2].setAttribute('rx', (10 * S).toFixed(1)); slot[2].setAttribute('ry', (6 * S).toFixed(1));
      if (!ghost) slot[2].setAttribute('fill', tone(X.hd[2], 'arm'));
    };
    const setLeg = (slot, L) => {
      seg(slot[0], L.hip, L.kn, 38, 'hips');
      seg(slot[1], L.kn, L.an, 24, 'hips');
      slot[3].setAttribute('cx', L.kn[0].toFixed(1)); slot[3].setAttribute('cy', L.kn[1].toFixed(1));
      slot[3].setAttribute('r', (13 * S).toFixed(1));
      if (!ghost) slot[3].setAttribute('fill', tone(L.kn[2], 'hips'));
      const fa = (Math.atan2(L.to[1] - L.an[1], L.to[0] - L.an[0]) * 180) / Math.PI;
      slot[2].setAttribute('cx', ((L.to[0] + L.an[0]) / 2).toFixed(1)); slot[2].setAttribute('cy', ((L.to[1] + L.an[1]) / 2).toFixed(1));
      slot[2].setAttribute('rx', (20 * S).toFixed(1)); slot[2].setAttribute('ry', (7.5 * S).toFixed(1));
      slot[2].setAttribute('transform', 'rotate(' + fa.toFixed(1) + ' ' + ((L.to[0] + L.an[0]) / 2).toFixed(1) + ' ' + ((L.to[1] + L.an[1]) / 2).toFixed(1) + ')');
      if (!ghost) slot[2].setAttribute('fill', tone(L.to[2], 'hips'));
    };
    setLeg(A.farLeg, legs[far]); setArm(A.farArm, arms[far]);
    setLeg(A.nearLeg, legs[near]); setArm(A.nearArm, arms[near]);

    const axis = TORSO.map((p) => pr([p[0], 0, 0]));
    const top = [];
    const bot = [];
    const mid = [];
    for (let i = 0; i < TORSO.length; i++) {
      const d = TORSO[i][1];
      const w = TORSO[i][2];
      const half = Math.sqrt((d * cr) * (d * cr) + (w * sr) * (w * sr)) * S;
      const a = axis[Math.max(0, i - 1)];
      const b = axis[Math.min(axis.length - 1, i + 1)];
      let tx = b[0] - a[0];
      let ty = b[1] - a[1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      top.push([axis[i][0] + ty * half, axis[i][1] - tx * half]);
      bot.push([axis[i][0] - ty * half, axis[i][1] + tx * half]);
      const k = -sr * 0.5 * half;
      mid.push([axis[i][0] + ty * k, axis[i][1] - tx * k]);
    }
    let d = 'M' + top[0][0].toFixed(1) + ' ' + top[0][1].toFixed(1);
    for (let i = 1; i < top.length; i++) {
      d += 'Q' + top[i - 1][0].toFixed(1) + ' ' + top[i - 1][1].toFixed(1) + ' ' + ((top[i - 1][0] + top[i][0]) / 2).toFixed(1) + ' ' + ((top[i - 1][1] + top[i][1]) / 2).toFixed(1);
    }
    d += 'L' + top[top.length - 1][0].toFixed(1) + ' ' + top[top.length - 1][1].toFixed(1);
    d += 'L' + bot[bot.length - 1][0].toFixed(1) + ' ' + bot[bot.length - 1][1].toFixed(1);
    for (let i = bot.length - 2; i >= 0; i--) {
      d += 'Q' + bot[i + 1][0].toFixed(1) + ' ' + bot[i + 1][1].toFixed(1) + ' ' + ((bot[i + 1][0] + bot[i][0]) / 2).toFixed(1) + ' ' + ((bot[i + 1][1] + bot[i][1]) / 2).toFixed(1);
    }
    d += 'Z';
    A.torso.setAttribute('d', d);
    if (!ghost) A.torso.setAttribute('fill', hl('chest') ? '#22d3ee' : 'url(#swBody)');
    let ds = '';
    for (let i = 0; i < mid.length; i++) ds += (i === 0 ? 'M' : 'L') + mid[i][0].toFixed(1) + ' ' + mid[i][1].toFixed(1);
    A.spine.setAttribute('d', ds);
    A.spine.setAttribute('opacity', ghost ? 0 : (0.22 + 0.3 * Math.abs(sr)).toFixed(2));

    const headRoll = roll + breath * 1.05;
    const hc = Math.cos(headRoll);
    const hs = Math.sin(headRoll);
    const hp = pr([212, wrong ? -30 : 0, 0]);
    const hr = 29 * S;
    const bodyAng = (Math.atan2(axis[axis.length - 1][1] - axis[0][1], axis[axis.length - 1][0] - axis[0][0]) * 180) / Math.PI;
    const rot = 'rotate(' + bodyAng.toFixed(1) + ' ' + hp[0].toFixed(1) + ' ' + hp[1].toFixed(1) + ')';
    A.head.setAttribute('cx', hp[0].toFixed(1)); A.head.setAttribute('cy', hp[1].toFixed(1));
    A.head.setAttribute('rx', (hr * 1.1).toFixed(1)); A.head.setAttribute('ry', (hr * 0.93).toFixed(1));
    A.head.setAttribute('transform', rot);
    if (!ghost) A.head.setAttribute('fill', hl('head') ? '#22d3ee' : '#f2f8fc');
    A.cap.setAttribute('cx', (hp[0] - hr * 0.16).toFixed(1));
    A.cap.setAttribute('cy', (hp[1] - hr * 0.32).toFixed(1));
    A.cap.setAttribute('rx', (hr * 0.98).toFixed(1)); A.cap.setAttribute('ry', (hr * 0.62).toFixed(1));
    A.cap.setAttribute('transform', rot);
    if (!ghost) A.cap.setAttribute('fill', hl('head') ? '#22d3ee' : '#f97316');
    const vis = clamp(hs - hc * 0.28, 0, 1);
    A.goggles.setAttribute('cx', (hp[0] + 7 * S).toFixed(1));
    A.goggles.setAttribute('cy', (hp[1] + (hc - hs * 0.30) * hr * 0.55).toFixed(1));
    A.goggles.setAttribute('rx', (hr * 0.44).toFixed(1));
    A.goggles.setAttribute('ry', (hr * 0.20 * (0.55 + vis * 0.55)).toFixed(1));
    A.goggles.setAttribute('opacity', ghost ? 0 : Math.max(0.32, Math.min(1, vis * 1.6)).toFixed(2));
    A.gloss.setAttribute('cx', (hp[0] - hr * 0.22).toFixed(1));
    A.gloss.setAttribute('cy', (hp[1] - hr * 0.40).toFixed(1));
    A.gloss.setAttribute('rx', (hr * 0.44).toFixed(1)); A.gloss.setAttribute('ry', (hr * 0.22).toFixed(1));
    A.gloss.setAttribute('opacity', ghost ? 0 : 0.3);

    if (!ghost && !o.dy && P.arms === 'stroke') {
      const label = tw < 0.25 ? 'CATCH' : tw < 0.45 ? 'PULL' : tw < 0.65 ? 'PUSH' : 'RECOVERY';
      this.phaseText.textContent = label;
      this.phaseText.setAttribute('x', hp[0].toFixed(1));
      this.phaseText.setAttribute('y', (hp[1] - hr * 2.1).toFixed(1));
      this.phaseText.style.display = '';
    } else if (!o.dy) {
      this.phaseText.style.display = 'none';
    }

    if (ghost || cfg.reducedMotion) return;

    for (const X of arms) {
      const wasAbove = this.above[String(X.side)] === true;
      const isAbove = X.hd[1] < this.surf;
      if (wasAbove && !isAbove) {
        this.rings.push({ x: X.hd[0], y: this.surf, r: 3, a: 0.7 });
        for (let i = 0; i < 12; i++) {
          this.bub.push({ x: X.hd[0] + (Math.random() - 0.5) * 26, y: X.hd[1] + Math.random() * 22, r: 1 + Math.random() * 3.2, vx: (Math.random() - 0.5) * 26, life: 0.9 + Math.random() * 1.3, seed: Math.random() * 9 });
        }
        for (let i = 0; i < 8; i++) {
          this.drops.push({ x: X.hd[0], y: this.surf - 2, vx: (Math.random() - 0.3) * 130, vy: -90 - Math.random() * 150, r: 1 + Math.random() * 1.7, life: 0.7 });
        }
      }
      this.above[String(X.side)] = isAbove;
      if (!isAbove && P.arms === 'stroke' && Math.random() < 0.3) {
        this.bub.push({ x: X.hd[0] + (Math.random() - 0.5) * 10, y: X.hd[1], r: 0.7 + Math.random() * 1.4, vx: (Math.random() - 0.5) * 10, life: 0.8 + Math.random(), seed: Math.random() * 9 });
      }
    }
    if (breath < 0.35 && Math.random() < 0.26) {
      this.bub.push({ x: hp[0] + 10 * S, y: hp[1] + 12 * S, r: 0.8 + Math.random() * 2, vx: 8, life: 1.1 + Math.random(), seed: Math.random() * 9 });
    }
    for (const L of legs) {
      if ((P.kick || 0) > 0.2 && Math.random() < (wrong ? 0.4 : 0.14)) {
        this.wake.push({ x: L.to[0], y: L.to[1], r: 2, sp: 90 + Math.random() * 90, life: 0.75, max: 0.75 });
      }
      if (wrong && Math.random() < 0.3) {
        this.bub.push({ x: L.to[0], y: L.to[1], r: 1 + Math.random() * 2.8, vx: -20, life: 1, seed: Math.random() * 9 });
      }
    }
    if (this.bub.length > 150) this.bub.splice(0, this.bub.length - 150);

    if (o.dy) return;
    const ga = pr([-250, 0, 0]);
    const gb = pr([380, 0, 0]);
    const show = cfg.showGuides ? '' : 'none';
    this.guide1.style.display = show; this.guide2.style.display = show;
    if (cfg.showGuides) {
      this.guide1.setAttribute('x1', ga[0].toFixed(1)); this.guide1.setAttribute('y1', ga[1].toFixed(1));
      this.guide1.setAttribute('x2', gb[0].toFixed(1)); this.guide1.setAttribute('y2', gb[1].toFixed(1));
      this.guide1.setAttribute('stroke', wrong ? 'rgba(254,202,202,0.55)' : 'rgba(207,250,254,0.55)');
      this.guide2.setAttribute('x1', ga[0].toFixed(1)); this.guide2.setAttribute('y1', (cy + bob).toFixed(1));
      this.guide2.setAttribute('x2', gb[0].toFixed(1)); this.guide2.setAttribute('y2', (cy + bob).toFixed(1));
    }
  }
}

export default function SwimmerScene({
  drill,
  isCorrect,
  showGuides,
  ghostMode,
  playbackSpeed,
  activeTag,
  reducedMotion = false,
}) {
  const hostRef = useRef(null);
  const cfgRef = useRef(null);

  const cfg = {
    params: DP[drill] || DP.superman,
    speed: playbackSpeed,
    wrong: !isCorrect,
    ghost: ghostMode,
    showGuides,
    activeTag,
    reducedMotion,
  };

  // The scene reads config through this ref every frame rather than through props,
  // so changing drill/mode/speed never remounts it and the water never resets.
  // Written after commit (never during render); the loop skips frames until it lands.
  useEffect(() => {
    cfgRef.current = cfg;
  });

  useEffect(() => {
    const scene = new SwimScene(hostRef.current, () => cfgRef.current);
    return () => scene.stop();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950" data-motion={reducedMotion ? 'static' : 'animated'}>
      <div ref={hostRef} className="absolute inset-0 overflow-hidden" data-motion={reducedMotion ? 'static' : 'animated'} />
    </div>
  );
}
