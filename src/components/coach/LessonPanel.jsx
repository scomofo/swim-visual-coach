import { ArrowLeft, ArrowRight, Check, Lightbulb, Waves } from 'lucide-react';
import { DRILLS, DRILL_ORDER } from '../../data/drills';
import { useCoach } from '../../store/coach';
export function LessonPanel() {
  const drillId = useCoach((s) => s.drill);
  const completed = useCoach((s) => s.completed);
  const markComplete = useCoach((s) => s.markComplete);
  const setDrill = useCoach((s) => s.setDrill);
  const drill = DRILLS[drillId];
  const idx = DRILL_ORDER.indexOf(drillId);
  const done = Boolean(completed[drillId]);
  const last = idx === DRILL_ORDER.length - 1;
  return (
    <aside className="lesson-panel" aria-label="Lesson guidance">
      <div className="panel-heading">
        <Lightbulb
          className="size-4 text-accent"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h2 className="eyebrow">The coaching cue</h2>
      </div>
      <blockquote className="coach-cue">{drill.coach}</blockquote>
      <div className="watch-card">
        <span className="eyebrow">Watch for this</span>
        <p>{drill.narration}</p>
      </div>
      <details className="lesson-notes">
        <summary>Read the full lesson</summary>
        <p>{drill.description}</p>
      </details>
      <div className="practice-note">
        <Waves className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <p>
          Learn the cue here. Mark it mastered when you can use it comfortably
          in the water.
        </p>
      </div>
      <button
        type="button"
        onClick={() => markComplete(drillId)}
        disabled={done}
        className="mastery-button"
      >
        <Check className="size-4" aria-hidden="true" />
        {done ? 'Mastered' : 'Mark mastered'}
      </button>
      <div className="lesson-navigation">
        <button
          type="button"
          aria-label="Previous drill"
          disabled={idx === 0}
          onClick={() => setDrill(DRILL_ORDER[idx - 1])}
          className="previous-button"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={last}
          onClick={() => setDrill(DRILL_ORDER[idx + 1])}
          className="next-button"
        >
          Next drill
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="next-lesson">
        {last ? (
          'Keep exploring or revisit any lesson.'
        ) : (
          <>
            Up next<span>{DRILLS[DRILL_ORDER[idx + 1]].title}</span>
          </>
        )}
      </p>
    </aside>
  );
}
