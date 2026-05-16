import { DRILLS, DRILL_ORDER } from '../../data/drills';

export default function LessonNavigator({
  drill,
  setDrill,
  completed,
  markComplete,
}) {
  return (
    <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Curriculum Progression
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Interactive lesson navigation and progression tracking.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/40 px-5 py-3 text-sm text-cyan-100">
          {Object.values(completed).filter(Boolean).length} /
          {DRILL_ORDER.length} completed
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {DRILL_ORDER.map((key, index) => (
          <button
            key={key}
            onClick={() => {
              setDrill(key);
              markComplete(key);
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              drill === key
                ? 'border-cyan-200/60 bg-cyan-100/15'
                : completed[key]
                ? 'border-cyan-200/25 bg-cyan-100/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
              {String(index + 1).padStart(2, '0')} •
              {DRILLS[key].phase}
            </div>

            <div className="mt-2 text-sm font-semibold text-cyan-50">
              {DRILLS[key].title}
            </div>

            <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">
              {DRILLS[key].description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
