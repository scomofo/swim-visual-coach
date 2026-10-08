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
      <div className="h-1.5 overflow-hidden rounded-full bg-bg/70" role="meter" aria-label={`${label} drag illustration`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
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
      className="drag-panel"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="eyebrow">Water resistance</h2>
        <p className="drag-value">{pct}<span>/100</span></p>
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
      <p className="simulation-note">Illustrative model · lower is quieter.<br />Not a measurement of your swimming.</p>
    </aside>
  );
}
