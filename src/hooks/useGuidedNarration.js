import { useCallback } from 'react';
import { speak } from '../lib/narration';

const PHRASES = {
  superman: 'Release the neck. Let the body lengthen quietly.',
  flutter: 'Keep the flutter tiny and relaxed.',
  chestPress: 'Press the chest gently and allow the hips to rise.',
  skating: 'Become long and narrow through the water.',
  breathing: 'Roll to breathe. Do not lift the head.',
};

export default function useGuidedNarration(enabled, voiceURI = null) {
  const speakDrill = useCallback(
    (drill) => {
      if (!enabled) return;
      speak(PHRASES[drill], { voiceURI });
    },
    [enabled, voiceURI],
  );

  return {
    speakDrill,
  };
}
