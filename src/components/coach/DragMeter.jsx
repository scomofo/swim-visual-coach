import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';

function Bar({ label, value, hint }) {
  const hot = value > 0.55;
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-fg">{label}</span>
        <span className="text-xs uppercase tracking-[0.14em] text-muted">{hint}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg/70">
        <div
          className={cn('h-full rounded-full', hot ? 'bg-warn' : 'bg-accent')}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function DragMeter() {
  const drag = useCoach((s) => s.hudDrag);
  const compare = useCoach((s) => s.drill) === 'comparison';
  const pct = Math.round(drag.total * 100);

  return (
    <aside
      data-testid="drag-meter"
      className="absolute right-3 top-4 z-10 w-48 rounded-lg bg-bg/55 px-3 py-3 text-fg backdrop-blur-sm md:right-5 md:top-5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Drag</p>
        <p className="font-display text-lg tabular-nums leading-none">{pct}</p>
      </div>
      <p className={cn('mt-1 text-sm', drag.label === 'Noisy' ? 'text-warn' : 'text-accent')}>
        {drag.label}
      </p>
      <div className="mt-3 grid gap-2.5">
        <Bar label="Form" value={drag.form} hint="shape" />
        <Bar label="Wave" value={drag.wave} hint="surface" />
        <Bar label="Skin" value={drag.skin} hint="friction" />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{drag.note}</p>
      {compare && drag.otherTotal != null ? (
        <p className="mt-2 text-xs tabular-nums text-muted">
          Quiet {pct} · rushed {Math.round(drag.otherTotal * 100)}
        </p>
      ) : null}
    </aside>
  );
}
