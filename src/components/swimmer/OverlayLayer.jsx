import { motion } from 'framer-motion';

export default function OverlayLayer({ showGuides, isCorrect }) {
  if (!showGuides) return null;

  return (
    <>
      <motion.div
        className="absolute left-[14%] right-[14%] top-[45%] h-px bg-cyan-100/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.25, 0.75, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute left-[15%] top-[42%] rounded-full bg-black/30 px-3 py-1 text-xs text-cyan-100 backdrop-blur">
        {isCorrect
          ? 'long, quiet bodyline'
          : 'lifted head + sinking legs'}
      </div>
    </>
  );
}
