export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-100/60">
          Welcome
        </div>

        <h2 className="mt-3 text-3xl font-semibold text-cyan-50">
          Swim calmly. Learn visually.
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          This system teaches Total Immersion freestyle through motion,
          rhythm, balance, and visual coaching rather than overwhelming
          technical instruction.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold text-cyan-50">
              Slow Down
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Quiet water and patient timing matter more than force.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold text-cyan-50">
              Watch Closely
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Observe body position and rhythm before attempting speed.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold text-cyan-50">
              Stay Relaxed
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Tension creates drag. Calm movement creates efficiency.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 rounded-2xl bg-cyan-100 px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-white"
        >
          Begin Practice
        </button>
      </div>
    </div>
  );
}
