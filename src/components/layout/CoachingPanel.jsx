export default function CoachingPanel({ currentDrill, audioMode }) {
  return (
    <div className="mt-5 rounded-[2rem] border border-cyan-200/10 bg-cyan-100/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-cyan-50">
            Coaching Layer
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {currentDrill.coach}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-100/10 bg-slate-950/40 px-5 py-4 text-sm text-cyan-100 backdrop-blur">
          Next: {currentDrill.next}
        </div>
      </div>

      {audioMode && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
          AI voice script: “Slow down. Notice the water getting quieter.
          Reset before fatigue teaches the wrong pattern.”
        </div>
      )}
    </div>
  );
}
