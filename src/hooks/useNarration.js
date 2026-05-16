import { useCallback, useRef, useState } from 'react';

export default function useNarration() {
  const utteranceRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const speak = useCallback((text) => {
    if (!enabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.9;

    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return {
    enabled,
    setEnabled,
    speak,
    stop,
  };
}
