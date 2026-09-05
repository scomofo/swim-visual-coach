import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  VOICE_KEY,
  narrationVoices,
  pickDefaultVoice,
  resolveVoice,
  speak,
  loadStoredVoice,
  storeVoice,
} from './narration';

const VOICES = [
  { name: 'Zoe', lang: 'en-AU', voiceURI: 'zoe', default: false },
  { name: 'Amelie', lang: 'fr-FR', voiceURI: 'amelie', default: false },
  { name: 'Microsoft Aria Online (Natural)', lang: 'en-US', voiceURI: 'aria', default: false },
  { name: 'Alex', lang: 'en-US', voiceURI: 'alex', default: true },
];

describe('narration voices', () => {
  it('lists English voices sorted by name', () => {
    expect(narrationVoices(VOICES).map((v) => v.voiceURI)).toEqual(['alex', 'aria', 'zoe']);
  });

  it('falls back to every voice when none are English', () => {
    const french = VOICES.filter((v) => v.lang === 'fr-FR');
    expect(narrationVoices(french)).toEqual(french);
  });

  it('prefers natural-sounding voices for the automatic pick', () => {
    expect(pickDefaultVoice(VOICES).voiceURI).toBe('aria');
  });

  it('prefers the browser default when nothing nicer is available', () => {
    const plain = VOICES.filter((v) => v.voiceURI !== 'aria');
    expect(pickDefaultVoice(plain).voiceURI).toBe('alex');
    expect(pickDefaultVoice([])).toBeNull();
  });

  it('resolves a stored voice and falls back when it is missing', () => {
    expect(resolveVoice('zoe', VOICES).voiceURI).toBe('zoe');
    expect(resolveVoice('gone', VOICES).voiceURI).toBe('aria');
    expect(resolveVoice(null, VOICES).voiceURI).toBe('aria');
  });

  it('persists the chosen voice in localStorage', () => {
    storeVoice('zoe');
    expect(localStorage.getItem(VOICE_KEY)).toBe('zoe');
    expect(loadStoredVoice()).toBe('zoe');
    storeVoice(null);
    expect(loadStoredVoice()).toBeNull();
  });
});

describe('speak', () => {
  let synth;

  beforeEach(() => {
    synth = { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn(() => VOICES) };
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

  it('speaks with the selected voice and coaching cadence', () => {
    const utterance = speak('Roll to breathe.', { voiceURI: 'zoe' });
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalledWith(utterance);
    expect(utterance.voice.voiceURI).toBe('zoe');
    expect(utterance.lang).toBe('en-AU');
    expect(utterance.rate).toBeCloseTo(0.88);
    expect(utterance.pitch).toBeCloseTo(0.92);
  });

  it('uses the automatic voice when none is selected', () => {
    const utterance = speak('Roll to breathe.');
    expect(utterance.voice.voiceURI).toBe('aria');
  });

  it('does nothing without text or speech support', () => {
    expect(speak('')).toBeNull();
    delete window.speechSynthesis;
    expect(speak('hi')).toBeNull();
  });
});
