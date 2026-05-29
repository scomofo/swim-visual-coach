import { motion } from 'framer-motion';

export default function SessionStatsPanel({
  completedCount,
  playbackSpeed,
  audioMode,
}) {
  const achievements = [
    { id: 'explorer', label: 'Balanced Explorer', condition: completedCount >= 3 },
    { id: 'pro', label: 'Immersion Pro', condition: completedCount >= 8 },
  ];

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

      <div className="col-span-full rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-cyan-100">Session Achievements</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Unlocked</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {achievements.map((ach) => (
            <motion.div
              key={ach.id}
              initial={false}
              animate={{
                opacity: ach.condition ? 1 : 0.3,
                scale: ach.condition ? 1 : 0.95,
              }}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-3 transition-colors ${
                ach.condition
                  ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100'
                  : 'border-white/5 bg-white/5 text-slate-500'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${ach.condition ? 'bg-cyan-400' : 'bg-slate-700'}`} />
              <span className="text-sm font-semibold">{ach.label}</span>
            </motion.div>
          ))}

          {completedCount === 0 && (
            <p className="text-sm italic text-slate-500">Explore more drills to unlock achievements.</p>
          )}
        </div>
      </div>
    </div>
  );
}
