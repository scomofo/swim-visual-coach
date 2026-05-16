import { useEffect, useState } from 'react';

const STORAGE_KEY = 'swim-visual-coach-progress';

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
