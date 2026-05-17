import { useEffect, useMemo, useState } from 'react';
import { DRILLS } from './data/drills';
import useLessonProgress from './hooks/useLessonProgress';
import useResponsiveMode from './hooks/useResponsiveMode';
import useTelemetry from './hooks/useTelemetry';
import usePerformanceMode from './hooks/usePerformanceMode';
import useGuidedNarration from './hooks/useGuidedNarration';
import { exportLessonData } from './utils/exportLessons';
import WaterBackground from './components/swimmer/WaterBackground';
import GhostSwimmer from './components/swimmer/GhostSwimmer';
import OverlayLayer from './components/swimmer/OverlayLayer';
import SwimmerRig from './components/swimmer/SwimmerRig';
import PlaybackControls from './components/layout/PlaybackControls';
import CoachingPanel from './components/layout/CoachingPanel';
import LessonNavigator from './components/layout/LessonNavigator';
import MobilePracticeBar from './components/layout/MobilePracticeBar';
import SessionStatsPanel from './components/layout/SessionStatsPanel';
import PracticeStatsPanel from './components/layout/PracticeStatsPanel';

export default function App() {
  const [showGuides, setShowGuides] = useState(true);
  const [ghostMode, setGhostMode] = useState(true);
  const [audioMode, setAudioMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [mode, setMode] = useState('correct');
  const [drill, setDrill] = useState('superman');
  const { progress: completed, markComplete } = useLessonProgress({ superman: true });
  const { isMobile } = useResponsiveMode();
  const telemetry = useTelemetry(drill);
  const { reducedMotion } = usePerformanceMode();
  const { speakDrill } = useGuidedNarration(audioMode);

  const currentDrill = DRILLS[drill];
  const isCorrect = mode === 'correct';
  const effectivePlaybackSpeed = reducedMotion ? 0.5 : playbackSpeed;

  useEffect(() => {
    speakDrill(drill);
  }, [drill, speakDrill]);

  const practiceStats = useMemo(() => {
    const completedCount = Object.values(completed).filter(Boolean).length;

    return {
      completedCount,
    };
  }, [completed]);

  const localMetrics = {
    ...telemetry,
    reducedMotion,
  };

  const handleExport = () => {
    exportLessonData({
      drill,
      progress: completed,
      settings: {
        showGuides,
        ghostMode,
        audioMode,
        playbackSpeed: effectivePlaybackSpeed,
        mode,
        reducedMotion,
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 p-4 pb-28 text-white md:p-6 md:pb-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">
              Total Immersion Visual Coach
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              {currentDrill.title}
            </h1>

            <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
              {currentDrill.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleExport}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-white transition hover:bg-white/20"
            >
              Export lesson data
            </button>

            <div className="rounded-2xl border border-cyan-100/10 bg-cyan-100/5 px-5 py-4 text-sm text-cyan-100">
              {practiceStats.completedCount} drills explored
            </div>
          </div>
        </div>

        <div className="mb-4">
          <PlaybackControls
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            showGuides={showGuides}
            setShowGuides={setShowGuides}
            ghostMode={ghostMode}
            setGhostMode={setGhostMode}
            audioMode={audioMode}
            setAudioMode={setAudioMode}
            mode={mode}
            setMode={setMode}
          />
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-cyan-800 via-sky-900 to-slate-950 shadow-2xl">
          <WaterBackground playbackSpeed={effectivePlaybackSpeed} />

          <div className={isMobile ? 'relative h-[620px]' : 'relative h-[620px]'}>
            <GhostSwimmer enabled={ghostMode} />

            <OverlayLayer
              drill={drill}
              showGuides={showGuides}
              isCorrect={isCorrect}
            />

            <SwimmerRig
              drill={drill}
              isCorrect={isCorrect}
              showGuides={showGuides}
              playbackSpeed={effectivePlaybackSpeed}
            />

            <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-4">
              {currentDrill.tags.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur"
                >
                  <div className="text-sm font-medium text-cyan-100">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SessionStatsPanel
          completedCount={practiceStats.completedCount}
          playbackSpeed={effectivePlaybackSpeed}
          audioMode={audioMode}
        />

        <CoachingPanel
          drill={drill}
          currentDrill={currentDrill}
          audioMode={audioMode}
        />

        <PracticeStatsPanel metrics={localMetrics} />

        <LessonNavigator
          drill={drill}
          setDrill={setDrill}
          completed={completed}
          markComplete={markComplete}
        />
      </div>

      <MobilePracticeBar
        currentDrill={currentDrill}
        completedCount={practiceStats.completedCount}
      />
    </div>
  );
}
