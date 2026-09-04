import { act, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { createMatchMedia } from './test/setup';
import { useCoach } from './store/coach';

async function beginPractice() {
  fireEvent.click(await screen.findByRole('button', { name: 'Begin practice' }));
}

describe('App curriculum and layout', () => {
  it('only completes a drill after an explicit completion action', async () => {
    render(<App />);
    await beginPractice();

    fireEvent.click(screen.getByRole('button', { name: /Efficient vs Rushed/ }));

    expect(screen.getByText(/0\s*\/\s*12 mastered/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next drill' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Mark mastered' }));

    await waitFor(() => {
      expect(screen.getByText(/1\s*\/\s*12 mastered/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Mastered' })).toBeDisabled();
  });

  it('uses a viewport-relative focus layout', async () => {
    render(<App />);
    await beginPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Focus' }));

    const visualization = screen.getByTestId('visualization');
    expect(visualization.className).toContain('h-[calc(100dvh-9.5rem)]');
    expect(visualization.className).toContain('min-h-[420px]');
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
