const CAMERAS = [
  { id: 'side', label: 'Side' },
  { id: 'quarter', label: '3/4' },
  { id: 'overhead', label: 'Overhead' },
  { id: 'front', label: 'Head-on' },
  { id: 'under', label: 'Under' },
];

import { useHudDrag } from '../../state/hudStore';

export default function PlaybackControls({
  playbackSpeed,
  setPlaybackSpeed,
  showGuides,
  setShowGuides,
  ghostMode,
  setGhostMode,
  audioMode,
  setAudioMode,
  mode,
  setMode,
  focusMode,
  setFocusMode,
  camera = 'quarter',
  setCamera,
  dragTotal = null,
}) {
  const storeDrag = useHudDrag();
  const effectiveDragTotal = dragTotal ?? storeDrag?.total ?? 0;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMode('correct')}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            mode === 'correct'
              ? 'bg-white text-slate-950'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Correct
        </button>

        <button
          onClick={() => setMode('wrong')}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            mode === 'wrong'
              ? 'bg-white text-slate-950'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Common Error
        </button>

        <button
          onClick={() => setShowGuides(!showGuides)}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          {showGuides ? 'Hide Guides' : 'Show Guides'}
        </button>

        <button
          onClick={() => setGhostMode(!ghostMode)}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          {ghostMode ? 'Ghost On' : 'Ghost Off'}
        </button>

        <button
          onClick={() => setAudioMode(!audioMode)}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
        >
          {audioMode ? 'Narration On' : 'Narration Off'}
        </button>

        <button
          onClick={() => setFocusMode(!focusMode)}
          className={`rounded-2xl px-4 py-2 text-sm transition ${
            focusMode
              ? 'bg-cyan-100 text-slate-950 font-medium'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {focusMode ? 'Exit Focus' : 'Focus Mode'}
        </button>

        {[0.5, 1, 1.5].map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`rounded-2xl px-4 py-2 text-sm transition ${
              playbackSpeed === speed
                ? 'bg-cyan-100 text-slate-950'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {speed}x
          </button>
        ))}

        <span className="ml-auto rounded-2xl bg-white/10 px-4 py-2 text-sm tabular-nums text-cyan-100">
          Drag {Math.round(effectiveDragTotal * 100)}
        </span>
      </div>

      {setCamera ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {CAMERAS.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setCamera(cam.id)}
              className={`rounded-2xl px-4 py-2 text-sm transition ${
                camera === cam.id
                  ? 'bg-cyan-100 text-slate-950'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
