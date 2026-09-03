import { useState } from 'react';

const STORAGE_KEY = 'swim-visual-coach-onboarding';

function hasSeenOnboarding() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return true;
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return true;
  }
}

export default function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());

  const closeOnboarding = () => {
    try {
      window.localStorage?.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors; just hide the modal.
    }
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    closeOnboarding,
  };
}
