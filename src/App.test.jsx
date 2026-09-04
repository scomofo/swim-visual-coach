import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { createMatchMedia } from './test/setup';

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
  });
});
