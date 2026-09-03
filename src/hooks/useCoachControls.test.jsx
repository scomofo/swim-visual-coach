import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useCoachControls from './useCoachControls';

describe('useCoachControls', () => {
  it('clears active tag when drill changes', () => {
    const { result } = renderHook(() => useCoachControls());
    act(() => {
      result.current.setActiveTag('Quiet water');
    });
    expect(result.current.activeTag).toBe('Quiet water');
    act(() => {
      result.current.setDrill('flutter');
    });
    expect(result.current.drill).toBe('flutter');
    expect(result.current.activeTag).toBeNull();
  });

  it('shows celebration only on first completion of a drill', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCoachControls());
    expect(result.current.showCelebration).toBe(false);
    act(() => {
      result.current.markComplete('superman');
    });
    expect(result.current.showCelebration).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.showCelebration).toBe(false);
    vi.useRealTimers();
  });

  it('falls back to superman for unknown drill key', () => {
    const { result } = renderHook(() => useCoachControls());
    act(() => {
      // @ts-expect-error - testing defensive fallback
      result.current.setDrill('unknown-drill');
    });
    expect(result.current.currentDrill.title).toBe('Superman Glide');
  });
});
