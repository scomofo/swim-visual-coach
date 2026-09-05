import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VOICE_KEY } from '../../lib/narration';
import { useCoach } from '../../store/coach';
import { VoicePicker } from './VoicePicker';

const VOICES = [
  { name: 'Alex', lang: 'en-US', voiceURI: 'alex', default: true },
  { name: 'Zoe', lang: 'en-AU', voiceURI: 'zoe', default: false },
];

describe('VoicePicker', () => {
  let synth;

  beforeEach(() => {
    synth = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => VOICES),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    window.speechSynthesis = synth;
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });

  afterEach(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it('renders nothing when the browser cannot speak', () => {
    delete window.speechSynthesis;
    const { container } = render(<VoicePicker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists voices, previews the choice, and persists it', () => {
    render(<VoicePicker />);
    const select = screen.getByRole('combobox', { name: 'Narration voice' });
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: /Auto · Alex/ })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'zoe' } });

    expect(useCoach.getState().voice).toBe('zoe');
    expect(localStorage.getItem(VOICE_KEY)).toBe('zoe');
    expect(select).toHaveValue('zoe');
    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect(synth.speak.mock.calls[0][0].voice.voiceURI).toBe('zoe');
  });

  it('restores the stored voice on hydrate', () => {
    localStorage.setItem(VOICE_KEY, 'zoe');
    useCoach.getState().hydrate();
    render(<VoicePicker />);
    expect(screen.getByRole('combobox', { name: 'Narration voice' })).toHaveValue('zoe');
  });
});
