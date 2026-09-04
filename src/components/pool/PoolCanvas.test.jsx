import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { useCoach } from '../../store/coach';
import { PoolScene } from './PoolCanvas';

vi.unmock('./PoolCanvas');

async function advance(renderer, count, dt = 0.1) {
  // Advance one complete frame at a time so the clock, rig, and camera observe
  // the same order as the real canvas (RTTR batches by subscriber otherwise).
  await ReactThreeTestRenderer.act(async () => {
    for (let i = 0; i < count; i += 1) await renderer.advanceFrames(1, dt);
  });
}

function ambientState(renderer) {
  return {
    shaders: renderer.scene.findAllByType('Mesh')
      .filter((node) => node.instance.material.uniforms?.uTime)
      .map((node) => node.instance.material.uniforms.uTime.value),
    particles: renderer.scene.findAllByType('Points')
      .map((node) => Array.from(node.instance.geometry.attributes.position.array)),
  };
}

function assertInFrame(camera, swimmer) {
  camera.updateMatrixWorld();
  swimmer.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(swimmer);
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new THREE.Vector3(x, y, z).project(camera);
        expect(Math.abs(projected.x), `${swimmer.name} horizontal framing`).toBeLessThan(1);
        expect(Math.abs(projected.y), `${swimmer.name} vertical framing`).toBeLessThan(1);
        expect(Math.abs(projected.z), `${swimmer.name} depth framing`).toBeLessThan(1);
      }
    }
  }
}

describe('3D playback', () => {
  it('freezes the swimmer, water, bubbles, splash, and wake when paused', async () => {
    useCoach.setState({ drill: 'rhythm' });
    const renderer = await ReactThreeTestRenderer.create(<PoolScene />);
    try {
      await advance(renderer, 15);
      await ReactThreeTestRenderer.act(async () => useCoach.getState().setPlaying(false));
      const swimmer = renderer.scene.findByProps({ name: 'efficient-swimmer' }).instance;
      const position = swimmer.position.clone();
      const frozen = ambientState(renderer);
      expect(frozen.shaders).toHaveLength(2);
      expect(frozen.particles).toHaveLength(3);
      await advance(renderer, 15);
      expect(ambientState(renderer)).toEqual(frozen);
      expect(swimmer.position.equals(position)).toBe(true);
    } finally {
      await renderer.unmount();
    }
  });

  it('keeps ambient effects still under reduced motion, including deliberate playback', async () => {
    useCoach.setState({ drill: 'rhythm' });
    useCoach.getState().setReducedMotion(true);
    const renderer = await ReactThreeTestRenderer.create(<PoolScene />);
    try {
      await advance(renderer, 1);
      const swimmer = renderer.scene.findByProps({ name: 'efficient-swimmer' }).instance;
      const position = swimmer.position.clone();
      const frozen = ambientState(renderer);
      await advance(renderer, 15);
      expect(ambientState(renderer)).toEqual(frozen);
      expect(swimmer.position.equals(position)).toBe(true);

      await ReactThreeTestRenderer.act(async () => useCoach.getState().setPlaying(true));
      await advance(renderer, 15);
      expect(swimmer.position.equals(position)).toBe(false);
      expect(ambientState(renderer)).toEqual(frozen);
    } finally {
      await renderer.unmount();
    }
  });

  it('applies the selected playback speed to water as well as the swimmer', async () => {
    useCoach.setState({ speed: 0.5 });
    const renderer = await ReactThreeTestRenderer.create(<PoolScene />);
    try {
      await advance(renderer, 10);
      for (const time of ambientState(renderer).shaders) expect(time).toBeCloseTo(0.5);
      await ReactThreeTestRenderer.act(async () => useCoach.getState().setSpeed(1.5));
      await advance(renderer, 10);
      for (const time of ambientState(renderer).shaders) expect(time).toBeCloseTo(2);
    } finally {
      await renderer.unmount();
    }
  });
});

describe('comparison framing', () => {
  it('keeps the ideal ghost alongside a common-error swimmer without changing its cadence', async () => {
    useCoach.setState({ drill: 'rhythm', mode: 'error', ghost: true });
    const camera = new THREE.PerspectiveCamera(34, 2, 0.12, 90);
    const renderer = await ReactThreeTestRenderer.create(<PoolScene />, { camera, width: 1200, height: 600 });
    try {
      const swimmer = renderer.scene.findByProps({ name: 'error-swimmer' }).instance;
      const ghost = renderer.scene.findByProps({ name: 'ghost-swimmer' }).instance;
      await advance(renderer, 120);
      expect(swimmer.position.x).toBeCloseTo(ghost.position.x);
      expect(swimmer.children[0].rotation.x).not.toBeCloseTo(ghost.children[0].rotation.x);
      assertInFrame(camera, swimmer);
      assertInFrame(camera, ghost);
    } finally {
      await renderer.unmount();
    }
  });

  it.each(['quarter', 'side', 'overhead', 'front', 'under'])('keeps both swimmers visible across lane wraps in %s view', async (view) => {
    for (const width of [1200, 300]) {
      useCoach.setState({ drill: 'comparison', camera: view });
      const camera = new THREE.PerspectiveCamera(34, width / 600, 0.12, 90);
      const renderer = await ReactThreeTestRenderer.create(<PoolScene />, { camera, width, height: 600 });
      try {
        const quiet = renderer.scene.findByProps({ name: 'efficient-swimmer' }).instance;
        const rushed = renderer.scene.findByProps({ name: 'error-swimmer' }).instance;
        // More than two lengths at normal speed catches the original drift and
        // the camera flight that used to happen when the lane wrapped.
        for (let frame = 0; frame < 360; frame += 1) {
          await advance(renderer, 1);
          if (frame === 0) continue;
          expect(rushed.position.x).toBeCloseTo(quiet.position.x);
          assertInFrame(camera, quiet);
          assertInFrame(camera, rushed);
        }
        expect(useCoach.getState().hudDrag.otherTotal).toBeGreaterThan(useCoach.getState().hudDrag.total);
      } finally {
        await renderer.unmount();
      }
    }
  });
});
