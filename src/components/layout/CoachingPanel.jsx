import { motion, AnimatePresence } from 'framer-motion';

export default function CoachingPanel({ drill, currentDrill, audioMode }) {
  return (
    <div className="mt-5 rounded-[2rem] border border-cyan-200/20 bg-gradient-to-br from-cyan-950/40 to-slate-950/60 p-8 backdrop-blur-md shadow-lg">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-200/80">
              Coach's Focus
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={drill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-4 text-xl font-medium leading-relaxed text-white md:text-2xl"
            >
              "{currentDrill.coach}"
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-cyan-100/10 bg-cyan-100/5 p-4 md:w-64"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/50">
            Coming Up Next
          </div>
          <div className="mt-2 text-sm font-semibold text-cyan-50">
            {currentDrill.next}
          </div>
        </motion.div>
      </div>

      {audioMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-sm text-cyan-100/70"
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          AI voice script active: “Slow down. Notice the water getting quieter. Reset before fatigue teaches the wrong pattern.”
        </motion.div>
      )}
    </div>
  );
}
