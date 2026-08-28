export const GUIDED_SEQUENCE = [
  'superman',
  'flutter',
  'chestPress',
  'skating',
  'breathing',
  'singleSwitch',
  'tripleSwitch',
  'rhythm',
  'continuousFlow',
  'spl',
  'effortless25',
  'comparison',
];

export default function useGuidedPractice({
  drill,
  setDrill,
  markComplete,
}) {
  const currentIndex = GUIDED_SEQUENCE.indexOf(drill);
  const isLastStep = currentIndex === GUIDED_SEQUENCE.length - 1;

  const advance = () => {
    if (currentIndex < 0 || isLastStep) return;

    const nextDrill = GUIDED_SEQUENCE[currentIndex + 1];

    setDrill(nextDrill);
  };

  const complete = () => {
    markComplete(drill);
  };

  return {
    sessionStep: currentIndex + 1,
    totalSteps: GUIDED_SEQUENCE.length,
    advance,
    complete,
    isLastStep,
  };
}
