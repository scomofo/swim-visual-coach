const quiet = {
  kickAmp: 0.06,
  kickHz: 1.6,
  kickKnee: 0.18,
  kickSplay: 0.03,
  roll: 0.52,
  pitch: -0.1,
  hipDrop: 0.02,
  headPitch: -0.14,
  breathAmount: 0.42,
  splash: 0.18,
  wobble: 0,
  armSet: "ti"
};
const rushed = {
  kickAmp: 0.28,
  kickHz: 3.4,
  kickKnee: 0.85,
  kickSplay: 0.16,
  roll: 0.12,
  pitch: 0.16,
  hipDrop: 0.26,
  headPitch: 0.42,
  breathAmount: 0.7,
  splash: 0.95,
  wobble: 0.09,
  armSet: "windmill"
};
function make(style, extra, base = quiet) {
  return { style, ...base, ...extra };
}
const PROFILES = {
  superman: {
    correct: make("glide", {
      cycle: 7,
      speed: 0.48,
      bothForward: true,
      spl: 0,
      breathEvery: 0,
      kickAmp: 0.03,
      kickHz: 0.5,
      roll: 0.04,
      splash: 0.05
    }),
    error: make(
      "glide",
      {
        cycle: 4.2,
        speed: 0.22,
        bothForward: true,
        spl: 0,
        breathEvery: 0,
        kickAmp: 0.3,
        kickHz: 2.8
      },
      rushed
    )
  },
  flutter: {
    correct: make("kickGlide", {
      cycle: 5.5,
      speed: 0.62,
      bothForward: true,
      spl: 0,
      breathEvery: 0,
      kickAmp: 0.08,
      kickHz: 2.15,
      roll: 0.05,
      splash: 0.1
    }),
    error: make(
      "kickGlide",
      {
        cycle: 3.6,
        speed: 0.28,
        bothForward: true,
        spl: 0,
        breathEvery: 0
      },
      rushed
    )
  },
  chestPress: {
    correct: make("glide", {
      cycle: 6.5,
      speed: 0.55,
      bothForward: true,
      spl: 0,
      breathEvery: 0,
      kickAmp: 0.05,
      kickHz: 1.2,
      pitch: -0.2,
      hipDrop: -0.05,
      roll: 0.04,
      splash: 0.08
    }),
    error: make(
      "glide",
      {
        cycle: 4,
        speed: 0.24,
        bothForward: true,
        spl: 0,
        breathEvery: 0,
        pitch: 0.22,
        hipDrop: 0.32
      },
      rushed
    )
  },
  skating: {
    correct: make("skate", {
      cycle: 8,
      speed: 0.7,
      bothForward: false,
      spl: 8,
      breathEvery: 0,
      kickAmp: 0.07,
      roll: 0.62
    }),
    error: make(
      "skate",
      {
        cycle: 4.5,
        speed: 0.38,
        bothForward: false,
        spl: 16,
        breathEvery: 0,
        roll: 0.18
      },
      rushed
    )
  },
  breathing: {
    correct: make("breatheSkate", {
      cycle: 7.5,
      speed: 0.66,
      bothForward: false,
      spl: 10,
      breathEvery: 1,
      kickAmp: 0.07,
      roll: 0.58,
      breathAmount: 0.48
    }),
    error: make(
      "breatheSkate",
      {
        cycle: 4.2,
        speed: 0.32,
        bothForward: false,
        spl: 18,
        breathEvery: 1,
        headPitch: 0.55,
        hipDrop: 0.3
      },
      rushed
    )
  },
  singleSwitch: {
    correct: make("single", {
      cycle: 7.2,
      speed: 0.78,
      bothForward: false,
      spl: 12,
      breathEvery: 0,
      roll: 0.55
    }),
    error: make(
      "single",
      {
        cycle: 3.8,
        speed: 0.42,
        bothForward: false,
        spl: 20,
        breathEvery: 0
      },
      rushed
    )
  },
  tripleSwitch: {
    correct: make("triple", {
      cycle: 8.4,
      speed: 0.92,
      bothForward: false,
      spl: 14,
      breathEvery: 0,
      roll: 0.54
    }),
    error: make(
      "triple",
      {
        cycle: 4.4,
        speed: 0.5,
        bothForward: false,
        spl: 24,
        breathEvery: 0
      },
      rushed
    )
  },
  rhythm: {
    correct: make("full", {
      cycle: 3.6,
      speed: 1.05,
      bothForward: false,
      spl: 16,
      breathEvery: 3,
      roll: 0.5,
      kickAmp: 0.07
    }),
    error: make(
      "full",
      {
        cycle: 1.55,
        speed: 0.72,
        bothForward: false,
        spl: 26,
        breathEvery: 2
      },
      rushed
    )
  },
  continuousFlow: {
    correct: make("full", {
      cycle: 3.2,
      speed: 1.12,
      bothForward: false,
      spl: 16,
      breathEvery: 3,
      roll: 0.52,
      kickAmp: 0.075
    }),
    error: make(
      "full",
      {
        cycle: 1.4,
        speed: 0.78,
        bothForward: false,
        spl: 28,
        breathEvery: 2
      },
      rushed
    )
  },
  spl: {
    correct: make("longGlide", {
      cycle: 5.8,
      speed: 1.02,
      bothForward: false,
      spl: 14,
      breathEvery: 2,
      roll: 0.5
    }),
    error: make(
      "full",
      {
        cycle: 1.35,
        speed: 0.7,
        bothForward: false,
        spl: 30,
        breathEvery: 2
      },
      rushed
    )
  },
  effortless25: {
    correct: make("full", {
      cycle: 3.05,
      speed: 1.18,
      bothForward: false,
      spl: 15,
      breathEvery: 3,
      roll: 0.5,
      splash: 0.12
    }),
    error: make(
      "full",
      {
        cycle: 1.28,
        speed: 0.82,
        bothForward: false,
        spl: 27,
        breathEvery: 2
      },
      rushed
    )
  },
  comparison: {
    correct: make("full", {
      cycle: 3.3,
      speed: 1.1,
      bothForward: false,
      spl: 16,
      breathEvery: 3,
      roll: 0.5
    }),
    error: make(
      "full",
      {
        cycle: 1.45,
        speed: 0.74,
        bothForward: false,
        spl: 26,
        breathEvery: 2
      },
      rushed
    )
  }
};
function getProfile(drill, mode) {
  const entry = PROFILES[drill];
  if (!entry) throw new Error(`Unknown drill: ${drill}`);
  const profile = entry[mode];
  if (!profile) throw new Error(`Unknown mode "${mode}" for drill "${drill}"`);
  return profile;
}
export {
  PROFILES,
  getProfile
};
