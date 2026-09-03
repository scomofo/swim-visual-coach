import { evaluateDrag } from './drag';
import { evaluatePose } from './pose';

// Deduplicates pose/drag evaluation within the same frame.
// All pool components read the same clock.current value per frame,
// so caching by rounded time + lane avoids 3-4x redundant work.
export function createSimCache() {
  const poseCache = new Map();
  const dragCache = new Map();

  const poseKey = (profile, time, zLane) =>
    `${profile.style}:${profile.cycle}:${profile.speed}:${time.toFixed(3)}:${zLane}`;

  function getPose(profile, time, zLane = 0) {
    const key = poseKey(profile, time, zLane);
    let pose = poseCache.get(key);
    if (!pose) {
      pose = evaluatePose(profile, time, zLane);
      poseCache.set(key, pose);
      // Keep cache bounded to ~2 frames of entries (main + ghost + error x lanes).
      if (poseCache.size > 24) {
        const oldest = poseCache.keys().next().value;
        poseCache.delete(oldest);
      }
    }
    return pose;
  }

  function getDrag(profile, pose, otherTotal = null) {
    // Drag depends on live pose object identity; cache by pose reference
    // plus profile identity to avoid stale reads across frames.
    const key = `${profile.style}:${profile.cycle}`;
    const entry = dragCache.get(key);
    if (entry && entry.pose === pose && entry.otherTotal === otherTotal) {
      return entry.drag;
    }
    const drag = evaluateDrag(profile, pose, otherTotal);
    dragCache.set(key, { pose, otherTotal, drag });
    if (dragCache.size > 12) {
      const oldest = dragCache.keys().next().value;
      dragCache.delete(oldest);
    }
    return drag;
  }

  function clear() {
    poseCache.clear();
    dragCache.clear();
  }

  return { getPose, getDrag, clear };
}

// Deterministic pseudo-random for per-frame particle jitter.
// Avoids Math.random() GC churn and keeps snapshots stable in tests.
export function pseudoRandom(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}
