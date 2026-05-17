import { useEffect, useState } from 'react';

export default function usePracticeTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(active);

  useEffect(() => {
    setRunning(active);
  }, [active]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const reset = () => setSeconds(0);

  return {
    seconds,
    running,
    setRunning,
    reset,
  };
}
