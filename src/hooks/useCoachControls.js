import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DRILLS } from '../data/drills';
import useLessonProgress from './useLessonProgress';
import useOnboarding from './useOnboarding';
import useTelemetry from './useTelemetry';
import usePerformanceMode from './usePerformanceMode';
import useGuidedNarration from './useGuidedNarration';
import useGuidedPractice from './useGuidedPractice';
import usePracticeTimer from './usePracticeTimer';
import { exportLessonData } from '../utils/exportLessons';

export default function useCoachControls() {
  const [showGuides, setShowGuides] = useState(true);
  const [ghostMode, setGhostMode] = useState(true);
  const [audioMode, setAudioMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [mode, setMode] = useState('correct');
  const [drill, setDrill] = useState('superman');
  const [camera, setCamera] = useState('quarter');
  const [guidedMode, setGuidedMode] = useState(true);
  const [poolsideMode, setPoolsideMode] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const { showOnboarding, closeOnboarding } = useOnboarding();
  const { progress: completed, markComplete: baseMarkComplete } = useLessonProgress({});
  const celebrationTimeoutRef = useRef(null);

  const markComplete = useCallback((key) => {
    if (!completed[key]) {
      setShowCelebration(true);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        celebrationTimeoutRef.current = null;
      }, 2000);
    }
    baseMarkComplete(key);
  }, [completed, baseMarkComplete]);

  useEffect(() => () => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
  }, []);

  const telemetry = useTelemetry(drill);
  const { reducedMotion } = usePerformanceMode();
  const { speakDrill } = useGuidedNarration(audioMode);

  // Clear tag highlights at the source of drill changes (no reset effect needed)
  const handleSetDrill = useCallback((next) => {
    setActiveTag(null);
    setDrill(next);
  }, []);

  const guidedPractice = useGuidedPractice({
    drill,
    setDrill: handleSetDrill,
    markComplete,
  });

  const practiceTimer = usePracticeTimer(poolsideMode && !showOnboarding);

  const currentDrill = DRILLS[drill] ?? DRILLS.superman;
  const isCorrect = mode === 'correct';

  useEffect(() => {
    speakDrill(drill);
  }, [drill, speakDrill]);

  const practiceStats = useMemo(() => ({
    completedCount: Object.values(completed).filter(Boolean).length,
  }), [completed]);

  const localMetrics = useMemo(() => ({
    ...telemetry,
    reducedMotion,
  }), [telemetry, reducedMotion]);

  const handleExport = useCallback(() => {
    exportLessonData({
      drill,
      progress: completed,
      settings: {
        showGuides,
        ghostMode,
        audioMode,
        playbackSpeed,
        mode,
        reducedMotion,
        guidedMode,
        poolsideMode,
      },
    });
  }, [drill, completed, showGuides, ghostMode, audioMode, playbackSpeed, mode, reducedMotion, guidedMode, poolsideMode]);

  return {
    showGuides, setShowGuides,
    ghostMode, setGhostMode,
    audioMode, setAudioMode,
    playbackSpeed, setPlaybackSpeed,
    mode, setMode,
    drill, setDrill: handleSetDrill,
    camera, setCamera,
    guidedMode, setGuidedMode,
    poolsideMode, setPoolsideMode,
    focusMode, setFocusMode,
    showOnboarding, closeOnboarding,
    showCelebration, setShowCelebration,
    activeTag, setActiveTag,
    completed, markComplete,
    telemetry, reducedMotion,
    guidedPractice, practiceTimer,
    currentDrill, isCorrect,
    practiceStats, localMetrics,
    handleExport,
  };
}
