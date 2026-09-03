import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
function writeViewOffset(view, t, desired, look) {
  switch (view) {
    case "quarter":
      desired.set(t.x - 1.55, 0.92, 2.45);
      look.set(t.x + 0.7, 0.06, t.z);
      break;
    case "overhead":
      desired.set(t.x + 0.15, 4.8, 0.08);
      look.set(t.x + 0.2, 0, t.z);
      break;
    case "front":
      desired.set(t.x + 2.85, 0.48, 0.95);
      look.set(t.x + 0.1, 0.06, t.z);
      break;
    case "under":
      desired.set(t.x - 0.15, -0.95, 2.05);
      look.set(t.x + 0.95, 0.04, t.z);
      break;
    case "side":
    default:
      desired.set(t.x - 0.2, 0.68, 3.05);
      look.set(t.x + 0.5, 0.05, t.z);
      break;
  }
}
function CameraRig({
  view,
  target
}) {
  const { camera } = useThree();
  const inited = useRef(false);
  const lastView = useRef(view);
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    const t = target.current;
    writeViewOffset(view, t, desired.current, look.current);
    if (!inited.current) {
      camera.position.copy(desired.current);
      currentLook.current.copy(look.current);
      camera.lookAt(currentLook.current);
      inited.current = true;
      lastView.current = view;
      return;
    }
    const switched = lastView.current !== view;
    lastView.current = view;
    const k = switched ? 8.5 : view === "overhead" ? 3.2 : 4.8;
    const alpha = 1 - Math.exp(-k * d);
    camera.position.lerp(desired.current, alpha);
    currentLook.current.lerp(look.current, alpha);
    camera.lookAt(currentLook.current);
  });
  return null;
}
export {
  CameraRig
};
