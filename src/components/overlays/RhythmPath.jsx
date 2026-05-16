import { motion } from 'framer-motion';

export default function RhythmPath() {
  return (
    <motion.g
      animate={{ opacity: [0.25, 1, 0.25] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <path
        d="M180 198 C260 178, 340 218, 420 198 C500 178, 580 218, 660 198"
        fill="none"
        stroke="rgba(125,211,252,0.65)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="12 16"
      />

      <text
        x="440"
        y="236"
        fill="rgba(224,242,254,0.95)"
        fontSize="20"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        relaxed rhythm cycle
      </text>
    </motion.g>
  );
}
