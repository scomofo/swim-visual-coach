import { describe, expect, it } from 'vitest';
import { DRILL_ORDER } from '../data/drills';
import {
  applyEasing,
  DRILL_POSES,
  getBodyRotation,
  getPose,
  getTravel,
  getTravelAtProgress,
  smoothstep,
} from './motion';

const JOINT_KEYS = [
  'bodyRot',
  'shoulderRot',
  'headRot',
  'hipY',
  'leadArm',
  'recoverArm',
  'elbow',
  'kickAmp',
  'splash',
];

describe('pose timelines', () => {
  it('defines complete correct and incorrect timelines for every drill', () => {
    expect(Object.keys(DRILL_POSES)).toEqual(DRILL_ORDER);

    Object.values(DRILL_POSES).forEach((motion) => {
      expect(motion.duration).toBeGreaterThan(0);

      ['correct', 'incorrect'].forEach((mode) => {
        expect(motion[mode][0].t).toBe(0);
        expect(motion[mode].at(-1).t).toBe(1);
        motion[mode].forEach((keyframe) => {
          expect(['glide', 'switch', 'easeIn', 'easeOut', 'easeInOut']).toContain(keyframe.ease);
          JOINT_KEYS.forEach((key) => expect(keyframe[key]).toEqual(expect.any(Number)));
          expect(keyframe.splash).toBeGreaterThanOrEqual(0);
          expect(keyframe.splash).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  it('uses the destination phase easing between neighboring keyframes', () => {
    expect(smoothstep(0.5)).toBe(0.5);
    expect(applyEasing('easeOut', 0.5)).toBe(0.875);
    expect(applyEasing('glide', 0.25)).toBeLessThan(smoothstep(0.25));
    expect(getPose('chestPress', true, 0.175).hipY).toBeCloseTo(-5.5);
  });

  it('peaks splash and shoulder lead around a correct switch entry', () => {
    const entry = getPose('singleSwitch', true, 0.88);

    expect(entry.splash).toBe(1);
    expect(Math.abs(entry.shoulderRot)).toBeGreaterThan(Math.abs(entry.bodyRot));
  });

  it('makes efficient and inefficient form measurably distinct', () => {
    const correct = getPose('flutter', true, 0.5);
    const incorrect = getPose('flutter', false, 0.5);

    expect(correct.hipY).toBeLessThan(incorrect.hipY);
    expect(correct.kickAmp).toBeLessThan(incorrect.kickAmp);
    expect(correct.headRot).toBeGreaterThan(incorrect.headRot);
  });

  it('retains the legacy motion helpers while exposing interpolated travel', () => {
    expect(getBodyRotation('skating', true, 0.5)).toBe(-35);
    expect(getTravel('continuousFlow', true)).toEqual([0, 96]);
    expect(getTravelAtProgress('continuousFlow', true, 0.5)).toBe(48);
  });
});
