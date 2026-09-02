import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
const waterVert = (
  /* glsl */
  `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;
  void main() {
    vec3 p = position;
    float w1 = sin(p.x * 0.55 + uTime * 0.7) * 0.022;
    float w2 = sin(p.z * 0.85 + uTime * 0.95) * 0.014;
    float w3 = sin((p.x + p.z) * 0.35 + uTime * 0.45) * 0.01;
    vWave = w1 + w2 + w3;
    p.y += vWave;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
);
const waterFrag = (
  /* glsl */
  `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;
  void main() {
    vec3 deep = vec3(0.02, 0.08, 0.11);
    vec3 mid = vec3(0.05, 0.22, 0.27);
    vec3 foam = vec3(0.78, 0.90, 0.90);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float cau = sin(vWorld.x * 2.4 + uTime * 0.8) * sin(vWorld.z * 1.9 + uTime * 1.1);
    float sparkle = pow(max(cau, 0.0), 8.0);
    float fres = pow(1.0 - abs(viewDir.y), 2.2);
    vec3 col = mix(deep, mid, 0.42 + vWave * 4.0);
    col += foam * sparkle * 0.28;
    col = mix(col, foam, fres * 0.18);
    float alpha = 0.24 + fres * 0.16;
    gl_FragColor = vec4(col, alpha);
  }
`
);
const floorVert = (
  /* glsl */
  `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
);
const floorFrag = (
  /* glsl */
  `
  uniform float uTime;
  varying vec3 vWorld;
  void main() {
    vec2 tiles = floor(vec2(vWorld.x, vWorld.z) * vec2(1.6, 2.4));
    float checker = mod(tiles.x + tiles.y, 2.0);
    vec3 a = vec3(0.03, 0.12, 0.15);
    vec3 b = vec3(0.024, 0.09, 0.12);
    vec3 col = mix(a, b, checker);
    float lane = step(0.96, fract(vWorld.z * 0.4 + 0.5));
    col = mix(col, vec3(0.85, 0.9, 0.9), lane * 0.4);
    float cau = sin(vWorld.x * 2.2 + uTime * 0.9) * sin(vWorld.z * 1.7 + uTime * 1.05 + 1.2);
    col += vec3(0.18, 0.45, 0.48) * pow(max(cau, 0.0), 3.0) * 0.22;
    gl_FragColor = vec4(col, 1.0);
  }
`
);
function Water() {
  const waterMat = useRef(null);
  const floorMat = useRef(null);
  const waterUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const floorUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    if (waterMat.current) waterMat.current.uniforms.uTime.value += d;
    if (floorMat.current) floorMat.current.uniforms.uTime.value += d;
  });
  return <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12.5, 0, 0]} renderOrder={1}>
        <planeGeometry args={[28, 5.2, 80, 28]} />
        <shaderMaterial
    ref={waterMat}
    uniforms={waterUniforms}
    vertexShader={waterVert}
    fragmentShader={waterFrag}
    transparent
    depthWrite={false}
    side={THREE.DoubleSide}
  />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12.5, -2.35, 0]}>
        <planeGeometry args={[28, 5.2]} />
        <shaderMaterial
    ref={floorMat}
    uniforms={floorUniforms}
    vertexShader={floorVert}
    fragmentShader={floorFrag}
  />
      </mesh>
    </group>;
}
export {
  Water
};
