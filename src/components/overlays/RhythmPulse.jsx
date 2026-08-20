import { motion } from 'framer-motion';

export default function RhythmPulse({ playbackSpeed = 1 }) {
  return (
    <motion.g>
      {/* Visual pulse around the core/head area to represent patient timing */}
      <motion.circle
        cx="562"
        cy="104"
        r="45"
        fill="none"
        stroke="rgba(103, 232, 249, 0.4)"
        strokeWidth="2"
        animate={{
          r: [45, 75],
          opacity: [0.6, 0],
        }}
        transition={{
          duration: 3 / playbackSpeed,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.circle
        cx="562"
        cy="104"
        r="45"
        fill="none"
        stroke="rgba(103, 232, 249, 0.2)"
        strokeWidth="1"
        animate={{
          r: [45, 90],
          opacity: [0.4, 0],
        }}
        transition={{
          duration: 3 / playbackSpeed,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.5 / playbackSpeed,
        }}
      />
    </motion.g>
  );
}
