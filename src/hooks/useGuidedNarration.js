import { useCallback, useEffect } from 'react';

const PHRASES = {
  superman: 'Release the neck. Let the body lengthen quietly.',
  flutter: 'Keep the flutter tiny and relaxed.',
  chestPress: 'Press the chest gently and allow the hips to rise.',
  skating: 'Become long and narrow through the water.',
  breathing: 'Roll to breathe. Do not lift the head.',
  singleSwitch: 'Slide the hand through the mail slot. Let the core switch you.',
  tripleSwitch: 'Switch, balance, switch, balance. Do not rush the exchange.',
  rhythm: 'Find an unhurried rhythm. Patience is speed.',
  continuousFlow: 'Connect balance, breathing, and switching into quiet flow.',
  spl: 'Count strokes as feedback. Fewer calm strokes means less drag.',
  effortless25: 'Swim the length steady and silent. Hold your calm count.',
  comparison: 'Notice quiet water versus noisy water. Choose patience.',
};

export default function useGuidedNarration(enabled) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const synth = window.speechSynthesis;
    if (!synth?.cancel) return undefined;
    return () => {
      try { synth.cancel(); } catch { /* ignore */ }
    };
  }, []);

  const speakDrill = useCallback((drill) => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth?.speak) return;

    const text = PHRASES[drill];
    if (!text) return;

    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 0.92;
      synth.speak(utterance);
    } catch {
      // Speech synthesis unavailable (private mode, no voices); stay silent.
    }
  }, [enabled]);

  return {
    speakDrill,
  };
}
