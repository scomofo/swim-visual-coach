export default function MobilePracticeBar({
  currentDrill,
  completedCount,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 p-4 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">
            Current Drill
          </div>

          <div className="mt-1 text-sm font-semibold text-cyan-50">
            {currentDrill.title}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100/10 bg-cyan-100/5 px-4 py-2 text-sm text-cyan-100">
          {completedCount} complete
        </div>
      </div>
    </div>
  );
}
