export function getBodyRotation(drill, isCorrect = true) {
  if (!isCorrect) return 7;

  const rotations = {
    skating: -24,
    breathing: -18,
    singleSwitch: -10,
    tripleSwitch: -14,
    rhythm: -8,
    continuousFlow: -12,
    spl: -4,
    effortless25: -10,
    chestPress: -6,
  };

  return rotations[drill] || 0;
}

export function getTravel(drill) {
  const map = {
    tripleSwitch: [0, 24, 48, 24, 0],
    rhythm: [0, 28, 0],
    continuousFlow: [0, 90],
    spl: [0, 60],
    effortless25: [0, 120],
  };

  return map[drill] || [0, 42, 0];
}
