import { Check } from 'lucide-react';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';

export function DrillRail() {
  const drill = useCoach((s) => s.drill);
  const setDrill = useCoach((s) => s.setDrill);
  const completed = useCoach((s) => s.completed);
  const markComplete = useCoach((s) => s.markComplete);
  const current = DRILLS[drill];
  const idx = DRILL_ORDER.indexOf(drill);
  const isLast = idx === DRILL_ORDER.length - 1;
  const doneCount = DRILL_ORDER.filter((id) => completed[id]).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
            Curriculum
          </p>
          <p className="mt-1 text-sm tabular-nums text-muted">
            {doneCount} / {DRILL_ORDER.length} mastered
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => markComplete(drill)}
            disabled={Boolean(completed[drill])}
            className="h-11 rounded-md bg-surface-2 px-3 text-sm font-medium text-fg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-40"
          >
            {completed[drill] ? 'Mastered' : 'Mark mastered'}
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => {
              const next = DRILL_ORDER[idx + 1];
              if (next) setDrill(next);
            }}
            className="h-11 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-40"
          >
            Next drill
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DRILL_ORDER.map((id, i) => {
          const d = DRILLS[id];
          const active = id === drill;
          const done = Boolean(completed[id]);
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDrill(id)}
              className={cn(
                'min-w-[9.5rem] shrink-0 rounded-lg px-3 py-3 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96]',
                active
                  ? 'bg-accent/15 shadow-[var(--shadow-border-hover)]'
                  : 'bg-surface-2 hover:bg-surface-2/80',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {String(i + 1).padStart(2, '0')} · {d.phase}
                </span>
                {done ? <Check className="size-3.5 text-accent" strokeWidth={2} /> : null}
              </div>
              <div className="mt-1 text-sm font-medium text-fg">{d.title}</div>
            </button>
          );
        })}
      </div>

      <p className="hidden text-sm leading-6 text-muted md:block">
        Next: {current.next}
      </p>
    </div>
  );
}
