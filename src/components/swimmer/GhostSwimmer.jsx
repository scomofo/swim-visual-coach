import { motion } from 'framer-motion';

export default function GhostSwimmer({ enabled = true, reducedMotion = false }) {
  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      animate={reducedMotion ? { opacity: 0.28 } : { opacity: [0.18, 0.38, 0.18] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 900 240"
        className="absolute left-[8%] top-[28%] h-[150px] w-[78%] overflow-visible md:top-[34%] md:h-[190px]"
      >
        <line
          x1="50"
          y1="124"
          x2="835"
          y2="124"
          stroke="rgba(103,232,249,0.75)"
          strokeWidth="2"
          strokeDasharray="12 10"
        />
        <path
          d="M316 127 Q205 132 72 138"
          fill="none"
          stroke="rgba(165,243,252,0.88)"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M316 140 Q202 144 69 147"
          fill="none"
          stroke="rgba(125,211,252,0.7)"
          strokeWidth="21"
          strokeLinecap="round"
        />
        <path
          d="M320 126 C380 119 451 111 510 108"
          fill="none"
          stroke="rgba(207,250,254,0.88)"
          strokeWidth="66"
          strokeLinecap="round"
        />
        <path
          d="M505 106 L635 105 L806 108"
          fill="none"
          stroke="rgba(207,250,254,0.9)"
          strokeWidth="23"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="575"
          cy="101"
          r="36"
          fill="rgba(207,250,254,0.82)"
          stroke="rgba(103,232,249,0.9)"
          strokeWidth="2"
        />
        <g transform="translate(692 31)">
          <rect width="126" height="29" rx="14.5" fill="rgba(8,47,73,0.86)" stroke="rgba(103,232,249,0.7)" />
          <text x="63" y="19" textAnchor="middle" fill="#cffafe" fontSize="11" fontWeight="700" letterSpacing="1.5">
            IDEAL LINE
          </text>
        </g>
      </svg>
    </motion.div>
  );
}
