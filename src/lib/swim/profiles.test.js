import { describe, expect, it } from 'vitest';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { GUIDED_SEQUENCE } from '../../hooks/useGuidedPractice';
import { PROFILES, getProfile } from './profiles';

describe('profiles', () => {
  it('covers every drill in the curriculum with correct/error variants', () => {
    for (const drill of DRILL_ORDER) {
      expect(PROFILES[drill], drill).toBeDefined();
      expect(getProfile(drill, 'correct'), `${drill}/correct`).toBeDefined();
      expect(getProfile(drill, 'error'), `${drill}/error`).toBeDefined();
    }
    expect(DRILL_ORDER).toEqual(GUIDED_SEQUENCE);
    expect(Object.keys(DRILLS)).toEqual(DRILL_ORDER);
  });

  it('throws a friendly error for unknown drills or modes', () => {
    expect(() => getProfile('butterfly', 'correct')).toThrow(/unknown drill/i);
    expect(() => getProfile('superman', 'sideways')).toThrow(/unknown mode/i);
  });
});
