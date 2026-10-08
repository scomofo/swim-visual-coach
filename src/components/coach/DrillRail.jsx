import { Check, ChevronRight } from 'lucide-react';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { cn } from '../../lib/utils';
import { useCoach } from '../../store/coach';
const PHASES = [...new Set(DRILL_ORDER.map((id) => DRILLS[id].phase))];
export function DrillRail() {
  const drill = useCoach((s) => s.drill);
  const setDrill = useCoach((s) => s.setDrill);
  const completed = useCoach((s) => s.completed);
  const doneCount = DRILL_ORDER.filter((id) => completed[id]).length;
  return (
    <nav className="drill-rail" aria-label="Curriculum">
      <div className="rail-heading">
        <p className="eyebrow">Your learning path</p>
        <h2>Build a better stroke.</h2>
        <p className="rail-progress">
          {doneCount} / {DRILL_ORDER.length} mastered
        </p>
        <div
          className="rail-progress-track"
          role="progressbar"
          aria-label="Mastered drills"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={DRILL_ORDER.length}
        >
          <span
            style={{ width: `${(doneCount / DRILL_ORDER.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="drill-groups">
        {PHASES.map((phase) => (
          <div className="drill-group" key={phase}>
            <p className="phase-label">{phase}</p>
            {DRILL_ORDER.filter((id) => DRILLS[id].phase === phase).map(
              (id) => {
                const active = id === drill;
                const done = Boolean(completed[id]);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setDrill(id)}
                    aria-current={active ? 'step' : undefined}
                    className={cn('drill-link', active && 'is-active')}
                  >
                    <span
                      aria-hidden="true"
                      className={cn('drill-number', done && 'is-complete')}
                    >
                      {done ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        String(DRILL_ORDER.indexOf(id) + 1).padStart(2, '0')
                      )}
                    </span>
                    <span>
                      {DRILLS[id].title}
                      {done && <span className="sr-only"> · mastered</span>}
                    </span>
                    {active && (
                      <ChevronRight
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        ))}
      </div>
      <p className="rail-note">
        Go at your own pace.
        <br />
        Every lesson is yours to explore.
      </p>
    </nav>
  );
}
