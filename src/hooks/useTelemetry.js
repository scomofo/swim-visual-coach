import { useEffect, useRef, useState } from 'react';

export default function useTelemetry(drill) {
  const sessionStart = useRef(Date.now());
  const [metrics, setMetrics] = useState({
    elapsedSeconds: 0,
    drillChanges: 0,
    estimatedFocusScore: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStart.current) / 1000
      );

      setMetrics((prev) => ({
        ...prev,
        elapsedSeconds,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMetrics((prev) => ({
      ...prev,
      drillChanges: prev.drillChanges + 1,
    }));
  }, [drill]);

  return metrics;
}
