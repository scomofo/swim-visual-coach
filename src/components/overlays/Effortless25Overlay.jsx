import { motion } from 'framer-motion';

export default function Effortless25Overlay() {
  return (
    <motion.g
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <rect
        x="270"
        y="28"
        width="360"
        height="78"
        rx="22"
        fill="rgba(15,23,42,0.58)"
      />

      <text
        x="450"
        y="62"
        fill="rgba(224,242,254,0.96)"
        fontSize="24"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        maintain calm rhythm for all 25 yards
      </text>

      <text
        x="450"
        y="90"
        fill="rgba(186,230,253,0.72)"
        fontSize="16"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        breathing stays relaxed • SPL remains stable
      </text>
    </motion.g>
  );
}
