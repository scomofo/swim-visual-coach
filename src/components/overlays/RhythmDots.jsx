import { motion } from 'framer-motion';

export default function RhythmDots() {
  return (
    <motion.g
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    >
      <circle
        cx="360"
        cy="188"
        r="8"
        fill="rgba(186,230,253,0.95)"
      />

      <circle
        cx="470"
        cy="188"
        r="8"
        fill="rgba(186,230,253,0.95)"
      />

      <circle
        cx="580"
        cy="188"
        r="8"
        fill="rgba(186,230,253,0.95)"
      />

      <text
        x="470"
        y="220"
        fill="rgba(224,242,254,0.92)"
        fontSize="20"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        R → L → R
      </text>
    </motion.g>
  );
}
