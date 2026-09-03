import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { evaluatePose } from "../../lib/swim/pose";
import { makeCap, makeSkin, makeSuit } from "./materials";
function Bone({
  radius,
  length,
  material,
  joint = 0
}) {
  return <group>
      {joint > 0 ? <mesh material={material} renderOrder={2}>
          <sphereGeometry args={[joint, 12, 10]} />
        </mesh> : null}
      <mesh
    material={material}
    rotation={[0, 0, -Math.PI / 2]}
    position={[length / 2, 0, 0]}
    renderOrder={2}
  >
        <capsuleGeometry args={[radius, length, 6, 12]} />
      </mesh>
    </group>;
}
function applyPose(j, pose) {
  j.root.position.set(pose.x, pose.y - pose.hipDrop * 0.35, pose.z);
  j.hips.rotation.set(pose.bodyRoll, pose.bodyYaw, pose.bodyPitch);
  j.spine.rotation.z = pose.bodyPitch * 0.22;
  j.chest.rotation.x = pose.bodyRoll * 0.18;
  j.neck.rotation.set(
    pose.headRoll * 0.3,
    pose.headYaw * 0.35,
    pose.headPitch * 0.45
  );
  j.head.rotation.set(pose.headRoll, pose.headYaw, pose.headPitch);
  const la = pose.leftArm;
  const ra = pose.rightArm;
  j.lShoulder.rotation.set(la.rx, la.ry, la.rz);
  j.lElbow.rotation.set(0, 0, -la.elbow);
  j.lWrist.rotation.set(0, 0, la.wrist);
  j.rShoulder.rotation.set(ra.rx, ra.ry, ra.rz);
  j.rElbow.rotation.set(0, 0, -ra.elbow);
  j.rWrist.rotation.set(0, 0, ra.wrist);
  const ll = pose.leftLeg;
  const rl = pose.rightLeg;
  j.lHip.rotation.set(ll.splay, 0, Math.PI + ll.hip);
  j.lKnee.rotation.set(0, 0, -ll.knee);
  j.rHip.rotation.set(rl.splay, 0, Math.PI + rl.hip);
  j.rKnee.rotation.set(0, 0, -rl.knee);
}
function setHighlight(mats, cue, parts) {
  for (const mat of mats) {
    mat.emissive.set("#000000");
    mat.emissiveIntensity = 0;
  }
  if (!cue) return;
  const list = parts[cue];
  if (!list) return;
  for (const mat of list) {
    mat.emissive.set("#8fd0c8");
    mat.emissiveIntensity = 0.7;
  }
}
function Swimmer({
  profile,
  clock,
  highlight = null,
  ghost = false,
  errorTint = false,
  zLane = 0,
  onHud,
  target
}) {
  const joints = useRef({});
  const skin = useMemo(
    () => makeSkin({ ghost, error: errorTint && !ghost }),
    [ghost, errorTint]
  );
  const cap = useMemo(() => makeCap(ghost), [ghost]);
  const suit = useMemo(() => makeSuit(ghost), [ghost]);
  const headMat = useMemo(() => skin.clone(), [skin]);
  const chestMat = useMemo(() => {
    const m = suit.clone();
    m.color.set("#15222c");
    return m;
  }, [suit]);
  const hipMat = useMemo(() => {
    const m = suit.clone();
    m.color.set("#121c24");
    return m;
  }, [suit]);
  const armMat = useMemo(() => skin.clone(), [skin]);
  const kickMat = useMemo(() => skin.clone(), [skin]);
  const goggleMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: ghost ? "#9fd8d2" : "#8fd0c8",
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: ghost ? 0.28 : 0.78,
      emissive: ghost ? "#000000" : "#2f6f6a",
      emissiveIntensity: ghost ? 0 : 0.2
    }),
    [ghost]
  );
  const bind = (name) => (node) => {
    if (node) joints.current[name] = node;
  };
  const lastCue = useRef(Symbol("init"));
  useFrame(() => {
    const j = joints.current;
    if (!j.root || !j.hips) return;
    const pose = evaluatePose(profile, clock.current, zLane);
    applyPose(j, pose);
    if (target && !ghost) {
      target.current.set(pose.x + 0.4, pose.y + 0.04, pose.z);
    }
    const cue = ghost ? null : highlight;
    if (cue !== lastCue.current) {
      lastCue.current = cue;
      setHighlight(
        [headMat, chestMat, hipMat, armMat, kickMat, cap],
        cue,
        {
          head: [headMat, cap],
          chest: [chestMat],
          hips: [hipMat],
          arm: [armMat],
          kick: [kickMat]
        }
      );
    }
    onHud?.(pose.phaseName, profile.spl, pose);
  });
  return <group ref={bind("root")} position={[6.2, 0.12, 0]} scale={1.14} renderOrder={2}>
      <group ref={bind("hips")}>
        <mesh
    position={[0.05, 0, 0]}
    rotation={[0, 0, -Math.PI / 2]}
    scale={[0.82, 1, 1.22]}
    material={hipMat}
    renderOrder={2}
  >
          <capsuleGeometry args={[0.13, 0.18, 6, 14]} />
        </mesh>

        <group ref={bind("lHip")} position={[0.02, -0.015, -0.13]}>
          <mesh
    rotation={[0, 0, -Math.PI / 2]}
    position={[0.12, 0, 0]}
    material={hipMat}
    renderOrder={2}
  >
            <capsuleGeometry args={[0.056, 0.2, 6, 12]} />
          </mesh>
          <Bone radius={0.05} length={0.38} material={kickMat} joint={0.056} />
          <group ref={bind("lKnee")} position={[0.38, 0, 0]}>
            <Bone radius={0.038} length={0.36} material={kickMat} joint={0.044} />
            <mesh
    position={[0.4, -0.015, 0]}
    rotation={[0.12, 0, 0.18]}
    material={kickMat}
    renderOrder={2}
  >
              <boxGeometry args={[0.2, 0.04, 0.085]} />
            </mesh>
          </group>
        </group>

        <group ref={bind("rHip")} position={[0.02, -0.015, 0.13]}>
          <mesh
    rotation={[0, 0, -Math.PI / 2]}
    position={[0.12, 0, 0]}
    material={hipMat}
    renderOrder={2}
  >
            <capsuleGeometry args={[0.056, 0.2, 6, 12]} />
          </mesh>
          <Bone radius={0.05} length={0.38} material={kickMat} joint={0.056} />
          <group ref={bind("rKnee")} position={[0.38, 0, 0]}>
            <Bone radius={0.038} length={0.36} material={kickMat} joint={0.044} />
            <mesh
    position={[0.4, -0.015, 0]}
    rotation={[-0.12, 0, 0.18]}
    material={kickMat}
    renderOrder={2}
  >
              <boxGeometry args={[0.2, 0.04, 0.085]} />
            </mesh>
          </group>
        </group>

        <group ref={bind("spine")} position={[0.14, 0.03, 0]}>
          <group ref={bind("chest")} position={[0.24, 0.02, 0]}>
            <mesh
    rotation={[0, 0, -Math.PI / 2]}
    scale={[0.78, 1.02, 1.2]}
    material={chestMat}
    renderOrder={2}
  >
              <capsuleGeometry args={[0.16, 0.42, 6, 16]} />
            </mesh>

            <group ref={bind("lShoulder")} position={[0.1, 0.05, -0.24]}>
              <Bone
    radius={0.038}
    length={0.26}
    material={armMat}
    joint={0.056}
  />
              <group ref={bind("lElbow")} position={[0.26, 0, 0]}>
                <Bone
    radius={0.03}
    length={0.24}
    material={armMat}
    joint={0.036}
  />
                <group ref={bind("lWrist")} position={[0.24, 0, 0]}>
                  <mesh rotation={[0.25, 0, -0.12]} material={armMat} renderOrder={2}>
                    <boxGeometry args={[0.15, 0.032, 0.075]} />
                  </mesh>
                </group>
              </group>
            </group>

            <group ref={bind("rShoulder")} position={[0.1, 0.05, 0.24]}>
              <Bone
    radius={0.038}
    length={0.26}
    material={armMat}
    joint={0.056}
  />
              <group ref={bind("rElbow")} position={[0.26, 0, 0]}>
                <Bone
    radius={0.03}
    length={0.24}
    material={armMat}
    joint={0.036}
  />
                <group ref={bind("rWrist")} position={[0.24, 0, 0]}>
                  <mesh rotation={[-0.25, 0, -0.12]} material={armMat} renderOrder={2}>
                    <boxGeometry args={[0.15, 0.032, 0.075]} />
                  </mesh>
                </group>
              </group>
            </group>

            <group ref={bind("neck")} position={[0.4, 0.04, 0]}>
              <mesh rotation={[0, 0, -Math.PI / 2]} material={headMat} renderOrder={2}>
                <capsuleGeometry args={[0.042, 0.07, 4, 10]} />
              </mesh>
              <group ref={bind("head")} position={[0.155, 0.015, 0]}>
                <mesh material={headMat} scale={[1.12, 0.94, 0.9]} renderOrder={2}>
                  <sphereGeometry args={[0.118, 18, 16]} />
                </mesh>
                <mesh
    position={[0.01, 0.035, 0]}
    material={cap}
    scale={[1.12, 0.7, 0.98]}
    renderOrder={2}
  >
                  <sphereGeometry args={[0.122, 18, 14]} />
                </mesh>
                <mesh
    position={[0.08, -0.015, 0]}
    rotation={[Math.PI / 2, 0.08, 0]}
    renderOrder={2}
  >
                  <torusGeometry args={[0.082, 0.013, 8, 18]} />
                  <meshStandardMaterial
    color={ghost ? "#9fd8d2" : "#1a242c"}
    roughness={0.28}
    transparent={ghost}
    opacity={ghost ? 0.3 : 1}
  />
                </mesh>
                <mesh position={[0.1, -0.012, -0.04]} material={goggleMat} renderOrder={2}>
                  <sphereGeometry args={[0.032, 12, 10]} />
                </mesh>
                <mesh position={[0.1, -0.012, 0.04]} material={goggleMat} renderOrder={2}>
                  <sphereGeometry args={[0.032, 12, 10]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>;
}
export {
  Swimmer
};
