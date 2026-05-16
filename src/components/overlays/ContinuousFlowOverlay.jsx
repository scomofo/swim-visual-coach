import { motion } from 'framer-motion';

export default function ContinuousFlowOverlay() {
  return (
    <motion.g
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      <path
        d="M120 110 C240 90, 360 140, 480 118 C600 96, 700 132, 820 112"
        fill="none"
        stroke="rgba(186,230,253,0.72)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="18 18"
      />

      <text
        x="470"
        y="76"
        fill="rgba(224,242,254,0.95)"
        fontSize="22"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        uninterrupted whole-stroke flow
      </text>
    </motion.g>
  );
}
