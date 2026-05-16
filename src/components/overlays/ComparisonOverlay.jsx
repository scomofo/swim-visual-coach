import { motion } from 'framer-motion';

export default function ComparisonOverlay() {
  return (
    <motion.g
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 3.5, repeat: Infinity }}
    >
      <line
        x1="450"
        y1="20"
        x2="450"
        y2="228"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeDasharray="8 10"
      />

      <text
        x="230"
        y="42"
        fill="rgba(224,242,254,0.95)"
        fontSize="20"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        efficient
      </text>

      <text
        x="670"
        y="42"
        fill="rgba(254,226,226,0.95)"
        fontSize="20"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        rushed
      </text>

      <text
        x="230"
        y="70"
        fill="rgba(186,230,253,0.7)"
        fontSize="14"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        quiet wake • stable bodyline
      </text>

      <text
        x="670"
        y="70"
        fill="rgba(254,202,202,0.7)"
        fontSize="14"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        splashy kick • sinking legs
      </text>
    </motion.g>
  );
}
