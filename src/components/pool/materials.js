import * as THREE from "three";
const SKIN = new THREE.Color("#d9a07c");
const CAP = new THREE.Color("#0b161c");
const SUIT = new THREE.Color("#102028");
const GOGGLE_FRAME = new THREE.Color("#1a242c");
const GOGGLE_LENS = new THREE.Color("#9fe0d8");
const GHOST = new THREE.Color("#9fd8d2");
const ERROR_TINT = new THREE.Color("#c98a62");
function makeSkin(opts) {
  if (opts?.ghost) {
    return new THREE.MeshStandardMaterial({
      color: GHOST,
      transparent: true,
      opacity: 0.34,
      roughness: 0.48,
      metalness: 0.04,
      depthWrite: false,
      emissive: GHOST,
      emissiveIntensity: 0.16
    });
  }
  return new THREE.MeshStandardMaterial({
    color: opts?.error ? ERROR_TINT : SKIN,
    roughness: 0.46,
    metalness: 0.02,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0
  });
}
function makeCap(ghost = false) {
  return new THREE.MeshStandardMaterial({
    color: ghost ? GHOST : CAP,
    roughness: 0.28,
    metalness: 0.08,
    transparent: ghost,
    opacity: ghost ? 0.34 : 1,
    depthWrite: !ghost,
    emissive: ghost ? GHOST : new THREE.Color("#000000"),
    emissiveIntensity: ghost ? 0.12 : 0
  });
}
function makeSuit(ghost = false) {
  return new THREE.MeshStandardMaterial({
    color: ghost ? GHOST : SUIT,
    roughness: 0.62,
    metalness: 0.04,
    transparent: ghost,
    opacity: ghost ? 0.32 : 1,
    depthWrite: !ghost,
    emissive: ghost ? GHOST : new THREE.Color("#000000"),
    emissiveIntensity: ghost ? 0.1 : 0
  });
}
export {
  CAP,
  ERROR_TINT,
  GHOST,
  GOGGLE_FRAME,
  GOGGLE_LENS,
  SKIN,
  SUIT,
  makeCap,
  makeSkin,
  makeSuit
};
