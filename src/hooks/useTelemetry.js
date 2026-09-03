import { useEffect, useRef, useState } from 'react';

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

  // Track drill changes without setting state during render
  const prevDrillRef = useRef(drill);
  useEffect(() => {
    if (drill !== prevDrillRef.current) {
      prevDrillRef.current = drill;
      setMetrics((prev) => ({
        ...prev,
        drillChanges: prev.drillChanges + 1,
      }));
    }
  }, [drill]);

  return metrics;
}
