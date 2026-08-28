import { motion } from 'framer-motion';

export default function ComparisonOverlay({ reducedMotion = false }) {
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width="900" height="240" rx="30" fill="rgba(2,36,58,0.55)" />
      <rect x="8" y="42" width="430" height="184" rx="28" fill="rgba(8,145,178,0.08)" />
      <rect x="462" y="42" width="430" height="184" rx="28" fill="rgba(244,63,94,0.07)" />

      <motion.ellipse
        cx="225"
        cy="167"
        rx="185"
        ry="42"
        fill="rgba(34,211,238,0.16)"
        animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="675"
        cy="167"
        rx="185"
        ry="42"
        fill="rgba(251,113,133,0.13)"
        animate={reducedMotion ? { opacity: 0.65 } : { opacity: [0.8, 0.4, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <line
        x1="450"
        y1="44"
        x2="450"
        y2="228"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeDasharray="8 10"
      />

      <text
        x="225"
        y="28"
        fill="rgba(224,242,254,0.95)"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        EFFICIENT
      </text>

      <text
        x="675"
        y="28"
        fill="rgba(255,228,230,0.95)"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui"
        textAnchor="middle"
      >
        RUSHED
      </text>
    </g>
  );
}
