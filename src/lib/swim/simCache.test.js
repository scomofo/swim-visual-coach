import { describe, expect, it } from 'vitest';
import { createSimCache } from './simCache';
import { getProfile } from './profiles';

describe('simCache', () => {
  it('dedupes pose evaluation within the same frame', () => {
    const sim = createSimCache();
    const profile = getProfile('superman', 'correct');
    const a = sim.getPose(profile, 1.234, 0);
    const b = sim.getPose(profile, 1.234, 0);
    expect(a).toBe(b);
  });

  it('returns distinct poses for distinct lanes', () => {
    const sim = createSimCache();
    const profile = getProfile('comparison', 'correct');
    const a = sim.getPose(profile, 2.5, -0.72);
    const b = sim.getPose(profile, 2.5, 0.72);
    expect(a).not.toBe(b);
    expect(a.z).not.toBe(b.z);
  });

  it('caches drag by pose identity', () => {
    const sim = createSimCache();
    const profile = getProfile('rhythm', 'correct');
    const pose = sim.getPose(profile, 3.1, 0);
    const a = sim.getDrag(profile, pose);
    const b = sim.getDrag(profile, pose);
    expect(a).toBe(b);
  });
});
