import { motion } from 'framer-motion';

export default function GuidedPracticePanel({
  currentDrill,
  sessionStep,
  totalSteps,
  onAdvance,
  onRepeat,
}) {
  const progress = (sessionStep / totalSteps) * 100;

  return (
    <div className="mb-5 rounded-[2rem] border border-cyan-200/10 bg-cyan-100/5 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-100/60">
            Guided Practice Session
          </div>

          <h2 className="mt-2 text-2xl font-semibold text-cyan-50">
            {currentDrill.title}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Stay with one sensation at a time. Slow movement creates clarity.
            Repeat the drill calmly before advancing.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/40 px-5 py-3 text-sm text-cyan-100">
            Step {sessionStep} of {totalSteps}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRepeat}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/20"
            >
              Repeat Drill
            </button>

            <button
              onClick={onAdvance}
              className="rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-white"
            >
              Advance
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-cyan-200"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
