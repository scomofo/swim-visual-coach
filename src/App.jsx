import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DRILLS } from './data/drills';
import useLessonProgress from './hooks/useLessonProgress';
import useOnboarding from './hooks/useOnboarding';
import useResponsiveMode from './hooks/useResponsiveMode';
import useTelemetry from './hooks/useTelemetry';
import usePerformanceMode from './hooks/usePerformanceMode';
import useGuidedNarration from './hooks/useGuidedNarration';
import useGuidedPractice from './hooks/useGuidedPractice';
import usePracticeTimer from './hooks/usePracticeTimer';
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
import GuidedPracticePanel from './components/layout/GuidedPracticePanel';
import PoolsideModePanel from './components/layout/PoolsideModePanel';
import OnboardingModal from './components/layout/OnboardingModal';

export default function App() {
  const [showGuides, setShowGuides] = useState(true);
  const [ghostMode, setGhostMode] = useState(true);
  const [audioMode, setAudioMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [mode, setMode] = useState('correct');
  const [drill, setDrill] = useState('superman');
  const [guidedMode, setGuidedMode] = useState(true);
  const [poolsideMode, setPoolsideMode] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const { showOnboarding, closeOnboarding } = useOnboarding();
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const { progress: completed, markComplete: baseMarkComplete } = useLessonProgress({ superman: true });

  const markComplete = useCallback((key) => {
    if (!completed[key]) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    baseMarkComplete(key);
  }, [completed, baseMarkComplete]);
  const { isMobile } = useResponsiveMode();
  const telemetry = useTelemetry(drill);
  const { reducedMotion } = usePerformanceMode();
  const { speakDrill } = useGuidedNarration(audioMode);

  const guidedPractice = useGuidedPractice({
    drill,
    setDrill,
    markComplete,
  });

  const practiceTimer = usePracticeTimer(poolsideMode);

  const currentDrill = DRILLS[drill];
  const isCorrect = mode === 'correct';
  const effectivePlaybackSpeed = reducedMotion ? 0.5 : playbackSpeed;

  useEffect(() => {
    speakDrill(drill);
  }, [drill, speakDrill]);

  // Reset active tag when drill changes
  const [prevDrill, setPrevDrill] = useState(drill);
  if (drill !== prevDrill) {
    setPrevDrill(drill);
    setActiveTag(null);
  }

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
        guidedMode,
        poolsideMode,
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 p-4 pb-28 text-white md:p-6 md:pb-6 transition-colors duration-700">
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal onClose={closeOnboarding} />
        )}
      </AnimatePresence>

      <div className={`mx-auto w-full max-w-6xl transition-all duration-500 ${focusMode ? 'max-w-7xl' : ''}`}>
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="fixed left-1/2 top-1/4 z-[60] -translate-x-1/2 pointer-events-none"
            >
              <div className="rounded-full bg-cyan-400 px-8 py-3 text-lg font-bold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.6)]">
                Drill Mastered!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ opacity: focusMode ? 0 : 1, height: focusMode ? 0 : 'auto', marginBottom: focusMode ? 0 : 24 }}
          className="mb-6 flex flex-col gap-4 overflow-hidden md:flex-row md:items-end md:justify-between"
        >
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
              onClick={() => setGuidedMode(!guidedMode)}
              className={`rounded-2xl px-5 py-4 text-sm font-medium transition ${
                guidedMode
                  ? 'bg-cyan-100 text-slate-950'
                  : 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {guidedMode ? 'Guided Session Active' : 'Enable Guided Session'}
            </button>

            <button
              onClick={() => setPoolsideMode(!poolsideMode)}
              className={`rounded-2xl px-5 py-4 text-sm font-medium transition ${
                poolsideMode
                  ? 'bg-cyan-100 text-slate-950'
                  : 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {poolsideMode ? 'Poolside Mode Active' : 'Enable Poolside Mode'}
            </button>

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
        </motion.div>

        {guidedMode && !focusMode && (
          <GuidedPracticePanel
            currentDrill={currentDrill}
            sessionStep={guidedPractice.sessionStep}
            totalSteps={guidedPractice.totalSteps}
            onAdvance={guidedPractice.advance}
            onRepeat={guidedPractice.repeat}
          />
        )}

        {poolsideMode && !focusMode && (
          <PoolsideModePanel
            timer={practiceTimer}
            currentDrill={currentDrill}
            guidedMode={guidedMode}
            onPause={() => practiceTimer.setRunning(false)}
            onResume={() => practiceTimer.setRunning(true)}
          />
        )}

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
            focusMode={focusMode}
            setFocusMode={setFocusMode}
          />
        </div>

        <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-cyan-800 via-sky-900 to-slate-950 shadow-2xl transition-all duration-500 ${focusMode ? 'h-[80vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]' : ''}`}>
          <WaterBackground playbackSpeed={effectivePlaybackSpeed} focusMode={focusMode} />

          <div className={isMobile ? 'relative h-[620px]' : 'relative h-[620px]'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={drill}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0"
              >
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
                  activeTag={activeTag}
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 right-6 grid gap-3 md:grid-cols-4">
              {currentDrill.tags.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTag(activeTag === item ? null : item)}
                  className={`rounded-2xl border p-4 text-left backdrop-blur transition-all ${
                    activeTag === item
                      ? 'border-cyan-300 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                      : 'border-white/10 bg-slate-950/35 hover:bg-slate-900/50'
                  }`}
                >
                  <div className={`text-sm font-medium transition-colors ${
                    activeTag === item ? 'text-white' : 'text-cyan-100'
                  }`}>
                    {item}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!focusMode && (
        <MobilePracticeBar
          currentDrill={currentDrill}
          completedCount={practiceStats.completedCount}
        />
      )}
    </div>
  );
}
