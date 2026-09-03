const LANE_START = 3.2;
const LANE_LENGTH = 18.6;
function wrap01(t) {
  return t - Math.floor(t);
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smooth(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
function dtor(d) {
  return d * Math.PI / 180;
}
function kf(t, rz, ry, rx, elbow, wrist = 0) {
  return {
    t,
    rz: dtor(rz),
    ry: dtor(ry),
    rx: dtor(rx),
    elbow: dtor(elbow),
    wrist: dtor(wrist)
  };
}
const TI_RIGHT = [
  kf(0, -8, 4, 10, 12, 6),
  kf(0.08, -22, 7, 16, 54, 8),
  kf(0.18, -50, 6, 12, 94, 6),
  kf(0.3, -90, 2, 6, 86, 2),
  kf(0.42, -128, -4, 2, 48, -4),
  kf(0.52, -152, -8, -6, 22, -8),
  kf(0.6, 32, 12, -14, 104, 10),
  kf(0.72, 48, 8, -10, 88, 6),
  kf(0.84, 20, 6, 4, 34, 8),
  kf(0.92, 4, 5, 8, 14, 12)
];
const WINDMILL_RIGHT = [
  kf(0, -18, 18, 0, 8, 0),
  kf(0.12, -58, 22, 4, 18, 0),
  kf(0.28, -110, 16, 2, 14, -6),
  kf(0.44, -158, 10, 0, 10, -8),
  kf(0.58, 86, 26, 8, 12, 0),
  kf(0.74, 58, 24, 4, 10, 4),
  kf(0.88, 16, 22, 2, 8, 6)
];
function sampleArm(frames, t) {
  const u = wrap01(t);
  let i = 0;
  while (i < frames.length - 1 && frames[i + 1].t <= u) i += 1;
  const a = frames[i];
  const b = frames[(i + 1) % frames.length];
  const bT = i === frames.length - 1 ? b.t + 1 : b.t;
  const local = bT - a.t < 1e-6 ? 1 : (u - a.t) / (bT - a.t);
  const s = smooth(local);
  return {
    rx: lerp(a.rx, b.rx, s),
    ry: lerp(a.ry, b.ry, s),
    rz: lerp(a.rz, b.rz, s),
    elbow: lerp(a.elbow, b.elbow, s),
    wrist: lerp(a.wrist, b.wrist, s)
  };
}
function mirrorArm(arm) {
  return {
    rx: -arm.rx,
    ry: -arm.ry,
    rz: arm.rz,
    elbow: arm.elbow,
    wrist: arm.wrist
  };
}
function streamlineArm(profile, sign) {
  const error = profile.armSet !== "ti";
  return {
    rx: dtor(error ? 28 : 9) * sign,
    ry: dtor(error ? 12 : 3) * sign,
    rz: dtor(error ? -24 : -6),
    elbow: dtor(error ? 34 : 10),
    wrist: dtor(error ? 4 : 10)
  };
}
function remap(u, segs) {
  let acc = 0;
  for (const seg of segs) {
    if (u <= acc + seg.span + 1e-6) {
      const t = seg.span <= 1e-6 ? 1 : (u - acc) / seg.span;
      return lerp(seg.a, seg.b, smooth(clamp(t, 0, 1)));
    }
    acc += seg.span;
  }
  return segs[segs.length - 1].b;
}
function strokePhase(u, profile) {
  switch (profile.style) {
    case "glide":
    case "kickGlide":
      return 0;
    case "skate":
      return remap(u, [
        { span: 0.72, a: 0, b: 0 },
        { span: 0.16, a: 0, b: 0.5 },
        { span: 0.12, a: 0.5, b: 0.5 }
      ]);
    case "breatheSkate":
      return remap(u, [
        { span: 0.58, a: 0, b: 0 },
        { span: 0.18, a: 0, b: 0.5 },
        { span: 0.24, a: 0.5, b: 0.5 }
      ]);
    case "single":
      return remap(u, [
        { span: 0.58, a: 0, b: 0 },
        { span: 0.2, a: 0, b: 0.5 },
        { span: 0.22, a: 0.5, b: 0.5 }
      ]);
    case "triple":
      return remap(u, [
        { span: 0.12, a: 0, b: 0.5 },
        { span: 0.08, a: 0.5, b: 0.5 },
        { span: 0.12, a: 0.5, b: 1 },
        { span: 0.08, a: 1, b: 1 },
        { span: 0.12, a: 1, b: 1.5 },
        { span: 0.48, a: 1.5, b: 1.5 }
      ]);
    case "longGlide":
      return remap(u, [
        { span: 0.38, a: 0, b: 1 },
        { span: 0.62, a: 1, b: 1 }
      ]);
    case "full":
    default:
      return u;
  }
}
function phaseName(profile, armPhase, u) {
  if (profile.bothForward) {
    return profile.style === "kickGlide" ? "Flutter glide" : "Streamline";
  }
  if (profile.style === "skate" && (u < 0.7 || u > 0.9)) return "Skate";
  if (profile.style === "single" && u < 0.55) return "Patient skate";
  if (profile.style === "triple" && u > 0.55) return "Glide";
  if (profile.style === "longGlide" && u > 0.4) return "Long glide";
  const p = wrap01(armPhase);
  if (p < 0.1) return "Catch";
  if (p < 0.34) return "Pull";
  if (p < 0.54) return "Push";
  if (p < 0.88) return "Recovery";
  return "Entry";
}
function breathEnvelope(armPhase, every, time, cycle) {
  if (every <= 0) return 0;
  const strokeIndex = Math.floor(time / cycle);
  if (strokeIndex % every !== 0) return 0;
  const p = wrap01(armPhase);
  if (p > 0.58 && p < 0.82) {
    return Math.sin((p - 0.58) / 0.24 * Math.PI);
  }
  return 0;
}
function evaluatePose(profile, time, zLane = 0) {
  const u = wrap01(time / Math.max(profile.cycle, 1e-3));
  const rawPhase = strokePhase(u, profile);
  const armPhase = wrap01(rawPhase);
  const frames = profile.armSet === "ti" ? TI_RIGHT : WINDMILL_RIGHT;
  let rightArm;
  let leftArm;
  if (profile.bothForward) {
    rightArm = streamlineArm(profile, 1);
    leftArm = streamlineArm(profile, -1);
  } else {
    rightArm = sampleArm(frames, armPhase);
    leftArm = mirrorArm(sampleArm(frames, armPhase + 0.5));
  }
  const rollPhase = profile.bothForward ? 0 : Math.cos(armPhase * Math.PI * 2);
  const bodyRoll = rollPhase * profile.roll;
  const breath = breathEnvelope(armPhase, profile.breathEvery, time, profile.cycle);
  const headRoll = breath * profile.breathAmount * (rollPhase >= 0 ? 1 : -1);
  const headYaw = breath * 0.18 * (rollPhase >= 0 ? 1 : -1);
  const errorLift = profile.headPitch > 0 ? breath * 0.15 : 0;
  const kickWave = Math.sin(time * profile.kickHz * Math.PI * 2);
  const kickL = kickWave * profile.kickAmp;
  const kickR = -kickWave * profile.kickAmp;
  const downL = Math.max(0, -kickWave);
  const downR = Math.max(0, kickWave);
  const dist = time * profile.speed;
  const x = LANE_START + (dist % LANE_LENGTH + LANE_LENGTH) % LANE_LENGTH;
  const bob = Math.sin(time * profile.kickHz * Math.PI * 2) * profile.kickAmp * 0.12 + Math.sin(armPhase * Math.PI * 2) * (profile.bothForward ? 8e-3 : 0.02);
  const yawWobble = Math.sin(time * 6.2) * profile.wobble;
  const rollWobble = Math.sin(time * 7.1) * profile.wobble * 0.6;
  const p = wrap01(armPhase);
  const rightEntry = !profile.bothForward && p > 0.9 && p < 0.97;
  const leftP = wrap01(armPhase + 0.5);
  const leftEntry = !profile.bothForward && leftP > 0.9 && leftP < 0.97;
  return {
    x,
    y: 0.14 + bob - Math.max(0, profile.hipDrop) * 0.22,
    z: zLane,
    bodyRoll: bodyRoll + rollWobble,
    bodyPitch: profile.pitch,
    bodyYaw: yawWobble,
    hipDrop: profile.hipDrop,
    headPitch: profile.headPitch + errorLift,
    headRoll,
    headYaw,
    leftArm,
    rightArm,
    leftLeg: {
      hip: kickL,
      knee: downL * profile.kickKnee,
      ankle: 0.15 + downL * 0.2,
      splay: profile.kickSplay
    },
    rightLeg: {
      hip: kickR,
      knee: downR * profile.kickKnee,
      ankle: 0.15 + downR * 0.2,
      splay: -profile.kickSplay
    },
    armPhase,
    phaseName: phaseName(profile, armPhase, u),
    rightEntry,
    leftEntry,
    breathing: breath > 0.35
  };
}
function wrapLaneX(x) {
  return LANE_START + (((x - LANE_START) % LANE_LENGTH + LANE_LENGTH) % LANE_LENGTH);
}
export {
  LANE_LENGTH,
  LANE_START,
  evaluatePose,
  wrapLaneX
};
