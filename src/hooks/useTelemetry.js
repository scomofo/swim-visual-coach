import { useEffect, useState } from 'react';

export default function useTelemetry(drill) {
  const [sessionStart] = useState(() => Date.now());

  const [metrics, setMetrics] = useState({
    elapsedSeconds: 0,
    drillChanges: 0,
    estimatedFocusScore: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - sessionStart) / 1000
      );

      setMetrics((prev) => ({
        ...prev,
        elapsedSeconds,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Track drill changes
  const [prevDrillId, setPrevDrillId] = useState(drill);
  if (drill !== prevDrillId) {
    setPrevDrillId(drill);
    setMetrics((prev) => ({
      ...prev,
      drillChanges: prev.drillChanges + 1,
    }));
  }

  return metrics;
}
