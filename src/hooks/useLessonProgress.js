import { useEffect, useState } from 'react';

// Version the key because v1 marked drills complete when they were only opened.
const STORAGE_KEY = 'swim-visual-coach-progress-v2';

export default function useLessonProgress(initial = {}) {
  const [progress, setProgress] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return initial;

    try {
      return JSON.parse(stored);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
