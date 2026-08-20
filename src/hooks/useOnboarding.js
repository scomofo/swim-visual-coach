import { useState } from 'react';

const STORAGE_KEY = 'swim-visual-coach-onboarding';

export default function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(STORAGE_KEY);
    }
    return false;
  });

  const closeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    closeOnboarding,
  };
}
