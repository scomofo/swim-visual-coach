import { describe, expect, it } from 'vitest';
import { evaluateDrag } from './drag';
import { LANE_LENGTH, LANE_START, evaluatePose, wrapLaneX } from './pose';
import { getProfile } from './profiles';

describe('pose', () => {
  it('wraps lane positions including negative inputs', () => {
    expect(wrapLaneX(LANE_START)).toBeCloseTo(LANE_START, 6);
    expect(wrapLaneX(LANE_START + LANE_LENGTH)).toBeCloseTo(LANE_START, 6);
    expect(wrapLaneX(LANE_START - 1)).toBeGreaterThanOrEqual(LANE_START);
    expect(wrapLaneX(LANE_START - 1)).toBeLessThan(LANE_START + LANE_LENGTH);
  });

  it('is seamless across the stroke cycle boundary', () => {
    const profile = getProfile('rhythm', 'correct');
    const a = evaluatePose(profile, 0.001);
    const b = evaluatePose(profile, profile.cycle - 0.001);
    // Positions advance along the lane, but body articulation should be close
    expect(Math.abs(a.bodyRoll - b.bodyRoll)).toBeLessThan(0.15);
    expect(a.phaseName).toBeDefined();
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
