const WALL = "#153e4c";
const DECK = "#25434d";
const TILE = "#163844";
function Wall({
  position,
  args
}) {
  return <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={WALL} roughness={0.85} />
    </mesh>;
}
function Rope({ z }) {
  const floats = [];
  for (let i = 0; i < 72; i++) {
    const x = 1.0 + i * 0.32;
    const end = i < 12 || i > 60;
    const alternate = Math.floor(i / 4) % 2 === 0;
    floats.push(
      <mesh key={i} position={[x, 0.02, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.064, 0.064, 0.22, 10]} />
        <meshStandardMaterial
        color={end ? "#c98372" : alternate ? "#6bb9b4" : "#dee8e6"}
        roughness={0.35}
      />
      </mesh>
    );
  }
  return <group>
      <mesh position={[12.5, 0.02, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 24, 6]} />
        <meshStandardMaterial color="#d9e2e6" />
      </mesh>
      {floats}
    </group>;
}
function PoolEnv() {
  return <group>
      <Wall position={[12.5, -1.15, -2.7]} args={[28, 2.4, 0.35]} />
      <Wall position={[12.5, -1.15, 2.7]} args={[28, 2.4, 0.35]} />
      <Wall position={[-1.15, -1.15, 0]} args={[0.4, 2.4, 5.6]} />
      <Wall position={[26.15, -1.15, 0]} args={[0.4, 2.4, 5.6]} />

      <mesh position={[12.5, 0.12, -2.95]}>
        <boxGeometry args={[29, 0.18, 0.7]} />
        <meshStandardMaterial color={DECK} roughness={0.9} />
      </mesh>
      <mesh position={[12.5, 0.12, 2.95]}>
        <boxGeometry args={[29, 0.18, 0.7]} />
        <meshStandardMaterial color={DECK} roughness={0.9} />
      </mesh>

      <mesh position={[-1.15, 0.22, 0]}>
        <boxGeometry args={[0.55, 0.18, 0.7]} />
        <meshStandardMaterial color="#1a2c34" roughness={0.55} />
      </mesh>
      <mesh position={[-1.15, -0.35, 0]}>
        <boxGeometry args={[0.08, 1.1, 1.4]} />
        <meshStandardMaterial color="#dfe7ea" roughness={0.35} />
      </mesh>
      <mesh position={[-1.15, -0.35, 0]}>
        <boxGeometry args={[0.1, 0.08, 1.4]} />
        <meshStandardMaterial color="#c45c5c" />
      </mesh>
      <mesh position={[-1.15, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.08, 1.1, 0.08]} />
        <meshStandardMaterial color="#c45c5c" />
      </mesh>

      <Rope z={-1.15} />
      <Rope z={1.15} />

      <mesh position={[12.5, -2.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 0.12]} />
        <meshStandardMaterial color="#e8eef0" transparent opacity={0.35} />
      </mesh>

      <mesh position={[4, -2.33, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial color={TILE} transparent opacity={0.5} />
      </mesh>
    </group>;
}
function Lights() {
  return <>
      <hemisphereLight args={["#d7e8ee", "#102830", 0.72]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[7, 9, 6]} intensity={1.25} color="#fff6e8" />
      <directionalLight position={[2, 1.6, 5.2]} intensity={1.0} color="#e7f4f4" />
      <directionalLight position={[-5, 2.4, 2]} intensity={0.45} color="#9fd8d2" />
      <pointLight
    position={[8, 2.2, 2.2]}
    intensity={0.7}
    color="#cfe8e6"
    distance={16}
  />
      <pointLight
    position={[8, -1.15, 0]}
    intensity={0.9}
    color="#2f7f8a"
    distance={12}
  />
    </>;
}
export {
  Lights,
  PoolEnv
};
