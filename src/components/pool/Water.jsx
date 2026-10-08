import { useMemo, useRef } from "react";
import * as THREE from "three";
import { usePlaybackFrame } from "../../hooks/usePlaybackFrame";
const waterVert = (
  /* glsl */
  `
  uniform float uTime;
  varying vec3 vWorld;
  varying float vWave;
  void main() {
    // Use world height: the plane's local Y becomes depth after rotation.
    vec4 world = modelMatrix * vec4(position, 1.0);
    float w1 = sin(world.x * 0.55 + uTime * 0.7) * 0.016;
    float w2 = sin(world.z * 0.85 + uTime * 0.95) * 0.01;
    float w3 = sin((world.x + world.z) * 0.35 + uTime * 0.45) * 0.008;
    vWave = w1 + w2 + w3;
    world.y += vWave;
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
    vec3 deep = vec3(0.025, 0.16, 0.21);
    vec3 mid = vec3(0.08, 0.38, 0.42);
    vec3 foam = vec3(0.78, 0.90, 0.90);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float cau = sin(vWorld.x * 2.4 + uTime * 0.8) * sin(vWorld.z * 1.9 + uTime * 1.1);
    float sparkle = pow(max(cau, 0.0), 8.0);
    float fres = pow(1.0 - abs(viewDir.y), 2.2);
    vec3 col = mix(deep, mid, 0.42 + vWave * 4.0);
    col += foam * sparkle * 0.18;
    col = mix(col, foam, fres * 0.18);
    float alpha = 0.18 + fres * 0.16;
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
    vec2 tileUV = vec2(vWorld.x, vWorld.z) * 3.0;
    vec2 tiles = floor(tileUV);
    vec2 edge = min(fract(tileUV), 1.0 - fract(tileUV));
    float grout = 1.0 - smoothstep(0.008, 0.022, min(edge.x, edge.y));
    float checker = mod(tiles.x + tiles.y, 2.0);
    vec3 col = mix(vec3(0.075, 0.25, 0.30), vec3(0.065, 0.22, 0.27), checker);
    col = mix(col, vec3(0.045, 0.15, 0.19), grout * 0.55);
    float lane = 1.0 - smoothstep(0.08, 0.1, abs(vWorld.z));
    float tee = (1.0 - smoothstep(0.09, 0.12, min(abs(vWorld.x - 1.5), abs(vWorld.x - 23.5)))) * (1.0 - step(0.55, abs(vWorld.z)));
    col = mix(col, vec3(0.035, 0.10, 0.14), max(lane, tee) * 0.8);
    // Soft caustic bands preserve the instructional bodyline.
    float c1 = sin(vWorld.x * 2.2 + sin(vWorld.z * 3.0 + uTime * 0.3) + uTime * 0.45);
    float c2 = sin(vWorld.z * 3.8 + sin(vWorld.x * 1.8 - uTime * 0.35));
    float caustic = pow(1.0 - abs(c1), 9.0) + pow(1.0 - abs(c2), 9.0);
    col += vec3(0.18, 0.42, 0.43) * caustic * 0.18;
    gl_FragColor = vec4(col, 1.0);
  }
`
);
function Water() {
  const waterMat = useRef(null);
  const floorMat = useRef(null);
  const waterUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const floorUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  usePlaybackFrame((_, dt) => {
    if (waterMat.current) waterMat.current.uniforms.uTime.value += dt;
    if (floorMat.current) floorMat.current.uniforms.uTime.value += dt;
  }, { ambient: true });
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
