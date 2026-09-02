import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
const _desired = new THREE.Vector3();
const _look = new THREE.Vector3();
const _currentLook = new THREE.Vector3();
function viewOffset(view, t) {
  switch (view) {
    case "quarter":
      _desired.set(t.x - 1.55, 0.92, 2.45);
      _look.set(t.x + 0.7, 0.06, t.z);
      break;
    case "overhead":
      _desired.set(t.x + 0.15, 4.8, 0.08);
      _look.set(t.x + 0.2, 0, t.z);
      break;
    case "front":
      _desired.set(t.x + 2.85, 0.48, 0.95);
      _look.set(t.x + 0.1, 0.06, t.z);
      break;
    case "under":
      _desired.set(t.x - 0.15, -0.95, 2.05);
      _look.set(t.x + 0.95, 0.04, t.z);
      break;
    case "side":
    default:
      _desired.set(t.x - 0.2, 0.68, 3.05);
      _look.set(t.x + 0.5, 0.05, t.z);
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
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    const t = target.current;
    viewOffset(view, t);
    if (!inited.current) {
      camera.position.copy(_desired);
      _currentLook.copy(_look);
      camera.lookAt(_currentLook);
      inited.current = true;
      lastView.current = view;
      return;
    }
    const switched = lastView.current !== view;
    lastView.current = view;
    const k = switched ? 8.5 : view === "overhead" ? 3.2 : 4.8;
    const alpha = 1 - Math.exp(-k * d);
    camera.position.lerp(_desired, alpha);
    _currentLook.lerp(_look, alpha);
    camera.lookAt(_currentLook);
  });
  return null;
}
export {
  CameraRig
};
