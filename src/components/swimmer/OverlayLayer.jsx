const CAPTIONS = {
  tripleSwitch: 'R → L → R',
  rhythm: 'relaxed rhythm cycle',
  continuousFlow: 'uninterrupted whole-stroke flow',
  spl: 'efficient = 16 strokes · rushed = 24 strokes',
  effortless25: 'maintain calm rhythm for all 25 yards',
};

// Static chrome over the scene: the guide label, the per-drill stroke caption, and
// the efficient/rushed labels for the split comparison. All motion now lives in
// SwimmerScene's rAF loop, so nothing here animates.
export default function OverlayLayer({ drill, showGuides, isCorrect }) {
  const caption = CAPTIONS[drill];
  const hasCaption = Boolean(caption) && drill !== 'comparison';
  const hasSplit = drill === 'comparison';

  return (
    <>
      {showGuides && (
        <div className="absolute left-[6%] top-[8%] rounded-full bg-black/35 px-3 py-1 text-xs text-cyan-100 backdrop-blur">
          {isCorrect ? 'long, quiet bodyline' : 'lifted head + sinking legs'}
        </div>
      )}

      {hasCaption && (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-200/[0.18] bg-slate-950/50 px-5 py-2 text-sm tracking-[0.04em] text-sky-100/90 backdrop-blur">
          {caption}
        </div>
      )}

      {hasSplit && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[6%] top-[16%] rounded-2xl bg-slate-900/50 px-4 py-2 backdrop-blur">
            <div className="text-[15px] font-semibold text-sky-100/95">efficient</div>
            <div className="mt-0.5 text-xs text-sky-200/70">quiet wake • stable bodyline</div>
          </div>
          <div className="absolute left-[6%] top-[62%] rounded-2xl bg-slate-900/50 px-4 py-2 backdrop-blur">
            <div className="text-[15px] font-semibold text-red-100/95">rushed</div>
            <div className="mt-0.5 text-xs text-red-200/70">splashy kick • sinking legs</div>
          </div>
        </div>
      )}
    </>
  );
}
