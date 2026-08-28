import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SwimmerRig from './SwimmerRig';

describe('SwimmerRig', () => {
  it('renders an explicit jointed body in a static reduced-motion pose', () => {
    render(
      <SwimmerRig
        drill="singleSwitch"
        isCorrect
        playbackSpeed={1}
        activeTag="Core rotation"
        reducedMotion
      />,
    );

    expect(screen.getByTestId('swimmer-rig')).toHaveAttribute('data-motion', 'static');
    expect(screen.getByRole('img', { name: 'Correct swimmer form' })).toBeInTheDocument();
    expect(screen.getByLabelText('lead arm')).toBeInTheDocument();
    expect(screen.getByLabelText('recovering arm')).toBeInTheDocument();
    expect(screen.getByLabelText('legs')).toBeInTheDocument();
  });

  it('labels the incorrect form for assistive technology', () => {
    render(
      <SwimmerRig
        drill="breathing"
        isCorrect={false}
        playbackSpeed={1}
        activeTag={null}
        reducedMotion
      />,
    );

    expect(screen.getByRole('img', { name: 'Incorrect swimmer form' })).toBeInTheDocument();
  });

  it('renders synchronized efficient and rushed bodies for comparison', () => {
    render(
      <SwimmerRig
        drill="comparison"
        isCorrect
        playbackSpeed={1}
        activeTag={null}
        reducedMotion
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Efficient and rushed swimmer comparison' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'efficient swimmer' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'rushed swimmer' })).toBeInTheDocument();
    expect(screen.getByLabelText('hand-entry splash')).toBeInTheDocument();
  });
});
