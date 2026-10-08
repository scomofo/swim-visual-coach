import { act, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { createMatchMedia } from './test/setup';
import { useCoach } from './store/coach';
import { DRILLS } from './data/drills';

async function beginPractice() {
  fireEvent.click(await screen.findByRole('button', { name: 'Begin practice' }));
}

describe('App curriculum and layout', () => {
  it('keeps full instruction available and closes the notes when the lesson changes', async () => {
    render(<App />);
    await beginPractice();
    expect(screen.getByText(DRILLS.superman.description)).not.toBeVisible();
    fireEvent.click(screen.getByText('Read the full lesson'));
    expect(screen.getByText(DRILLS.superman.description)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next drill' }));
    expect(screen.getByText(DRILLS.flutter.description)).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Lazy Flutter' })).toHaveAttribute('aria-current', 'step');
  });

  it('disables the redundant ghost control and shortcut in the paired lesson', async () => {
    render(<App />);
    await beginPractice();
    fireEvent.click(screen.getByRole('button', { name: /Efficient vs Rushed/ }));
    expect(screen.getByRole('button', { name: 'Ghost', exact: true })).toBeDisabled();
    fireEvent.keyDown(document.body, { key: 'g' });
    expect(useCoach.getState().ghost).toBe(false);
  });

  it('focuses onboarding, makes the workspace inert, and keeps Tab within the dialog', async () => {
    render(<App />);
    const begin = await screen.findByRole('button', { name: 'Begin practice' });
    expect(begin).toHaveFocus();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(document.querySelector('.coach-shell')).toHaveAttribute('inert');
    const tab = createEvent.keyDown(begin, { key: 'Tab', cancelable: true });
    fireEvent(begin, tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(begin).toHaveFocus();
    fireEvent.click(begin);
    expect(document.querySelector('.coach-shell')).not.toHaveAttribute('inert');
  });

  it('only completes a drill after an explicit completion action', async () => {
    render(<App />);
    await beginPractice();

    fireEvent.click(screen.getByRole('button', { name: /Efficient vs Rushed/ }));

    expect(screen.getByText(/0\s*\/\s*14 mastered/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next drill' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Mark mastered' }));

    await waitFor(() => {
      expect(screen.getByText(/1\s*\/\s*14 mastered/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Mastered' })).toBeDisabled();
  });

  it('keeps playback available in focus mode and exits with Escape from a focused control', async () => {
    render(<App />);
    await beginPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Focus' }));

    expect(screen.getByTestId('visualization')).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Curriculum' })).not.toBeInTheDocument();
    const exit = screen.getByRole('button', { name: 'Exit focus' });
    exit.focus();
    fireEvent.keyDown(exit, { key: 'Escape' });
    expect(screen.getByRole('navigation', { name: 'Curriculum' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Focus' })).toBeInTheDocument();
  });

  it('pauses playback when the user prefers reduced motion', async () => {
    window.matchMedia = createMatchMedia(true);
    render(<App />);
    await beginPractice();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    });
    expect(useCoach.getState().reducedMotion).toBe(true);
  });

  it('responds to changes in motion preference without automatically restarting playback', async () => {
    const listeners = new Set();
    const media = {
      matches: false,
      addEventListener: (_event, callback) => listeners.add(callback),
      removeEventListener: (_event, callback) => listeners.delete(callback),
    };
    window.matchMedia = vi.fn(() => media);
    const { unmount } = render(<App />);
    await beginPractice();
    expect(useCoach.getState().playing).toBe(true);
    act(() => {
      media.matches = true;
      listeners.forEach((callback) => callback());
    });
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(useCoach.getState().reducedMotion).toBe(true);
    act(() => {
      media.matches = false;
      listeners.forEach((callback) => callback());
    });
    expect(useCoach.getState().reducedMotion).toBe(false);
    expect(useCoach.getState().playing).toBe(false);
    unmount();
    expect(listeners.size).toBe(0);
  });

  it('leaves Space on focused buttons to their native action', async () => {
    render(<App />);
    const begin = await screen.findByRole('button', { name: 'Begin practice' });
    const onboardingSpace = createEvent.keyDown(begin, { key: ' ', code: 'Space', cancelable: true });
    fireEvent(begin, onboardingSpace);
    expect(onboardingSpace.defaultPrevented).toBe(false);
    expect(useCoach.getState().playing).toBe(true);
    fireEvent.click(begin);

    const next = screen.getByRole('button', { name: 'Next drill' });
    next.focus();
    const space = createEvent.keyDown(next, { key: ' ', code: 'Space', cancelable: true });
    fireEvent(next, space);
    expect(space.defaultPrevented).toBe(false);
    expect(useCoach.getState().playing).toBe(true);

    fireEvent.click(next);
    expect(screen.getByRole('heading', { name: 'Lazy Flutter' })).toBeInTheDocument();
  });

  it('uses background shortcuts without hijacking editing, modifiers, or the onboarding dialog', async () => {
    render(<App />);
    await screen.findByRole('button', { name: 'Begin practice' });
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(useCoach.getState().drill).toBe('superman');
    await beginPractice();

    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(useCoach.getState().playing).toBe(false);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space', repeat: true });
    expect(useCoach.getState().playing).toBe(false);
    fireEvent.keyDown(document.body, { key: 'ArrowRight', ctrlKey: true });
    expect(useCoach.getState().drill).toBe('superman');
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(useCoach.getState().drill).toBe('flutter');

    const editor = document.createElement('div');
    editor.setAttribute('contenteditable', 'true');
    document.body.append(editor);
    fireEvent.keyDown(editor, { key: 'e' });
    expect(useCoach.getState().mode).toBe('correct');
    editor.remove();
  });
});
