import { describe, expect, it } from 'vitest';
import { evaluateDrag } from './drag';
import { evaluatePose } from './pose';
import { getProfile } from './profiles';

describe('hydrodynamic drag', () => {
  it('scores a quiet Superman glide far below the rushed error', () => {
    const quiet = getProfile('superman', 'correct');
    const rushed = getProfile('superman', 'error');
    const quietDrag = evaluateDrag(quiet, evaluatePose(quiet, 1.2));
    const rushedDrag = evaluateDrag(rushed, evaluatePose(rushed, 1.2));

    expect(quietDrag.label).toBe('Quiet');
    expect(quietDrag.total).toBeLessThan(0.3);
    expect(rushedDrag.total).toBeGreaterThan(0.7);
    expect(rushedDrag.total).toBeGreaterThan(quietDrag.total);
    expect(rushedDrag.form).toBeGreaterThan(quietDrag.form);
    expect(rushedDrag.wave).toBeGreaterThan(quietDrag.wave);
  });

  it('raises form drag when the head lifts and hips sink', () => {
    const profile = getProfile('chestPress', 'correct');
    const pose = evaluatePose(profile, 0.5);
    const baseline = evaluateDrag(profile, pose);
    const leaky = evaluateDrag(profile, {
      ...pose,
      headPitch: 0.5,
      hipDrop: 0.3,
      bodyPitch: 0.2,
    });
    expect(leaky.form).toBeGreaterThan(baseline.form);
    expect(leaky.area).toBeGreaterThan(baseline.area);
  });
});
