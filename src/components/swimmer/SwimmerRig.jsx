import { useEffect, useState } from 'react';
import {
  getDrillMotion,
  getPose,
  getTravelAtProgress,
} from '../../utils/motion';
import RhythmPulse from '../overlays/RhythmPulse';
import RhythmDots from '../overlays/RhythmDots';
import RhythmPath from '../overlays/RhythmPath';
import ContinuousFlowOverlay from '../overlays/ContinuousFlowOverlay';
import SPLOutput from '../overlays/SPLOutput';
import Effortless25Overlay from '../overlays/Effortless25Overlay';
import ComparisonOverlay from '../overlays/ComparisonOverlay';

const STATIC_PROGRESS = 0.42;
const RECOVERY_POINTS = [
  { x: 330, y: 130 },
  { x: 410, y: 76 },
  { x: 520, y: 55 },
  { x: 650, y: 78 },
  { x: 795, y: 105 },
];
const RECOVERY_ELBOWS = [
  { x: 420, y: 88 },
  { x: 470, y: 52 },
  { x: 525, y: 43 },
  { x: 575, y: 57 },
  { x: 660, y: 88 },
];

function interpolatePoint(points, progress) {
  const scaled = Math.min(0.9999, Math.max(0, progress)) * (points.length - 1);
  const index = Math.floor(scaled);
  const amount = scaled - index;
  const start = points[index];
  const end = points[Math.min(index + 1, points.length - 1)];

  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
  };
}

function pointFrom(origin, length, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: origin.x + Math.cos(radians) * length,
    y: origin.y + Math.sin(radians) * length,
  };
}

function useAnimationProgress(duration, playbackSpeed, reducedMotion) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) return undefined;

    let animationFrame;
    const startedAt = performance.now();
    const tick = (now) => {
      const elapsedSeconds = (now - startedAt) / 1000;
      setProgress(((elapsedSeconds * playbackSpeed) / duration) % 1);
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [duration, playbackSpeed, reducedMotion]);

  return reducedMotion ? STATIC_PROGRESS : progress;
}

function getRecoveryJoints(recoverArm, elbowLift, hipY) {
  const phase = ((recoverArm % 1) + 1) % 1;
  const wrist = interpolatePoint(RECOVERY_POINTS, phase);
  const elbow = interpolatePoint(RECOVERY_ELBOWS, phase);
  const lowElbowPenalty = (1 - elbowLift) * 58;

  return {
    elbow: { x: elbow.x, y: elbow.y + lowElbowPenalty + hipY * 0.2 },
    wrist: { x: wrist.x, y: wrist.y + lowElbowPenalty * 0.45 + hipY * 0.25 },
  };
}

function getHighlight(activeTag, part) {
  const tag = activeTag?.toLowerCase() ?? '';
  if (!tag) return false;

  const terms = {
    head: ['head', 'goggle', 'breath', 'eyes'],
    chest: ['chest', 'press'],
    hips: ['hip', 'leg', 'kick', 'balance'],
    arm: ['arm', 'mail slot', 'entry', 'glide', 'patient'],
    core: ['core', 'rotation', 'side', 'vessel', 'streamline'],
  };

  return terms[part].some((term) => tag.includes(term));
}

function limbColor(highlighted, fallback = '#e2e8f0') {
  return highlighted ? '#67e8f9' : fallback;
}

function SplashParticles({ x, y, intensity, isCorrect, progress }) {
  if (intensity <= 0.01) return null;

  const count = isCorrect ? 5 : 12;
  const spread = isCorrect ? 12 : 29;
  const color = isCorrect ? 'rgba(207,250,254,0.7)' : 'rgba(224,242,254,0.9)';

  return (
    <g aria-label="hand-entry splash">
      {Array.from({ length: count }, (_, index) => {
        const ratio = count === 1 ? 0 : index / (count - 1);
        const angle = Math.PI * (0.12 + ratio * 0.76);
        const jitter = Math.sin(progress * Math.PI * 6 + index * 1.7) * 3;
        const distance = spread * (0.35 + ratio * 0.7) * intensity;

        return (
          <circle
            key={index}
            cx={x + Math.cos(angle) * distance + jitter}
            cy={Math.min(111, y) - Math.sin(angle) * distance - jitter * 0.35}
            r={(isCorrect ? 1.8 : 2.5) + (index % 3) * 0.8}
            fill={color}
            opacity={Math.max(0.18, intensity - ratio * 0.2)}
          />
        );
      })}
      {!isCorrect && (
        <>
          <path
            d={`M${x - 5} ${Math.min(111, y)} q12 -${24 * intensity} 25 -${34 * intensity}`}
            fill="none"
            stroke="rgba(224,242,254,0.72)"
            strokeWidth={2 + intensity * 3}
            strokeLinecap="round"
          />
          <path
            d={`M${x + 3} ${Math.min(111, y)} q-10 -${18 * intensity} -22 -${26 * intensity}`}
            fill="none"
            stroke="rgba(186,230,253,0.62)"
            strokeWidth={1.5 + intensity * 2}
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

function SwimmerBody({
  pose,
  isCorrect,
  progress,
  activeTag,
  transform,
  label,
}) {
  const shoulder = { x: 505, y: 108 + pose.hipY * 0.18 };
  const hip = { x: 315, y: 127 + pose.hipY };
  const leadElbow = pointFrom(shoulder, 122, pose.leadArm);
  const leadHand = pointFrom(leadElbow, 168, pose.leadArm * 0.5);
  const recovery = getRecoveryJoints(pose.recoverArm, pose.elbow, pose.hipY);
  const bodyTilt = pose.bodyRot * 0.1;
  const torsoHeight = 43 - Math.min(17, Math.abs(pose.bodyRot) * 0.45);
  const shoulderDepth = 1 - Math.min(0.34, Math.abs(pose.shoulderRot) / 140);
  const shoulderTilt = pose.shoulderRot * 0.11;
  const kickCycle = progress * Math.PI * 8;
  const upperKick = Math.sin(kickCycle) * pose.kickAmp;
  const lowerKick = Math.sin(kickCycle + Math.PI) * pose.kickAmp;
  const headY = 101 + pose.hipY * 0.2 + pose.headRot * 0.38;
  const wakeWidth = isCorrect ? 3 : 6 + pose.kickAmp * 0.18;

  const headHighlight = getHighlight(activeTag, 'head');
  const chestHighlight = getHighlight(activeTag, 'chest');
  const hipHighlight = getHighlight(activeTag, 'hips');
  const armHighlight = getHighlight(activeTag, 'arm');
  const coreHighlight = getHighlight(activeTag, 'core');
  const shoulderTransform = `translate(${shoulder.x} ${shoulder.y}) rotate(${shoulderTilt}) scale(1 ${shoulderDepth}) translate(${-shoulder.x} ${-shoulder.y})`;

  return (
    <g transform={transform} role="group" aria-label={label}>
      <g transform={`rotate(${bodyTilt} 430 120)`}>
        <path
          d={`M88 ${142 + upperKick * 0.5} C55 ${143 + upperKick}, 29 ${137 + upperKick * 0.7}, 6 ${142 + upperKick * 0.35}`}
          fill="none"
          stroke="rgba(186,230,253,0.58)"
          strokeWidth={wakeWidth}
          strokeLinecap="round"
        />
        {!isCorrect && (
          <path
            d={`M96 ${151 + lowerKick * 0.6} C59 ${169 + lowerKick}, 27 ${132 - lowerKick * 0.4}, 2 ${158 + lowerKick * 0.5}`}
            fill="none"
            stroke="rgba(125,211,252,0.42)"
            strokeWidth={wakeWidth * 0.72}
            strokeDasharray="10 8"
            strokeLinecap="round"
          />
        )}

        <g aria-label="legs">
          <path
            d={`M${hip.x} ${hip.y + 3} Q220 ${136 + pose.hipY * 0.6 + upperKick * 0.35} 78 ${137 + upperKick}`}
            fill="none"
            stroke={limbColor(hipHighlight, '#f1f5f9')}
            strokeWidth="25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={`M${hip.x} ${hip.y + 15} Q215 ${151 + pose.hipY * 0.65 + lowerKick * 0.35} 72 ${151 + lowerKick}`}
            fill="none"
            stroke={limbColor(hipHighlight, '#cbd5e1')}
            strokeWidth="23"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <ellipse
          cx={hip.x + 15}
          cy={hip.y}
          rx="62"
          ry={Math.max(22, torsoHeight * 0.72)}
          fill={limbColor(hipHighlight || coreHighlight, '#dbeafe')}
          stroke="rgba(15,23,42,0.18)"
          strokeWidth="2"
        />
        <path
          d={`M${hip.x + 8} ${hip.y} C355 ${116 + pose.hipY * 0.75}, 438 ${108 + pose.hipY * 0.35}, ${shoulder.x} ${shoulder.y}`}
          fill="none"
          stroke={limbColor(chestHighlight || coreHighlight, '#f8fafc')}
          strokeWidth={torsoHeight * 1.65}
          strokeLinecap="round"
        />

        <g transform={shoulderTransform} aria-label="shoulder roll">
          <g aria-label="lead arm">
            <path
              d={`M${shoulder.x} ${shoulder.y} L${leadElbow.x} ${leadElbow.y} L${leadHand.x} ${leadHand.y}`}
              fill="none"
              stroke={limbColor(armHighlight, '#f8fafc')}
              strokeWidth="25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={leadElbow.x} cy={leadElbow.y} r="5" fill="#0e7490" opacity="0.48" />
          </g>

          <g aria-label="recovering arm">
            <path
              d={`M${shoulder.x - 8} ${shoulder.y - 5} L${recovery.elbow.x} ${recovery.elbow.y} L${recovery.wrist.x} ${recovery.wrist.y}`}
              fill="none"
              stroke={limbColor(armHighlight, '#bae6fd')}
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={recovery.elbow.x} cy={recovery.elbow.y} r="6" fill="#0891b2" opacity="0.6" />
            <circle cx={recovery.wrist.x} cy={recovery.wrist.y} r="7" fill="#e0f2fe" />
          </g>

          <line
            x1="475"
            y1={shoulder.y - pose.shoulderRot * 0.18}
            x2="526"
            y2={shoulder.y + pose.shoulderRot * 0.18}
            stroke={coreHighlight ? '#0e7490' : 'rgba(14,116,144,0.4)'}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <SplashParticles
            x={recovery.wrist.x}
            y={recovery.wrist.y}
            intensity={pose.splash}
            isCorrect={isCorrect}
            progress={progress}
          />
        </g>

        <g transform={`rotate(${pose.headRot * 0.35} 574 ${headY})`} aria-label="head">
          <ellipse
            cx="574"
            cy={headY}
            rx="39"
            ry="34"
            fill={limbColor(headHighlight, '#f8fafc')}
            stroke="rgba(15,23,42,0.2)"
            strokeWidth="2"
          />
          <path
            d={`M584 ${headY - 8} Q599 ${headY - 12} 608 ${headY - 4}`}
            fill="none"
            stroke="#155e75"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="599" cy={headY - 7} r="3" fill="#67e8f9" />
        </g>

        <line
          x1="292"
          y1={hip.y - 2}
          x2="356"
          y2={hip.y + 2}
          stroke={coreHighlight ? '#0e7490' : 'rgba(14,116,144,0.35)'}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {!isCorrect && Array.from({ length: 7 }, (_, index) => (
          <circle
            key={index}
            cx={65 + index * 25 + Math.sin(progress * Math.PI * 2 + index) * 9}
            cy={112 + (index % 3) * 13 - Math.cos(progress * Math.PI * 2 + index) * 8}
            r={3 + (index % 2) * 2}
            fill="rgba(224,242,254,0.7)"
          />
        ))}
      </g>
    </g>
  );
}

export default function SwimmerRig({
  drill,
  isCorrect,
  playbackSpeed,
  activeTag,
  reducedMotion = false,
}) {
  const motion = getDrillMotion(drill);
  const progress = useAnimationProgress(motion.duration, playbackSpeed, reducedMotion);
  const isComparison = drill === 'comparison';
  const pose = getPose(drill, isCorrect, progress);
  const travelX = getTravelAtProgress(drill, isCorrect, progress);

  const isTripleSwitch = drill === 'tripleSwitch';
  const isRhythm = drill === 'rhythm';
  const isContinuousFlow = drill === 'continuousFlow';
  const isSPL = drill === 'spl';
  const isEffortless25 = drill === 'effortless25';

  if (isComparison) {
    const efficientPose = getPose(drill, true, progress);
    const rushedPose = getPose(drill, false, progress);
    const efficientTravel = getTravelAtProgress(drill, true, progress);
    const rushedTravel = getTravelAtProgress(drill, false, progress);

    return (
      <div
        className="absolute left-[6%] top-[25%] h-[180px] w-[88%] md:top-[31%] md:h-[220px]"
        data-motion={reducedMotion ? 'static' : 'animated'}
        data-testid="swimmer-rig"
      >
        <svg
          viewBox="0 0 900 240"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Efficient and rushed swimmer comparison"
        >
          <ComparisonOverlay reducedMotion={reducedMotion} />
          <SwimmerBody
            pose={efficientPose}
            isCorrect
            progress={progress}
            activeTag={activeTag}
            transform={`translate(${-8 + efficientTravel * 0.28} 48) scale(0.5)`}
            label="efficient swimmer"
          />
          <SwimmerBody
            pose={rushedPose}
            isCorrect={false}
            progress={progress}
            activeTag={activeTag}
            transform={`translate(${446 + rushedTravel * 0.28} 48) scale(0.5)`}
            label="rushed swimmer"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="absolute left-[8%] top-[28%] h-[150px] w-[78%] md:top-[34%] md:h-[190px]"
      data-motion={reducedMotion ? 'static' : 'animated'}
      data-testid="swimmer-rig"
      style={{ transform: `translate3d(${travelX}px, 0, 0)` }}
    >
      <svg
        viewBox="0 0 900 240"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label={`${isCorrect ? 'Correct' : 'Incorrect'} swimmer form`}
      >
        <SwimmerBody
          pose={pose}
          isCorrect={isCorrect}
          progress={progress}
          activeTag={activeTag}
          label={`${isCorrect ? 'correct' : 'incorrect'} swimmer`}
        />

        <RhythmPulse playbackSpeed={playbackSpeed} reducedMotion={reducedMotion} />
        {isTripleSwitch && <RhythmDots reducedMotion={reducedMotion} />}
        {isRhythm && <RhythmPath reducedMotion={reducedMotion} />}
        {isContinuousFlow && <ContinuousFlowOverlay reducedMotion={reducedMotion} />}
        {isSPL && <SPLOutput reducedMotion={reducedMotion} />}
        {isEffortless25 && <Effortless25Overlay reducedMotion={reducedMotion} />}
      </svg>
    </div>
  );
}
