export default function PracticeStatsPanel({ metrics }) {
  return (
    <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Practice Stats</h2>
          <p className="mt-2 text-sm text-slate-300">
            Local session feedback for pacing and drill exploration.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/40 px-5 py-3 text-sm text-cyan-100">
          browser-only prototype
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
            Elapsed
          </div>
          <div className="mt-2 text-2xl font-semibold text-cyan-50">
            {metrics.elapsedSeconds}s
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
            Drill Changes
          </div>
          <div className="mt-2 text-2xl font-semibold text-cyan-50">
            {metrics.drillChanges}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
            Motion Mode
          </div>
          <div className="mt-2 text-2xl font-semibold text-cyan-50">
            {metrics.reducedMotion ? 'Reduced' : 'Full'}
          </div>
        </div>
      </div>
    </div>
  );
}
