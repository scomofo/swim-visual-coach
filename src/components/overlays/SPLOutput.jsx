import { motion } from 'framer-motion';

export default function SPLOutput() {
  return (
    <motion.g
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <rect
        x="120"
        y="34"
        width="230"
        height="78"
        rx="18"
        fill="rgba(15,23,42,0.55)"
      />

      <rect
        x="540"
        y="34"
        width="230"
        height="78"
        rx="18"
        fill="rgba(15,23,42,0.55)"
      />

      <text
        x="235"
        y="68"
        fill="rgba(224,242,254,0.92)"
        fontSize="18"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        inefficient = 24 strokes
      </text>

      <text
        x="655"
        y="68"
        fill="rgba(224,242,254,0.92)"
        fontSize="18"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        efficient = 16 strokes
      </text>
    </motion.g>
  );
}
