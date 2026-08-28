import { motion } from 'framer-motion';
import { getBodyRotation, getTravel } from '../../utils/motion';
import RhythmPulse from '../overlays/RhythmPulse';
import RhythmDots from '../overlays/RhythmDots';
import RhythmPath from '../overlays/RhythmPath';
import ContinuousFlowOverlay from '../overlays/ContinuousFlowOverlay';
import SPLOutput from '../overlays/SPLOutput';
import Effortless25Overlay from '../overlays/Effortless25Overlay';
import ComparisonOverlay from '../overlays/ComparisonOverlay';

export default function SwimmerRig({
  drill,
  isCorrect,
  playbackSpeed,
  activeTag,
  reducedMotion = false,
}) {
  const bodyRotation = getBodyRotation(drill, isCorrect);

  const isFlutter = drill === 'flutter';
  const isBreathing = drill === 'breathing';
  const isTripleSwitch = drill === 'tripleSwitch';
  const isRhythm = drill === 'rhythm';
  const isContinuousFlow = drill === 'continuousFlow';
  const isSPL = drill === 'spl';
  const isEffortless25 = drill === 'effortless25';
  const isComparison = drill === 'comparison';

  const getTagHighlight = (tag) => {
    if (!activeTag) return null;
    const lowerTag = tag.toLowerCase();
    const lowerActive = activeTag.toLowerCase();

    // Map keywords to body parts
    if (lowerActive.includes('head') && lowerTag === 'head') return true;
    if ((lowerActive.includes('chest') || lowerActive.includes('press')) && lowerTag === 'chest') return true;
    if ((lowerActive.includes('hips') || lowerActive.includes('leg') || lowerActive.includes('kick')) && lowerTag === 'hips') return true;
    if (lowerActive.includes('arm') && lowerTag === 'arm') return true;

    return false;
  };

  return (
    <motion.div
      className="absolute left-[8%] top-[28%] h-[150px] w-[78%] md:top-[34%] md:h-[190px]"
      data-motion={reducedMotion ? 'static' : 'animated'}
      animate={reducedMotion ? false : { x: getTravel(drill), y: [0, -3, 0] }}
      transition={{
        duration: 8 / playbackSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 900 240" className="h-full w-full overflow-visible">
        <motion.g
          animate={
            reducedMotion
              ? false
              : isCorrect
              ? {
                  rotate: [bodyRotation, bodyRotation - 0.4, bodyRotation],
                  y: [0, -2, 0],
                }
              : {
                  rotate: [7, 7.5, 7],
                  y: [16, 18, 16],
                }
          }
          transition={{
            duration: 6 / playbackSpeed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '450px 120px' }}
        >
          <motion.path
            d="M115 122 C80 116, 50 116, 18 122"
            fill="none"
            stroke="rgba(186,230,253,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
            animate={reducedMotion ? false : {
              opacity: isCorrect
                ? [0.15, 0.45, 0.15]
                : [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 3 / playbackSpeed,
              repeat: Infinity,
            }}
          />

          <path
            d="M530 112 C615 90, 705 82, 815 92"
            fill="none"
            stroke="rgba(241,245,249,0.96)"
            strokeWidth="30"
            strokeLinecap="round"
          />

          <path
            d="M528 137 C625 130, 710 127, 825 135"
            fill="none"
            stroke="rgba(226,232,240,0.96)"
            strokeWidth="28"
            strokeLinecap="round"
          />

          <motion.ellipse
            cx="425"
            cy="124"
            rx="150"
            ry="48"
            animate={{
              fill: getTagHighlight('chest')
                ? 'rgba(34, 211, 238, 0.8)'
                : 'rgba(248,250,252,0.98)',
              filter: getTagHighlight('chest')
                ? 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))'
                : 'none',
            }}
          />

          <motion.ellipse
            cx="285"
            cy={isCorrect ? '128' : '151'}
            rx="80"
            ry="36"
            animate={{
              fill: getTagHighlight('hips')
                ? 'rgba(34, 211, 238, 0.8)'
                : 'rgba(226,232,240,0.98)',
              filter: getTagHighlight('hips')
                ? 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))'
                : 'none',
            }}
          />

          <motion.path
            d={
              isCorrect
                ? 'M230 128 C165 126, 108 121, 52 112'
                : 'M230 150 C166 170, 112 190, 58 212'
            }
            fill="none"
            stroke="rgba(226,232,240,0.94)"
            strokeWidth="26"
            strokeLinecap="round"
            animate={
              reducedMotion
                ? false
                : isCorrect
                ? {
                    d: isFlutter
                      ? [
                          'M230 128 C165 126, 108 121, 52 112',
                          'M230 145 C165 136, 108 129, 52 122',
                          'M230 128 C165 126, 108 121, 52 112',
                        ]
                      : [
                          'M230 128 C165 126, 108 121, 52 112',
                          'M230 129 C164 130, 108 126, 52 116',
                          'M230 128 C165 126, 108 121, 52 112',
                        ],
                  }
                : undefined
            }
            transition={{
              duration: (isFlutter ? 1.1 : 4) / playbackSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.g
            animate={
              reducedMotion
                ? false
                : isCorrect
                ? isBreathing
                  ? { rotate: [0, 22, 0] }
                  : { rotate: [0, 1, 0] }
                : { rotate: [-18, -16, -18] }
            }
            transition={{
              duration: 5 / playbackSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '565px 106px' }}
          >
            <motion.circle
              cx="562"
              cy={isCorrect ? '104' : '78'}
              r="38"
              animate={{
                fill: getTagHighlight('head')
                  ? 'rgba(34, 211, 238, 0.8)'
                  : 'rgba(248,250,252,0.98)',
                filter: getTagHighlight('head')
                  ? 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))'
                  : 'none',
              }}
            />
          </motion.g>
        </motion.g>

        <RhythmPulse playbackSpeed={playbackSpeed} reducedMotion={reducedMotion} />
        {isTripleSwitch && <RhythmDots reducedMotion={reducedMotion} />}
        {isRhythm && <RhythmPath reducedMotion={reducedMotion} />}
        {isContinuousFlow && <ContinuousFlowOverlay reducedMotion={reducedMotion} />}
        {isSPL && <SPLOutput reducedMotion={reducedMotion} />}
        {isEffortless25 && <Effortless25Overlay reducedMotion={reducedMotion} />}
        {isComparison && <ComparisonOverlay reducedMotion={reducedMotion} />}
      </svg>
    </motion.div>
  );
}
