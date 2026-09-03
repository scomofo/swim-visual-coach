import { useEffect, useState } from 'react';

// Version the key because v1 marked drills complete when they were only opened.
const STORAGE_KEY = 'swim-visual-coach-progress-v2';

function readStoredProgress(initial) {
  if (typeof window === 'undefined' || !window.localStorage) return initial;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initial;
    return JSON.parse(stored);
  } catch {
    return initial;
  }
}

export default function useLessonProgress(initial = {}) {
  const [progress, setProgress] = useState(() => readStoredProgress(initial));

  useEffect(() => {
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore private-mode / quota errors; progress stays in memory.
    }
  }, [progress]);

  const markComplete = (lesson) => {
    setProgress((prev) => ({
      ...prev,
      [lesson]: true,
    }));
  };

  return {
    progress,
    markComplete,
  };
}
