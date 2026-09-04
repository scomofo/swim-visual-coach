import { useFrame } from '@react-three/fiber';
import { useCoach } from '../store/coach';

// All time-based visuals use the same pause and speed controls. Reduced-motion
// users can deliberately play the instructional pose without ambient effects.
export function usePlaybackFrame(callback, { ambient = false, priority = 0 } = {}) {
  const playing = useCoach((s) => s.playing);
  const speed = useCoach((s) => s.speed);
  const reducedMotion = useCoach((s) => s.reducedMotion);

  useFrame((state, dt) => {
    if (!playing || (ambient && reducedMotion)) return;
    callback(state, Math.min(dt, 0.1) * speed);
  }, priority);
}
