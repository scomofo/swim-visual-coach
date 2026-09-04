import { useEffect, useState } from 'react';

export function LanePlaceholder() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a3a48_0%,#061018_55%,#040c12_100%)]" />
      <div className="absolute inset-x-0 top-[42%] h-px bg-accent/30" />
      <div className="absolute inset-x-[12%] top-[38%] h-16 rounded-full bg-fg/5 blur-2xl" />
      <p className="absolute inset-x-0 bottom-6 text-center text-sm text-muted">
        Filling the lane…
      </p>
    </div>
  );
}

export function LaneView() {
  const [Canvas, setCanvas] = useState(null);

  useEffect(() => {
    let alive = true;
    import('../pool/PoolCanvas')
      .then((mod) => {
        if (alive) setCanvas(() => mod.PoolCanvas);
      })
      .catch(() => {
        if (alive) setCanvas(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!Canvas) return <LanePlaceholder />;
  return <Canvas />;
}
