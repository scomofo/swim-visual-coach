import { motion } from 'framer-motion';

export default function WaterBackground({ playbackSpeed = 1 }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {/* Deep water gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/40 via-sky-950 to-slate-950" />

      {/* Animated Caustics Layer 1 */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20 / playbackSpeed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(150%) brightness(120%) blur(1px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Animated Caustics Layer 2 (Faster, for depth) */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['100% 100%', '0% 0%'],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 15 / playbackSpeed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(120%) brightness(150%) blur(2px)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Surface Ripples */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-x-0 top-[25%] h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
        <div className="absolute inset-x-0 top-[45%] h-px bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent" />
        <div className="absolute inset-x-0 top-[65%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Subtle floating particles */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundPositionX: ['0%', '100%'] }}
        transition={{
          duration: 25 / playbackSpeed,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.1) 0 1px, transparent 2px), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0 1px, transparent 2px)',
          backgroundSize: '300px 300px',
        }}
      />
    </div>
  );
}
