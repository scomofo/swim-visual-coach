import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useGuidedPractice, { GUIDED_SEQUENCE } from './useGuidedPractice';

describe('useGuidedPractice', () => {
  it('includes the comparison drill as the twelfth and final step', () => {
    const setDrill = vi.fn();
    const markComplete = vi.fn();
    const { result } = renderHook(() => useGuidedPractice({
      drill: 'comparison',
      setDrill,
      markComplete,
    }));

    expect(GUIDED_SEQUENCE).toHaveLength(12);
    expect(result.current.sessionStep).toBe(12);
    expect(result.current.totalSteps).toBe(12);
    expect(result.current.isLastStep).toBe(true);

    act(() => result.current.advance());
    expect(setDrill).not.toHaveBeenCalled();

    act(() => result.current.complete());
    expect(markComplete).toHaveBeenCalledWith('comparison');
  });

  it('advances without completing the next drill automatically', () => {
    const setDrill = vi.fn();
    const markComplete = vi.fn();
    const { result } = renderHook(() => useGuidedPractice({
      drill: 'superman',
      setDrill,
      markComplete,
    }));

    act(() => result.current.advance());

    expect(setDrill).toHaveBeenCalledWith('flutter');
    expect(markComplete).not.toHaveBeenCalled();
  });
});
