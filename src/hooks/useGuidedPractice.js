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
  const isKnown = currentIndex >= 0;
  const isLastStep = isKnown && currentIndex === GUIDED_SEQUENCE.length - 1;

  const advance = () => {
    if (!isKnown || isLastStep) return;

    const nextDrill = GUIDED_SEQUENCE[currentIndex + 1];

    setDrill(nextDrill);
  };

  const complete = () => {
    if (!isKnown) return;
    markComplete(drill);
  };

  return {
    sessionStep: isKnown ? currentIndex + 1 : 0,
    totalSteps: GUIDED_SEQUENCE.length,
    advance,
    complete,
    isLastStep,
    isKnown,
  };
}
