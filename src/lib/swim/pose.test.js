import { describe, expect, it } from 'vitest';
import { evaluateDrag } from './drag';
import { LANE_LENGTH, LANE_START, evaluatePose, wrapLaneX } from './pose';
import { getProfile, PROFILES } from './profiles';

describe('pose', () => {
  it('wraps lane positions including negative inputs', () => {
    expect(wrapLaneX(LANE_START)).toBeCloseTo(LANE_START, 6);
    expect(wrapLaneX(LANE_START + LANE_LENGTH)).toBeCloseTo(LANE_START, 6);
    expect(wrapLaneX(LANE_START - 1)).toBeGreaterThanOrEqual(LANE_START);
    expect(wrapLaneX(LANE_START - 1)).toBeLessThan(LANE_START + LANE_LENGTH);
  });

  it.each(Object.keys(PROFILES))('keeps %s articulation continuous across consecutive loops', (drill) => {
    for (const mode of ['correct', 'error']) {
      const profile = getProfile(drill, mode);
      for (const cycle of [1, 2]) {
        const before = evaluatePose(profile, profile.cycle * cycle - 0.000001);
        const after = evaluatePose(profile, profile.cycle * cycle + 0.000001);
        for (const joint of ['bodyRoll', 'headRoll', 'headYaw']) {
          expect(Math.abs(after[joint] - before[joint]), `${mode}/${cycle}/${joint}`).toBeLessThan(0.01);
        }
        for (const side of ['leftArm', 'rightArm']) {
          for (const joint of ['rx', 'ry', 'rz', 'elbow', 'wrist']) {
            expect(Math.abs(after[side][joint] - before[side][joint]), `${mode}/${cycle}/${side}/${joint}`).toBeLessThan(0.01);
          }
        }
      }
    }
  });

  it.each(['correct', 'error'])('shows a complete head turn on both skates in the breathing drill (%s)', (mode) => {
    const profile = getProfile('breathing', mode);
    for (const cycle of [0, 1]) {
      const before = evaluatePose(profile, profile.cycle * (cycle + 0.05));
      const breath = evaluatePose(profile, profile.cycle * (cycle + 0.3));
      const after = evaluatePose(profile, profile.cycle * (cycle + 0.5));
      expect(before.breathing).toBe(false);
      expect(breath.breathing).toBe(true);
      expect(breath.phaseName).toBe('Breath');
      expect(Math.abs(breath.headRoll)).toBeGreaterThan(0.4);
      expect(breath.headRoll * breath.bodyRoll).toBeGreaterThan(0);
      expect(breath.rightArm).toEqual(before.rightArm);
      expect(after.headRoll).toBeCloseTo(0);
      expect(after.breathing).toBe(false);
    }
  });

  it('always returns finite drag numbers in range', () => {
    for (const drill of ['superman', 'skating', 'rhythm', 'comparison']) {
      for (const mode of ['correct', 'error']) {
        const profile = getProfile(drill, mode);
        for (const t of [0, 0.7, 2.3]) {
          const drag = evaluateDrag(profile, evaluatePose(profile, t));
          for (const k of ['form', 'wave', 'skin', 'total', 'force', 'area']) {
            expect(Number.isFinite(drag[k]), `${drill}/${mode}/${t}/${k}`).toBe(true);
            expect(drag[k]).toBeGreaterThanOrEqual(0);
            expect(drag[k]).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });
});
