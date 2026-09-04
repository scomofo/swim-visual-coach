import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useCoach } from '../../store/coach';
import { evaluateDrag } from '../../lib/swim/drag';
import { evaluatePose } from '../../lib/swim/pose';
import { getProfile } from '../../lib/swim/profiles';
import { usePlaybackFrame } from '../../hooks/usePlaybackFrame';
import { Swimmer } from './Swimmer';
import { Water } from './Water';
import { Lights, PoolEnv } from './PoolEnv';
import { CameraRig } from './CameraRig';
import { Bubbles, FrontalArea, GuideLine, Splash, Wake } from './Effects';

export function PoolScene() {
  const drill = useCoach((s) => s.drill);
  const mode = useCoach((s) => s.mode);
  const camera = useCoach((s) => s.camera);
  const ghost = useCoach((s) => s.ghost);
  const guides = useCoach((s) => s.guides);
  const highlight = useCoach((s) => s.highlight);
  const setHud = useCoach((s) => s.setHud);

  const clock = useRef(0);
  const hudTick = useRef(0);
  const target = useRef(new THREE.Vector3(6.2, 0.12, 0));
  const compare = drill === 'comparison';

  const mainProfile = useMemo(
    () => getProfile(drill, compare ? 'correct' : mode),
    [drill, mode, compare],
  );
  const ghostProfile = useMemo(
    () => ({
      ...getProfile(drill, mode === 'correct' ? 'error' : 'correct'),
      travelSpeed: mainProfile.speed,
    }),
    [drill, mode, mainProfile],
  );
  const errorProfile = useMemo(
    () => ({ ...getProfile(drill, 'error'), travelSpeed: mainProfile.speed }),
    [drill, mainProfile],
  );

  useEffect(() => {
    clock.current = 0;
  }, [drill, mode]);

  usePlaybackFrame((_, dt) => {
    clock.current += dt;
  }, { priority: -2 });

  const publishHud = (phase, spl, pose) => {
    hudTick.current += 1;
    if (hudTick.current % 8 !== 0) return;
    const other = compare
      ? evaluateDrag(errorProfile, evaluatePose(errorProfile, clock.current, 0.72)).total
      : null;
    const drag = evaluateDrag(mainProfile, pose, other);
    setHud(phase, spl, drag);
  };

  return (
    <>
      <Lights />
      <PoolEnv />
      <Water />
      <CameraRig
        view={camera}
        target={target}
        paired={compare || ghost}
        laneCenter={compare ? 0 : -0.31}
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
          />
          <Swimmer profile={errorProfile} clock={clock} zLane={0.72} errorTint />
          <Splash clock={clock} profile={errorProfile} zLane={0.72} />
          <Splash clock={clock} profile={mainProfile} zLane={-0.72} />
          <Wake clock={clock} profile={mainProfile} zLane={-0.72} />
          <Wake clock={clock} profile={errorProfile} zLane={0.72} />
          <FrontalArea clock={clock} profile={mainProfile} zLane={-0.72} visible={guides} />
          <FrontalArea clock={clock} profile={errorProfile} zLane={0.72} visible={guides} />
        </>
      ) : (
        <>
          {ghost ? (
            <Swimmer profile={ghostProfile} clock={clock} ghost zLane={-0.62} />
          ) : null}
          <Swimmer
            profile={mainProfile}
            clock={clock}
            highlight={highlight}
            errorTint={mode === 'error'}
            target={target}
            onHud={publishHud}
          />
          <Splash clock={clock} profile={mainProfile} />
          <Wake clock={clock} profile={mainProfile} />
          <FrontalArea clock={clock} profile={mainProfile} visible={guides} />
        </>
      )}

      <Bubbles clock={clock} profile={mainProfile} target={target} />
      <GuideLine target={target} visible={guides} />
    </>
  );
}

export function PoolCanvas() {
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
        <PoolScene />
      </Suspense>
    </Canvas>
  );
}
