import { useEffect, useState } from 'react';

export default function usePracticeTimer(active) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(active);

  // Sync running state with active prop
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    setRunning(active);
  }

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
