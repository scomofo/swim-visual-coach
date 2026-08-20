import { motion } from 'framer-motion';

export default function PoolsideModePanel({
  timer,
  currentDrill,
  guidedMode,
  onPause,
  onResume,
}) {
  const minutes = Math.floor(timer.seconds / 60)
    .toString()
    .padStart(2, '0');

  const seconds = (timer.seconds % 60)
    .toString()
    .padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-5 rounded-[3rem] border border-cyan-400/30 bg-slate-950/80 p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(34,211,238,0.1)]"
    >
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V12L15 15"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div className="text-sm font-bold uppercase tracking-[0.4em] text-cyan-400/80">
              Active Practice
            </div>
          </div>

          <h2 className="mt-5 text-5xl font-bold tracking-tight text-white lg:text-7xl">
            {currentDrill.title}
          </h2>

          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300">
            {currentDrill.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {currentDrill.tags.map(tag => (
              <span key={tag} className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm font-medium text-cyan-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 lg:items-end lg:pl-10">
          <div className="w-full rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-center shadow-inner lg:w-72">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-500/60">
              Practice Time
            </div>

            <div className="mt-3 font-mono text-7xl font-bold tracking-tighter text-cyan-400">
              {minutes}:{seconds}
            </div>
          </div>

          <div className="flex w-full gap-4 lg:w-auto">
            {timer.running ? (
              <button
                onClick={onPause}
                className="flex-1 rounded-3xl border-2 border-white/10 bg-white/5 py-6 text-xl font-bold text-white transition hover:bg-white/10 lg:px-12"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex-1 rounded-3xl bg-cyan-400 py-6 text-xl font-bold text-slate-950 transition hover:bg-white lg:px-12"
              >
                Resume
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className={`h-2 w-2 rounded-full ${guidedMode ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
            {guidedMode ? 'Guided Session Active' : 'Free Practice'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
