const POSE_KEYS = [
  'bodyRot',
  'shoulderRot',
  'headRot',
  'hipY',
  'leadArm',
  'recoverArm',
  'elbow',
  'kickAmp',
  'splash',
];

const BASE_POSE = Object.freeze({
  bodyRot: 0,
  shoulderRot: 0,
  headRot: 0,
  hipY: 0,
  leadArm: 0,
  recoverArm: 0,
  elbow: 0.72,
  kickAmp: 3,
  splash: 0,
});

const frame = (t, values = {}, ease = 'easeInOut') => ({
  t,
  ...BASE_POSE,
  ...values,
  shoulderRot: values.shoulderRot ?? (values.bodyRot ?? 0) * 1.15,
  ease,
});

const travelFrame = (t, x, ease = 'easeInOut') => ({ t, x, ease });

const travel = (distance, returnToStart = true) =>
  returnToStart
    ? [
        travelFrame(0, 0, 'glide'),
        travelFrame(0.5, distance, 'glide'),
        travelFrame(1, 0, 'glide'),
      ]
    : [
        travelFrame(0, 0, 'glide'),
        travelFrame(1, distance, 'glide'),
      ];

const incorrectBalance = (overrides = {}) => [
  frame(0, { headRot: -16, hipY: 18, leadArm: 10, elbow: 0.3, kickAmp: 15, ...overrides }),
  frame(0.5, { bodyRot: 5, headRot: -21, hipY: 24, leadArm: 15, recoverArm: 0.5, elbow: 0.2, kickAmp: 21, ...overrides }),
  frame(1, { headRot: -16, hipY: 18, leadArm: 10, recoverArm: 1, elbow: 0.3, kickAmp: 15, ...overrides }),
];

export const DRILL_POSES = Object.freeze({
  superman: {
    duration: 7.5,
    travel: { correct: travel(34), incorrect: travel(18) },
    correct: [
      frame(0, { shoulderRot: -1, recoverArm: 0.92, elbow: 0.9, kickAmp: 1, splash: 0.02 }, 'glide'),
      frame(0.5, { shoulderRot: 1, hipY: -3, leadArm: -2, recoverArm: 0.98, elbow: 1, kickAmp: 2, splash: 0.03 }, 'glide'),
      frame(1, { shoulderRot: -1, recoverArm: 0.92, elbow: 0.9, kickAmp: 1, splash: 0.02 }, 'glide'),
    ],
    incorrect: incorrectBalance({ recoverArm: 0.82 }),
  },
  flutter: {
    duration: 4.2,
    travel: { correct: travel(46), incorrect: travel(22) },
    correct: [
      frame(0, { shoulderRot: -2, hipY: -2, recoverArm: 0.94, elbow: 0.94, kickAmp: 5, splash: 0.03 }, 'glide'),
      frame(0.5, { shoulderRot: 2, hipY: -4, leadArm: -2, recoverArm: 0.98, elbow: 1, kickAmp: 7, splash: 0.05 }, 'glide'),
      frame(1, { shoulderRot: -2, hipY: -2, recoverArm: 0.94, elbow: 0.94, kickAmp: 5, splash: 0.03 }, 'glide'),
    ],
    incorrect: incorrectBalance({ kickAmp: 24, recoverArm: 0.78 }),
  },
  chestPress: {
    duration: 5.4,
    travel: { correct: travel(38), incorrect: travel(14) },
    correct: [
      frame(0, { shoulderRot: 0, hipY: 5, recoverArm: 0.9, elbow: 0.92, kickAmp: 2, splash: 0.02 }, 'glide'),
      frame(0.35, { bodyRot: -3, shoulderRot: -2, hipY: -7, leadArm: -3, recoverArm: 0.96, elbow: 1, kickAmp: 2, splash: 0.03 }, 'easeOut'),
      frame(0.7, { bodyRot: -5, shoulderRot: -3, hipY: -15, leadArm: -4, recoverArm: 1, elbow: 1, kickAmp: 1, splash: 0.02 }, 'glide'),
      frame(1, { shoulderRot: 0, hipY: 5, recoverArm: 0.9, elbow: 0.92, kickAmp: 2, splash: 0.02 }, 'glide'),
    ],
    incorrect: [
      frame(0, { headRot: -14, hipY: 18, leadArm: 9, elbow: 0.35, kickAmp: 17 }),
      frame(0.5, { bodyRot: 4, headRot: -20, hipY: 23, leadArm: 13, recoverArm: 0.55, elbow: 0.25, kickAmp: 25 }),
      frame(1, { headRot: -14, hipY: 18, leadArm: 9, recoverArm: 1, elbow: 0.35, kickAmp: 17 }),
    ],
  },
  skating: {
    duration: 6.2,
    travel: { correct: travel(48), incorrect: travel(20) },
    correct: [
      frame(0, { bodyRot: -30, shoulderRot: -40, hipY: -5, leadArm: -5, recoverArm: 0.08, elbow: 0.82, kickAmp: 3, splash: 0.02 }, 'glide'),
      frame(0.5, { bodyRot: -35, shoulderRot: -47, hipY: -7, leadArm: -7, recoverArm: 0.18, elbow: 0.9, kickAmp: 4, splash: 0.03 }, 'glide'),
      frame(1, { bodyRot: -30, shoulderRot: -40, hipY: -5, leadArm: -5, recoverArm: 0.08, elbow: 0.82, kickAmp: 3, splash: 0.02 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -4, headRot: -10, hipY: 12, leadArm: 16, recoverArm: 0.05, elbow: 0.2, kickAmp: 13 }),
      frame(0.5, { bodyRot: 7, headRot: -17, hipY: 19, leadArm: 23, recoverArm: 0.42, elbow: 0.15, kickAmp: 20 }),
      frame(1, { bodyRot: -4, headRot: -10, hipY: 12, leadArm: 16, recoverArm: 1.05, elbow: 0.2, kickAmp: 13, splash: 0.55 }, 'easeOut'),
    ],
  },
  breathing: {
    duration: 5.8,
    travel: { correct: travel(50), incorrect: travel(21) },
    correct: [
      frame(0, { bodyRot: -18, shoulderRot: -24, headRot: 0, hipY: -4, leadArm: -4, recoverArm: 0.08, elbow: 0.86, kickAmp: 3, splash: 0 }, 'glide'),
      frame(0.32, { bodyRot: -25, shoulderRot: -34, headRot: 14, hipY: -5, leadArm: -5, recoverArm: 0.24, elbow: 0.92, kickAmp: 4, splash: 0 }, 'easeInOut'),
      frame(0.55, { bodyRot: -31, shoulderRot: -40, headRot: 30, hipY: -6, leadArm: -6, recoverArm: 0.42, elbow: 0.96, kickAmp: 4, splash: 0 }, 'easeOut'),
      frame(0.78, { bodyRot: -23, shoulderRot: -29, headRot: 12, hipY: -5, leadArm: -5, recoverArm: 0.7, elbow: 0.9, kickAmp: 3, splash: 0.04 }, 'glide'),
      frame(1, { bodyRot: -18, shoulderRot: -24, headRot: 0, hipY: -4, leadArm: -4, recoverArm: 1, elbow: 0.86, kickAmp: 3, splash: 0.12 }, 'easeOut'),
    ],
    incorrect: [
      frame(0, { bodyRot: -4, headRot: -8, hipY: 12, leadArm: 9, recoverArm: 0.05, elbow: 0.28, kickAmp: 12 }),
      frame(0.45, { bodyRot: -2, headRot: -34, hipY: 24, leadArm: 17, recoverArm: 0.5, elbow: 0.12, kickAmp: 21 }),
      frame(0.7, { bodyRot: 5, headRot: -27, hipY: 20, leadArm: 14, recoverArm: 0.82, elbow: 0.18, kickAmp: 18 }),
      frame(1, { bodyRot: -4, headRot: -8, hipY: 12, leadArm: 9, recoverArm: 1, elbow: 0.28, kickAmp: 12, splash: 0.7 }, 'easeOut'),
    ],
  },
  singleSwitch: {
    duration: 5.2,
    travel: { correct: travel(58), incorrect: travel(28) },
    correct: [
      frame(0, { bodyRot: -26, shoulderRot: -38, hipY: -5, leadArm: -5, recoverArm: 0, elbow: 0.9, kickAmp: 3, splash: 0 }, 'glide'),
      frame(0.3, { bodyRot: -22, shoulderRot: -34, hipY: -5, leadArm: -5, recoverArm: 0.34, elbow: 1, kickAmp: 4, splash: 0 }, 'easeIn'),
      frame(0.62, { bodyRot: 3, shoulderRot: 13, hipY: -6, leadArm: -3, recoverArm: 0.7, elbow: 0.96, kickAmp: 5, splash: 0.08 }, 'switch'),
      frame(0.88, { bodyRot: 25, shoulderRot: 40, hipY: -5, leadArm: -5, recoverArm: 0.94, elbow: 0.92, kickAmp: 4, splash: 1 }, 'easeOut'),
      frame(1, { bodyRot: 27, shoulderRot: 36, hipY: -5, leadArm: -5, recoverArm: 1, elbow: 0.88, kickAmp: 3, splash: 0.08 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -5, shoulderRot: -8, headRot: -10, hipY: 10, leadArm: 8, recoverArm: 0, elbow: 0.25, kickAmp: 11, splash: 0 }, 'easeInOut'),
      frame(0.22, { bodyRot: -3, shoulderRot: 2, headRot: -17, hipY: 17, leadArm: 17, recoverArm: 0.7, elbow: 0.12, kickAmp: 20, splash: 0.35 }, 'easeIn'),
      frame(0.48, { bodyRot: 5, shoulderRot: 11, headRot: -15, hipY: 20, leadArm: 22, recoverArm: 1, elbow: 0.08, kickAmp: 23, splash: 1 }, 'easeOut'),
      frame(1, { bodyRot: 7, shoulderRot: 4, headRot: -10, hipY: 14, leadArm: 12, recoverArm: 1.9, elbow: 0.2, kickAmp: 16, splash: 0.7 }, 'easeInOut'),
    ],
  },
  tripleSwitch: {
    duration: 7.2,
    travel: { correct: travel(72, false), incorrect: travel(34, false) },
    correct: [
      frame(0, { bodyRot: -28, shoulderRot: -42, hipY: -5, leadArm: -5, recoverArm: 0, elbow: 0.92, kickAmp: 4, splash: 0 }, 'glide'),
      frame(0.17, { bodyRot: 24, shoulderRot: 40, hipY: -6, leadArm: -4, recoverArm: 0.9, elbow: 1, kickAmp: 5, splash: 1 }, 'switch'),
      frame(0.33, { bodyRot: 28, shoulderRot: 36, hipY: -5, leadArm: -5, recoverArm: 1, elbow: 0.9, kickAmp: 4, splash: 0.05 }, 'glide'),
      frame(0.5, { bodyRot: -24, shoulderRot: -40, hipY: -6, leadArm: -4, recoverArm: 1.9, elbow: 1, kickAmp: 5, splash: 1 }, 'switch'),
      frame(0.67, { bodyRot: -28, shoulderRot: -36, hipY: -5, leadArm: -5, recoverArm: 2, elbow: 0.9, kickAmp: 4, splash: 0.05 }, 'glide'),
      frame(0.84, { bodyRot: 24, shoulderRot: 40, hipY: -6, leadArm: -4, recoverArm: 2.9, elbow: 1, kickAmp: 5, splash: 1 }, 'switch'),
      frame(1, { bodyRot: 28, shoulderRot: 36, hipY: -5, leadArm: -5, recoverArm: 3, elbow: 0.9, kickAmp: 4, splash: 0.05 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -4, headRot: -12, hipY: 12, leadArm: 10, recoverArm: 0, elbow: 0.22, kickAmp: 15 }),
      frame(0.32, { bodyRot: 7, shoulderRot: 13, headRot: -18, hipY: 21, leadArm: 20, recoverArm: 1.45, elbow: 0.08, kickAmp: 25, splash: 0.75 }, 'easeInOut'),
      frame(0.65, { bodyRot: -6, shoulderRot: -12, headRot: -15, hipY: 18, leadArm: 17, recoverArm: 2.35, elbow: 0.12, kickAmp: 23, splash: 0.6 }, 'easeInOut'),
      frame(1, { bodyRot: 5, shoulderRot: 10, headRot: -12, hipY: 14, leadArm: 12, recoverArm: 3, elbow: 0.18, kickAmp: 18, splash: 1 }, 'easeOut'),
    ],
  },
  rhythm: {
    duration: 6,
    travel: { correct: travel(68), incorrect: travel(30) },
    correct: [
      frame(0, { bodyRot: -24, shoulderRot: -35, hipY: -5, leadArm: -5, recoverArm: 0, elbow: 0.92, kickAmp: 4, splash: 0 }, 'glide'),
      frame(0.5, { bodyRot: 25, shoulderRot: 38, hipY: -6, leadArm: -5, recoverArm: 0.52, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.88, { bodyRot: -18, shoulderRot: -31, hipY: -6, leadArm: -5, recoverArm: 0.92, elbow: 0.96, kickAmp: 4, splash: 0.75 }, 'easeOut'),
      frame(1, { bodyRot: -24, shoulderRot: -35, hipY: -5, leadArm: -5, recoverArm: 1, elbow: 0.92, kickAmp: 4, splash: 0.04 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -7, headRot: -10, hipY: 10, leadArm: 9, recoverArm: 0, elbow: 0.22, kickAmp: 14 }),
      frame(0.35, { bodyRot: 9, headRot: -19, hipY: 20, leadArm: 20, recoverArm: 0.75, elbow: 0.1, kickAmp: 24, splash: 0.55 }, 'easeInOut'),
      frame(0.7, { bodyRot: -6, headRot: -15, hipY: 17, leadArm: 17, recoverArm: 1.35, elbow: 0.14, kickAmp: 22, splash: 0.45 }, 'easeInOut'),
      frame(1, { bodyRot: 6, headRot: -10, hipY: 12, leadArm: 11, recoverArm: 2, elbow: 0.2, kickAmp: 16, splash: 1 }, 'easeOut'),
    ],
  },
  continuousFlow: {
    duration: 7.4,
    travel: { correct: travel(96, false), incorrect: travel(44, false) },
    correct: [
      frame(0, { bodyRot: -25, shoulderRot: -37, hipY: -5, leadArm: -5, recoverArm: 0, elbow: 0.94, kickAmp: 4, splash: 0 }, 'glide'),
      frame(0.25, { bodyRot: 24, shoulderRot: 38, headRot: 5, hipY: -6, leadArm: -4, recoverArm: 0.5, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.46, { bodyRot: -18, shoulderRot: -32, headRot: 0, hipY: -6, leadArm: -5, recoverArm: 0.93, elbow: 0.96, kickAmp: 4, splash: 0.8 }, 'easeOut'),
      frame(0.5, { bodyRot: -24, shoulderRot: -35, headRot: 0, hipY: -5, leadArm: -5, recoverArm: 1, elbow: 0.94, kickAmp: 4, splash: 0.04 }, 'glide'),
      frame(0.75, { bodyRot: 25, shoulderRot: 39, headRot: 22, hipY: -6, leadArm: -4, recoverArm: 1.5, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.96, { bodyRot: -18, shoulderRot: -32, headRot: 4, hipY: -6, leadArm: -5, recoverArm: 1.93, elbow: 0.96, kickAmp: 4, splash: 0.8 }, 'easeOut'),
      frame(1, { bodyRot: -25, shoulderRot: -37, headRot: 0, hipY: -5, leadArm: -5, recoverArm: 2, elbow: 0.94, kickAmp: 4, splash: 0.04 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -5, headRot: -12, hipY: 12, leadArm: 11, recoverArm: 0, elbow: 0.2, kickAmp: 16 }),
      frame(0.35, { bodyRot: 7, headRot: -22, hipY: 23, leadArm: 22, recoverArm: 0.9, elbow: 0.08, kickAmp: 27, splash: 1 }, 'easeOut'),
      frame(0.7, { bodyRot: -6, headRot: -18, hipY: 19, leadArm: 18, recoverArm: 1.65, elbow: 0.12, kickAmp: 24, splash: 0.6 }, 'easeInOut'),
      frame(1, { bodyRot: 5, headRot: -12, hipY: 14, leadArm: 13, recoverArm: 2.4, elbow: 0.18, kickAmp: 19, splash: 0.5 }, 'easeInOut'),
    ],
  },
  spl: {
    duration: 8,
    travel: { correct: travel(86, false), incorrect: travel(38, false) },
    correct: [
      frame(0, { bodyRot: -20, shoulderRot: -30, hipY: -6, leadArm: -6, recoverArm: 0, elbow: 0.98, kickAmp: 3, splash: 0 }, 'glide'),
      frame(0.42, { bodyRot: 20, shoulderRot: 31, hipY: -7, leadArm: -7, recoverArm: 0.44, elbow: 1, kickAmp: 3, splash: 0 }, 'switch'),
      frame(0.72, { bodyRot: 25, shoulderRot: 36, hipY: -7, leadArm: -7, recoverArm: 0.72, elbow: 1, kickAmp: 3, splash: 0.04 }, 'glide'),
      frame(0.92, { bodyRot: -13, shoulderRot: -25, hipY: -7, leadArm: -6, recoverArm: 0.93, elbow: 1, kickAmp: 3, splash: 0.65 }, 'easeOut'),
      frame(1, { bodyRot: -20, shoulderRot: -30, hipY: -6, leadArm: -6, recoverArm: 1, elbow: 0.98, kickAmp: 3, splash: 0.03 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -5, headRot: -12, hipY: 13, leadArm: 12, recoverArm: 0, elbow: 0.18, kickAmp: 18 }),
      frame(0.3, { bodyRot: 7, headRot: -20, hipY: 24, leadArm: 24, recoverArm: 0.82, elbow: 0.06, kickAmp: 29, splash: 0.8 }, 'easeOut'),
      frame(0.62, { bodyRot: -7, headRot: -17, hipY: 20, leadArm: 19, recoverArm: 1.55, elbow: 0.1, kickAmp: 26, splash: 0.5 }, 'easeInOut'),
      frame(1, { bodyRot: 5, headRot: -12, hipY: 15, leadArm: 14, recoverArm: 2.3, elbow: 0.16, kickAmp: 20, splash: 0.4 }, 'easeInOut'),
    ],
  },
  effortless25: {
    duration: 7.2,
    travel: { correct: travel(108, false), incorrect: travel(48, false) },
    correct: [
      frame(0, { bodyRot: -24, shoulderRot: -36, hipY: -6, leadArm: -6, recoverArm: 0, elbow: 0.96, kickAmp: 4, splash: 0 }, 'glide'),
      frame(0.25, { bodyRot: 24, shoulderRot: 38, headRot: 3, hipY: -7, leadArm: -5, recoverArm: 0.5, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.46, { bodyRot: -18, shoulderRot: -32, headRot: 0, hipY: -7, leadArm: -6, recoverArm: 0.93, elbow: 0.98, kickAmp: 4, splash: 0.75 }, 'easeOut'),
      frame(0.5, { bodyRot: -24, shoulderRot: -36, headRot: 0, hipY: -6, leadArm: -6, recoverArm: 1, elbow: 0.96, kickAmp: 4, splash: 0.03 }, 'glide'),
      frame(0.75, { bodyRot: 25, shoulderRot: 39, headRot: 25, hipY: -7, leadArm: -5, recoverArm: 1.5, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.96, { bodyRot: -18, shoulderRot: -32, headRot: 3, hipY: -7, leadArm: -6, recoverArm: 1.93, elbow: 0.98, kickAmp: 4, splash: 0.75 }, 'easeOut'),
      frame(1, { bodyRot: -24, shoulderRot: -36, headRot: 0, hipY: -6, leadArm: -6, recoverArm: 2, elbow: 0.96, kickAmp: 4, splash: 0.03 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -6, headRot: -13, hipY: 13, leadArm: 12, recoverArm: 0, elbow: 0.18, kickAmp: 17 }),
      frame(0.33, { bodyRot: 8, headRot: -23, hipY: 24, leadArm: 23, recoverArm: 0.9, elbow: 0.07, kickAmp: 28, splash: 1 }, 'easeOut'),
      frame(0.66, { bodyRot: -7, headRot: -19, hipY: 20, leadArm: 20, recoverArm: 1.75, elbow: 0.1, kickAmp: 25, splash: 0.7 }, 'easeInOut'),
      frame(1, { bodyRot: 6, headRot: -13, hipY: 15, leadArm: 14, recoverArm: 2.5, elbow: 0.15, kickAmp: 20, splash: 0.55 }, 'easeInOut'),
    ],
  },
  comparison: {
    duration: 6.4,
    travel: { correct: travel(76), incorrect: travel(30) },
    correct: [
      frame(0, { bodyRot: -24, shoulderRot: -36, hipY: -6, leadArm: -6, recoverArm: 0, elbow: 0.96, kickAmp: 4, splash: 0 }, 'glide'),
      frame(0.5, { bodyRot: 24, shoulderRot: 38, headRot: 18, hipY: -7, leadArm: -5, recoverArm: 0.52, elbow: 1, kickAmp: 5, splash: 0 }, 'switch'),
      frame(0.9, { bodyRot: -17, shoulderRot: -31, hipY: -7, leadArm: -6, recoverArm: 0.93, elbow: 0.98, kickAmp: 4, splash: 0.75 }, 'easeOut'),
      frame(1, { bodyRot: -24, shoulderRot: -36, hipY: -6, leadArm: -6, recoverArm: 1, elbow: 0.96, kickAmp: 4, splash: 0.03 }, 'glide'),
    ],
    incorrect: [
      frame(0, { bodyRot: -4, shoulderRot: -8, headRot: -14, hipY: 15, leadArm: 14, recoverArm: 0, elbow: 0.16, kickAmp: 19, splash: 0 }, 'easeInOut'),
      frame(0.28, { bodyRot: 7, shoulderRot: 14, headRot: -26, hipY: 27, leadArm: 27, recoverArm: 0.88, elbow: 0.05, kickAmp: 31, splash: 1 }, 'easeOut'),
      frame(0.6, { bodyRot: -8, shoulderRot: -14, headRot: -20, hipY: 22, leadArm: 21, recoverArm: 1.7, elbow: 0.08, kickAmp: 28, splash: 0.75 }, 'easeInOut'),
      frame(1, { bodyRot: 5, shoulderRot: 11, headRot: -14, hipY: 16, leadArm: 15, recoverArm: 2.6, elbow: 0.14, kickAmp: 22, splash: 0.8 }, 'easeInOut'),
    ],
  },
});

export function smoothstep(value) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export function applyEasing(ease, value) {
  const progress = Math.min(1, Math.max(0, value));

  switch (ease) {
    case 'glide':
      return progress ** 3 * (progress * (progress * 6 - 15) + 10);
    case 'switch':
      return progress < 0.5
        ? 4 * progress ** 3
        : 1 - ((-2 * progress + 2) ** 3) / 2;
    case 'easeIn':
      return progress ** 2;
    case 'easeOut':
      return 1 - (1 - progress) ** 3;
    case 'easeInOut':
    default:
      return smoothstep(progress);
  }
}

function interpolateTimeline(keyframes, progress, keys) {
  const clamped = Math.min(1, Math.max(0, progress));
  const nextIndex = keyframes.findIndex(({ t }) => t >= clamped);

  if (nextIndex <= 0) return { ...keyframes[0] };
  if (nextIndex === -1) return { ...keyframes[keyframes.length - 1] };

  const previous = keyframes[nextIndex - 1];
  const next = keyframes[nextIndex];
  const range = next.t - previous.t;
  const amount = applyEasing(
    next.ease,
    range === 0 ? 1 : (clamped - previous.t) / range,
  );

  return keys.reduce(
    (result, key) => ({
      ...result,
      [key]: previous[key] + (next[key] - previous[key]) * amount,
    }),
    { t: clamped },
  );
}

export function getDrillMotion(drill) {
  return DRILL_POSES[drill] ?? DRILL_POSES.superman;
}

export function getPose(drill, isCorrect = true, progress = 0) {
  const motion = getDrillMotion(drill);
  return interpolateTimeline(
    isCorrect ? motion.correct : motion.incorrect,
    progress,
    POSE_KEYS,
  );
}

export function getTravelAtProgress(drill, isCorrect = true, progress = 0) {
  const motion = getDrillMotion(drill);
  const keyframes = isCorrect ? motion.travel.correct : motion.travel.incorrect;
  return interpolateTimeline(keyframes, progress, ['x']).x;
}

// Compatibility helpers for components that used the original motion module.
export function getBodyRotation(drill, isCorrect = true, progress = 0) {
  return getPose(drill, isCorrect, progress).bodyRot;
}

export function getTravel(drill, isCorrect = true) {
  const motion = getDrillMotion(drill);
  return (isCorrect ? motion.travel.correct : motion.travel.incorrect).map(({ x }) => x);
}
