import { motion } from 'framer-motion';

export default function GhostSwimmer({ enabled = true }) {
  if (!enabled) return null;

  return (
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{ opacity: [0.06, 0.22, 0.06] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 900 240"
        className="absolute left-[8%] top-[34%] h-[190px] w-[78%] overflow-visible"
      >
        <path
          d="M230 128 C165 126, 108 121, 52 112"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="22"
          strokeLinecap="round"
        />

        <ellipse
          cx="425"
          cy="124"
          rx="150"
          ry="48"
          fill="rgba(255,255,255,0.2)"
        />
      </svg>
    </motion.div>
  );
}
