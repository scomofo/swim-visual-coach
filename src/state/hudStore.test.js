import { describe, expect, it } from 'vitest';
import { getHudSnapshot, publishHudDrag, resetHudForTests } from './hudStore';
import { IDLE_DRAG } from '../lib/swim/drag';

describe('hudStore', () => {
  it('publishes drag reports and throttles tiny deltas', () => {
    resetHudForTests();
    expect(getHudSnapshot().drag).toBe(IDLE_DRAG);
    publishHudDrag({ ...IDLE_DRAG, total: 0.5 }, 'glide', 0);
    expect(getHudSnapshot().drag.total).toBe(0.5);
    // Tiny delta within throttle window is ignored
    publishHudDrag({ ...IDLE_DRAG, total: 0.505 }, 'glide', 0);
    expect(getHudSnapshot().drag.total).toBe(0.5);
    // Phase change forces publish
    publishHudDrag({ ...IDLE_DRAG, total: 0.505 }, 'switch', 0);
    expect(getHudSnapshot().phase).toBe('switch');
  });
});
