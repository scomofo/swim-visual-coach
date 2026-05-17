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
    <div className="mt-5 rounded-[2.5rem] border border-cyan-200/10 bg-slate-950/60 p-8 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-100/60">
            Poolside Mode
          </div>

          <h2 className="mt-3 text-4xl font-semibold text-cyan-50 lg:text-5xl">
            {currentDrill.title}
          </h2>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Move slowly. Stay relaxed. Let the drill become quiet before advancing.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="rounded-[2rem] border border-cyan-100/10 bg-cyan-100/5 px-8 py-6 text-center">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-100/60">
              Practice Time
            </div>

            <div className="mt-2 text-5xl font-semibold text-cyan-50">
              {minutes}:{seconds}
            </div>
          </div>

          <div className="flex gap-3">
            {timer.running ? (
              <button
                onClick={onPause}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-base text-white transition hover:bg-white/20"
              >
                Pause Session
              </button>
            ) : (
              <button
                onClick={onResume}
                className="rounded-2xl bg-cyan-100 px-6 py-4 text-base font-medium text-slate-950 transition hover:bg-white"
              >
                Resume Session
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-cyan-100/10 bg-slate-900/40 px-5 py-3 text-sm text-cyan-100">
            {guidedMode ? 'guided session active' : 'free practice mode'}
          </div>
        </div>
      </div>
    </div>
  );
}
