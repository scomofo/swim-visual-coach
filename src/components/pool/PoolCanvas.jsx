import { Suspense, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { evaluateDrag } from '../../lib/swim/drag';
import { getProfile } from '../../lib/swim/profiles';
import { createSimCache } from '../../lib/swim/simCache';
import { publishHudDrag } from '../../state/hudStore';
import { Swimmer } from './Swimmer';
import { Water } from './Water';
import { Lights, PoolEnv } from './PoolEnv';
import { CameraRig } from './CameraRig';
import { Bubbles, FrontalArea, GuideLine, Splash, Wake } from './Effects';

function cueFromTag(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes('head') || t.includes('eyes') || t.includes('goggle') || t.includes('breath')) {
    return 'head';
  }
  if (t.includes('chest') || t.includes('press')) return 'chest';
  if (t.includes('kick') || t.includes('splash') || t.includes('leg')) return 'kick';
  if (t.includes('arm') || t.includes('mail') || t.includes('switch') || t.includes('vessel')) {
    return 'arm';
  }
  return 'hips';
}

function SceneInner({
  drill,
  mode,
  ghostMode,
  showGuides,
  playbackSpeed,
  camera,
  activeTag,
  reducedMotion,
  onHud,
}) {
  const clock = useRef(0);
  const hudTick = useRef(0);
  const target = useRef(new THREE.Vector3(6.2, 0.12, 0));
  const sim = useMemo(() => createSimCache(), []);
  const compare = drill === 'comparison';
  const formMode = mode === 'correct' ? 'correct' : 'error';
  const highlight = cueFromTag(activeTag);
  // Side view is not meaningful for dual-lane comparison; fall back to
  // quarter explicitly so callers can surface the override in UI.
  const effectiveCamera = compare && camera === 'side' ? 'quarter' : camera;

  const mainProfile = useMemo(
    () => getProfile(drill, compare ? 'correct' : formMode),
    [drill, formMode, compare],
  );
  const ghostProfile = useMemo(
    () => getProfile(drill, formMode === 'correct' ? 'error' : 'correct'),
    [drill, formMode],
  );
  const errorProfile = useMemo(() => getProfile(drill, 'error'), [drill]);

  useEffect(() => {
    clock.current = 0;
    sim.clear();
  }, [drill, mode, sim]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    if (!reducedMotion) clock.current += d * playbackSpeed;
  }, -1);

  const publishHud = useCallback((phase, spl, pose) => {
    hudTick.current += 1;
    if (hudTick.current % 8 !== 0) return;
    const other = compare
      ? evaluateDrag(errorProfile, sim.getPose(errorProfile, clock.current, 0.72)).total
      : null;
    const report = evaluateDrag(mainProfile, pose, other);
    publishHudDrag(report, phase, spl);
    onHud?.(report, phase, spl);
  }, [compare, errorProfile, mainProfile, onHud, sim]);

  return (
    <>
      <Lights />
      <PoolEnv />
      <Water reducedMotion={reducedMotion} playbackSpeed={playbackSpeed} />
      <CameraRig
        view={effectiveCamera}
        target={target}
      />

      {compare ? (
        <>
          <Swimmer
            profile={mainProfile}
            clock={clock}
            zLane={-0.72}
            highlight={highlight}
            target={target}
            onHud={publishHud}
            sim={sim}
          />
          <Swimmer profile={errorProfile} clock={clock} zLane={0.72} errorTint sim={sim} />
          <Splash clock={clock} profile={errorProfile} zLane={0.72} sim={sim} />
          <Splash clock={clock} profile={mainProfile} zLane={-0.72} sim={sim} />
          <Wake clock={clock} profile={mainProfile} zLane={-0.72} sim={sim} />
          <Wake clock={clock} profile={errorProfile} zLane={0.72} sim={sim} />
          <FrontalArea clock={clock} profile={mainProfile} zLane={-0.72} visible={showGuides} sim={sim} />
          <FrontalArea clock={clock} profile={errorProfile} zLane={0.72} visible={showGuides} sim={sim} />
        </>
      ) : (
        <>
          {ghostMode ? (
            <Swimmer profile={ghostProfile} clock={clock} ghost zLane={-0.62} sim={sim} />
          ) : null}
          <Swimmer
            profile={mainProfile}
            clock={clock}
            highlight={highlight}
            errorTint={formMode === 'error'}
            target={target}
            onHud={publishHud}
            sim={sim}
          />
          <Splash clock={clock} profile={mainProfile} sim={sim} />
          <Wake clock={clock} profile={mainProfile} sim={sim} />
          <FrontalArea clock={clock} profile={mainProfile} visible={showGuides} sim={sim} />
        </>
      )}

      <Bubbles clock={clock} profile={mainProfile} target={target} />
      <GuideLine target={target} visible={showGuides} />
    </>
  );
}

const Scene = memo(SceneInner);

export function PoolCanvas(props) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 34, near: 0.12, far: 90, position: [5.2, 0.7, 3.2] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#061018');
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        scene.fog = new THREE.Fog('#071820', 16, 38);
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
