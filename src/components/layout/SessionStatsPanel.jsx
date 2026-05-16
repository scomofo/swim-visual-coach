export default function SessionStatsPanel({
  completedCount,
  playbackSpeed,
  audioMode,
}) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-100/60">
          Progress
        </div>

        <div className="mt-3 text-3xl font-semibold text-cyan-50">
          {completedCount}
        </div>

        <div className="mt-2 text-sm text-slate-300">
          drills explored this session
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-100/60">
          Playback
        </div>

        <div className="mt-3 text-3xl font-semibold text-cyan-50">
          {playbackSpeed}x
        </div>

        <div className="mt-2 text-sm text-slate-300">
          current practice pacing
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm uppercase tracking-[0.2em] text-cyan-100/60">
          Narration
        </div>

        <div className="mt-3 text-3xl font-semibold text-cyan-50">
          {audioMode ? 'ON' : 'OFF'}
        </div>

        <div className="mt-2 text-sm text-slate-300">
          guided coaching status
        </div>
      </div>
    </div>
  );
}
