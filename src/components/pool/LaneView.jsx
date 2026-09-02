import { useEffect, useState } from 'react';

export function LanePlaceholder() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/50 via-sky-950 to-slate-950" />
      <div className="absolute inset-x-0 top-[42%] h-px bg-cyan-200/30" />
      <p className="absolute inset-x-0 bottom-6 text-center text-sm text-cyan-100/70">
        Filling the lane…
      </p>
    </div>
  );
}

export default function LaneView(props) {
  const [Canvas, setCanvas] = useState(null);

  useEffect(() => {
    let alive = true;
    import('./PoolCanvas')
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
  return <Canvas {...props} />;
}
