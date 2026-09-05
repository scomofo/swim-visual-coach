import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { evaluateDrag } from "../../lib/swim/drag";
import { evaluatePose } from "../../lib/swim/pose";
import { usePlaybackFrame } from "../../hooks/usePlaybackFrame";
function Bubbles({
  clock: _clock,
  profile,
  target
}) {
  const ref = useRef(null);
  const n = 64;
  const positions = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = Math.random() * 22;
      a[i * 3 + 1] = -Math.random() * 2.1;
      a[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    return a;
  }, []);
  usePlaybackFrame((_, dt) => {
    const points = ref.current;
    if (!points) return;
    const arr = points.geometry.attributes.position.array;
    const d = dt;
    const t = target.current;
    const intensity = 0.35 + profile.splash * 0.8;
    for (let i = 0; i < n; i++) {
      arr[i * 3 + 1] += d * (0.12 + i % 7 * 0.025) * intensity;
      if (arr[i * 3 + 1] > 0.04) {
        arr[i * 3] = t.x + (Math.random() - 0.5) * 1.6;
        arr[i * 3 + 1] = -1.8 - Math.random() * 0.4;
        arr[i * 3 + 2] = t.z + (Math.random() - 0.5) * 0.7;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
  }, { ambient: true });
  return <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
    color="#d7eef0"
    size={0.035}
    transparent
    opacity={0.45}
    sizeAttenuation
    depthWrite={false}
  />
    </points>;
}
function Splash({
  clock,
  profile,
  zLane = 0
}) {
  const ref = useRef(null);
  const n = 36;
  const positions = useMemo(() => new Float32Array(n * 3), []);
  const velocities = useRef(new Float32Array(n * 3));
  const life = useRef(new Float32Array(n));
  const prevRight = useRef(false);
  const prevLeft = useRef(false);
  usePlaybackFrame((_, dt) => {
    const points = ref.current;
    if (!points) return;
    const pose = evaluatePose(profile, clock.current, zLane);
    const d = dt;
    const arr = points.geometry.attributes.position.array;
    const vel = velocities.current;
    const burst = (x, z) => {
      for (let i = 0; i < n; i++) {
        if (life.current[i] > 0.05) continue;
        arr[i * 3] = x;
        arr[i * 3 + 1] = 0.02;
        arr[i * 3 + 2] = z + (Math.random() - 0.5) * 0.08;
        vel[i * 3] = (Math.random() - 0.3) * 0.6;
        vel[i * 3 + 1] = 0.4 + Math.random() * 0.7;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        life.current[i] = 1;
      }
    };
    if (pose.rightEntry && !prevRight.current && profile.splash > 0.08) {
      burst(pose.x + 0.85, pose.z + 0.18);
    }
    if (pose.leftEntry && !prevLeft.current && profile.splash > 0.08) {
      burst(pose.x + 0.85, pose.z - 0.18);
    }
    prevRight.current = pose.rightEntry;
    prevLeft.current = pose.leftEntry;
    for (let i = 0; i < n; i++) {
      if (life.current[i] <= 0) {
        arr[i * 3 + 1] = -10;
        continue;
      }
      vel[i * 3 + 1] -= 2.4 * d;
      arr[i * 3] += vel[i * 3] * d;
      arr[i * 3 + 1] += vel[i * 3 + 1] * d;
      arr[i * 3 + 2] += vel[i * 3 + 2] * d;
      life.current[i] -= d * (1.6 + (1 - profile.splash));
    }
    points.geometry.attributes.position.needsUpdate = true;
  }, { ambient: true });
  return <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
    color="#e7f4f4"
    size={0.05}
    transparent
    opacity={0.55}
    depthWrite={false}
  />
    </points>;
}
function Wake({
  clock,
  profile,
  zLane = 0
}) {
  const ref = useRef(null);
  const mat = useRef(null);
  const n = 96;
  const positions = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = -4;
      a[i * 3 + 1] = -8;
      a[i * 3 + 2] = 0;
    }
    return a;
  }, []);
  const life = useRef(new Float32Array(n));
  const spawn = useRef(0);
  usePlaybackFrame((_, dt) => {
    const points = ref.current;
    if (!points) return;
    const pose = evaluatePose(profile, clock.current, zLane);
    const drag = evaluateDrag(profile, pose);
    const d = dt;
    const arr = points.geometry.attributes.position.array;
    const spread = 0.08 + drag.area * 0.55 + drag.wave * 0.35;
    const rate = 8 + drag.total * 42;
    spawn.current += rate * d;
    while (spawn.current >= 1) {
      spawn.current -= 1;
      let slot = 0;
      let oldest = 1;
      for (let i = 0; i < n; i++) {
        if (life.current[i] < oldest) {
          oldest = life.current[i];
          slot = i;
        }
      }
      const side = (Math.random() - 0.5) * spread;
      arr[slot * 3] = pose.x - 0.35 - Math.random() * 0.2;
      arr[slot * 3 + 1] = pose.y - 0.08 - drag.form * 0.18 + Math.random() * 0.06;
      arr[slot * 3 + 2] = pose.z + side;
      life.current[slot] = 1;
    }
    const drift = 0.55 + drag.total * 0.7;
    for (let i = 0; i < n; i++) {
      if (life.current[i] <= 0) {
        arr[i * 3 + 1] = -8;
        continue;
      }
      arr[i * 3] -= drift * d;
      arr[i * 3 + 1] += (Math.random() - 0.5) * drag.wave * 0.08;
      arr[i * 3 + 2] += (Math.random() - 0.5) * drag.form * 0.05;
      life.current[i] -= d * (0.35 + (1 - drag.total) * 0.45);
    }
    points.geometry.attributes.position.needsUpdate = true;
    if (mat.current) {
      mat.current.size = 0.028 + drag.total * 0.045;
      mat.current.opacity = 0.22 + drag.total * 0.4;
      mat.current.color.set(drag.total > 0.55 ? "#d4a07a" : "#b7ddd8");
    }
  }, { ambient: true });
  return <points ref={ref} renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
    ref={mat}
    color="#b7ddd8"
    size={0.03}
    transparent
    opacity={0.3}
    sizeAttenuation
    depthWrite={false}
  />
    </points>;
}
function FrontalArea({
  clock,
  profile,
  zLane = 0,
  visible
}) {
  const plate = useRef(null);
  const mat = useRef(null);
  useFrame(() => {
    const mesh = plate.current;
    if (!mesh) return;
    mesh.visible = visible;
    if (!visible) return;
    const pose = evaluatePose(profile, clock.current, zLane);
    const drag = evaluateDrag(profile, pose);
    mesh.position.set(pose.x + 1.05, pose.y + 0.02, pose.z);
    const h = 0.2 + drag.area * 0.55;
    const w = 0.16 + drag.area * 0.5;
    mesh.scale.set(1, h / 0.5, w / 0.5);
    if (mat.current) {
      mat.current.color.set(drag.area > 0.5 ? "#d4a07a" : "#8fd0c8");
      mat.current.opacity = 0.14 + drag.area * 0.18;
    }
  });
  if (!visible) return null;
  return <mesh ref={plate} rotation={[0, Math.PI / 2, 0]} renderOrder={3}>
      <circleGeometry args={[0.5, 28]} />
      <meshBasicMaterial
    ref={mat}
    color="#8fd0c8"
    transparent
    opacity={0.18}
    depthWrite={false}
    side={THREE.DoubleSide}
  />
    </mesh>;
}
function GuideLine({
  target,
  visible
}) {
  const ref = useRef(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = target.current.x;
    ref.current.visible = visible;
  });
  if (!visible) return null;
  return <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[8, 0.01, 0]}>
      <planeGeometry args={[3.8, 0.012]} />
      <meshBasicMaterial color="#8fd0c8" transparent opacity={0.45} />
    </mesh>;
}
export {
  Bubbles,
  FrontalArea,
  GuideLine,
  Splash,
  Wake
};
