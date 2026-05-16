import { motion } from 'framer-motion';

export default function WaterBackground({ playbackSpeed = 1 }) {
  return (
    <>
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-x-0 top-20 h-px bg-white/30" />
        <div className="absolute inset-x-0 bottom-24 h-8 bg-slate-900/40" />
        <div className="absolute bottom-24 left-1/2 h-8 w-1 -translate-x-1/2 rounded-full bg-slate-950/70" />
      </div>

      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPositionX: ['0%', '100%'] }}
        transition={{
          duration: 16 / playbackSpeed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.16) 0 1px, transparent 2px), radial-gradient(circle at 70% 55%, rgba(255,255,255,0.1) 0 1px, transparent 2px)',
          backgroundSize: '220px 160px',
        }}
      />
    </>
  );
}
