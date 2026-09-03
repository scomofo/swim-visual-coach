import { useEffect, useState } from 'react';

export default function usePerformanceMode() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setReducedMotion(media.matches);
    };

    update();

    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => {
        media.removeEventListener('change', update);
      };
    }
    // Safari < 14 fallback
    media.addListener(update);
    return () => {
      media.removeListener(update);
    };
  }, []);

  return {
    reducedMotion,
  };
}
