const GUIDED_SEQUENCE = [
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
];

export default function useGuidedPractice({
  drill,
  setDrill,
  markComplete,
}) {
  const currentIndex = GUIDED_SEQUENCE.indexOf(drill);

  const advance = () => {
    if (currentIndex >= GUIDED_SEQUENCE.length - 1) return;

    const nextDrill = GUIDED_SEQUENCE[currentIndex + 1];

    setDrill(nextDrill);
    markComplete(nextDrill);
  };

  const repeat = () => {
    markComplete(drill);
  };

  return {
    sessionStep: currentIndex + 1,
    totalSteps: GUIDED_SEQUENCE.length,
    advance,
    repeat,
  };
}
