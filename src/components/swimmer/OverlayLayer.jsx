import { motion } from 'framer-motion';

export default function OverlayLayer({ drill, showGuides, isCorrect, reducedMotion = false }) {
  if (!showGuides || drill === 'comparison') return null;

  const color = isCorrect ? 'bg-cyan-100/70' : 'bg-amber-200/70';

  return (
    <>
      <motion.div
        className={`absolute left-[14%] right-[14%] top-[45%] h-px ${color}`}
        animate={reducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className={`absolute left-[15%] top-[39%] rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${
          isCorrect
            ? 'border-cyan-200/30 bg-cyan-950/55 text-cyan-50'
            : 'border-amber-200/30 bg-amber-950/55 text-amber-50'
        }`}
        role="status"
      >
        {isCorrect ? 'Efficient form · long and quiet' : 'Needs adjustment · high drag'}
      </div>
    </>
  );
}
