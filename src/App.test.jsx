import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { createMatchMedia } from './test/setup';

describe('App curriculum and layout', () => {
  it('only completes a drill after an explicit completion action', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Begin Practice' }));
    fireEvent.click(screen.getByRole('button', { name: /Efficient vs Rushed/ }));

    expect(await screen.findByText('Step 12 of 12')).toBeInTheDocument();
    expect(screen.getByText(/0\s*\/\s*12 completed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Final Step' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Complete Drill' }));

    await waitFor(() => {
      expect(screen.getByText(/1\s*\/\s*12 completed/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Drill Completed' })).toBeDisabled();
  });

  it('uses a viewport-relative focus layout without a fixed inner scene', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Begin Practice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Focus Mode' }));

    const visualization = screen.getByTestId('visualization');
    expect(visualization.className).toContain('h-[calc(100dvh-7rem)]');
    expect(visualization.className).toContain('min-h-[420px]');
    expect(visualization.firstElementChild?.nextElementSibling?.className).toContain('h-full');
  });

  it('propagates the reduced-motion preference to continuous visuals', async () => {
    window.matchMedia = createMatchMedia(true);
    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
    });
    expect(document.querySelectorAll('[data-motion="static"]')).toHaveLength(2);
  });
});
