export const VOICE_KEY = 'swim-visual-coach-voice-v1';

export const NARRATION_RATE = 0.88;
export const NARRATION_PITCH = 0.92;

/** Voice names that tend to sound most natural, in order of preference. */
const PREFERRED_NAMES = [
  /natural/i,
  /premium/i,
  /enhanced/i,
  /neural/i,
  /google (uk|us) english/i,
  /^samantha$/i,
  /^daniel$/i,
  /^karen$/i,
  /^moira$/i,
];

export function hasSpeech() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

/** Return every voice the browser currently exposes. May be empty until `voiceschanged` fires. */
export function listVoices() {
  if (!hasSpeech()) return [];
  try {
    return window.speechSynthesis.getVoices() ?? [];
  } catch {
    return [];
  }
}

/** English voices first (sorted by name); falls back to every voice when there are none in English. */
export function narrationVoices(voices = listVoices()) {
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang ?? ''));
  const pool = english.length ? english : voices;
  return [...pool].sort((a, b) => a.name.localeCompare(b.name));
}

/** Pick the nicest-sounding available voice when the user has not chosen one. */
export function pickDefaultVoice(voices = listVoices()) {
  const candidates = narrationVoices(voices);
  if (!candidates.length) return null;
  for (const pattern of PREFERRED_NAMES) {
    const match = candidates.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return candidates.find((v) => v.default) ?? candidates[0];
}

/** Resolve a stored voice URI to a voice object, or the automatic pick when unset or unavailable. */
export function resolveVoice(voiceURI, voices = listVoices()) {
  if (voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  return pickDefaultVoice(voices);
}

/** Subscribe to voice availability; browsers often load voices asynchronously. */
export function onVoicesChanged(callback) {
  if (!hasSpeech()) return () => {};
  const synth = window.speechSynthesis;
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', callback);
    return () => synth.removeEventListener('voiceschanged', callback);
  }
  const previous = synth.onvoiceschanged;
  synth.onvoiceschanged = callback;
  return () => {
    if (synth.onvoiceschanged === callback) synth.onvoiceschanged = previous ?? null;
  };
}

export function cancelSpeech() {
  if (!hasSpeech()) return;
  window.speechSynthesis.cancel();
}

/** Speak `text` with the app's coaching cadence and the selected voice. Returns the utterance or null. */
export function speak(text, { voiceURI = null, rate = NARRATION_RATE, pitch = NARRATION_PITCH } = {}) {
  if (!text || !hasSpeech()) return null;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voice = resolveVoice(voiceURI);
  if (voice) {
    utterance.voice = voice;
    if (voice.lang) utterance.lang = voice.lang;
  }
  utterance.rate = rate;
  utterance.pitch = pitch;

  synth.speak(utterance);
  return utterance;
}

export function loadStoredVoice() {
  try {
    return localStorage.getItem(VOICE_KEY) || null;
  } catch {
    return null;
  }
}

export function storeVoice(voiceURI) {
  try {
    if (voiceURI) localStorage.setItem(VOICE_KEY, voiceURI);
    else localStorage.removeItem(VOICE_KEY);
  } catch {
    /* ignore quota */
  }
}
