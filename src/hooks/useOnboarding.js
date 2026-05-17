import { useEffect, useState } from 'react';

const STORAGE_KEY = 'swim-visual-coach-onboarding';

export default function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);

    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    closeOnboarding,
  };
}
