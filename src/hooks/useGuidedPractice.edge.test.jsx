import { describe, expect, it, vi } from 'vitest';
import useGuidedPractice from './useGuidedPractice';

describe('useGuidedPractice edge cases', () => {
  it('handles an unknown drill without advancing', () => {
    const setDrill = vi.fn();
    const markComplete = vi.fn();
    const api = useGuidedPractice({ drill: 'butterfly', setDrill, markComplete });
    expect(api.sessionStep).toBe(0);
    expect(api.isLastStep).toBe(false);
    api.advance();
    expect(setDrill).not.toHaveBeenCalled();
  });

  it('does not advance past the last step', () => {
    const setDrill = vi.fn();
    const api = useGuidedPractice({
      drill: 'comparison',
      setDrill,
      markComplete: vi.fn(),
    });
    expect(api.isLastStep).toBe(true);
    api.advance();
    expect(setDrill).not.toHaveBeenCalled();
  });
});
