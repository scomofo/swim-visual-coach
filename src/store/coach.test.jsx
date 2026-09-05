import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { LEGACY_PROGRESS_KEY, ONBOARD_KEY, PROGRESS_KEY, useCoach } from './coach';

afterEach(() => vi.restoreAllMocks());

describe('saved mastery', () => {
  it('merges previously saved v2 mastery with new v3 completions', () => {
    localStorage.setItem(ONBOARD_KEY, '1');
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify({ superman: true, flutter: true }));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ comparison: true }));
    render(<App />);

    expect(screen.getByText('3 / 12 mastered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mastered' })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY))).toEqual({
      superman: true, flutter: true, comparison: true,
    });
    expect(localStorage.getItem(LEGACY_PROGRESS_KEY)).not.toBeNull();
  });

  it.each(['null', '[]', '"bad"', '{broken'])('recovers legacy mastery when current storage contains %s', (raw) => {
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify({ superman: true, flutter: 'true', missing: true }));
    localStorage.setItem(PROGRESS_KEY, raw);
    useCoach.getState().hydrate();
    expect(useCoach.getState().completed).toEqual({ superman: true });
  });

  it('does not migrate v1 progress that counted opening a drill as mastery', () => {
    localStorage.setItem('swim-visual-coach-progress-v1', JSON.stringify({ superman: true }));
    useCoach.getState().hydrate();
    expect(useCoach.getState().completed).toEqual({});
  });

  it('allows onboarding and mastery when all storage access is denied', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage denied', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage denied', 'SecurityError');
    });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Begin practice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark mastered' }));
    expect(screen.getByText('1 / 12 mastered')).toBeInTheDocument();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('keeps migrated mastery usable when saving fails', () => {
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify({ superman: true }));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });
    useCoach.getState().hydrate();
    expect(useCoach.getState().completed).toEqual({ superman: true });
    setItem.mockRestore();
  });
});
