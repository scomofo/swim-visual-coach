import { useCallback } from 'react';

const PHRASES = {
  superman: 'Release the neck. Let the body lengthen quietly.',
  flutter: 'Keep the flutter tiny and relaxed.',
  chestPress: 'Press the chest gently and allow the hips to rise.',
  skating: 'Become long and narrow through the water.',
  breathing: 'Roll to breathe. Do not lift the head.',
};

export default function useGuidedNarration(enabled) {
  const speakDrill = useCallback((drill) => {
    if (!enabled || !window.speechSynthesis) return;

    const text = PHRASES[drill];

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 0.92;

    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  return {
    speakDrill,
  };
}
