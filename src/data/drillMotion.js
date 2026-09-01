// Per-drill motion parameters for the swimmer scene.
//
// arms   'extend' (streamlined), 'skate' (one arm lead) or 'stroke' (full cycle)
// kick   flutter amplitude
// roll   body roll amplitude, in radians
// tempo  stroke cycles per second at 1x playback; 0 holds a static pose
// flow   travel speed, driving caustics, motes and light shafts
// breath 0 none, 0-1 breathe every third stroke, 1 continuous head-roll breathing
// glide  how much of the cycle is spent held in the glide
// press  chest-press bob (Chest Press drill)
// split  stack an efficient and a rushed swimmer (Efficient vs Rushed)
export const DP = {
  superman: { arms: 'extend', kick: 0.00, roll: 0.00, tempo: 0.00, flow: 0.16, breath: 0, glide: 0 },
  flutter: { arms: 'extend', kick: 0.60, roll: 0.04, tempo: 0.00, flow: 0.20, breath: 0, glide: 0 },
  chestPress: { arms: 'extend', kick: 0.22, roll: 0.03, tempo: 0.00, flow: 0.14, breath: 0, glide: 0, press: 1 },
  skating: { arms: 'skate', kick: 0.38, roll: 0.80, tempo: 0.00, flow: 0.22, breath: 0, glide: 0 },
  breathing: { arms: 'skate', kick: 0.38, roll: 0.80, tempo: 0.00, flow: 0.22, breath: 1, glide: 0 },
  singleSwitch: { arms: 'stroke', kick: 0.40, roll: 0.72, tempo: 0.24, flow: 0.28, breath: 0, glide: 0.55 },
  tripleSwitch: { arms: 'stroke', kick: 0.50, roll: 0.72, tempo: 0.36, flow: 0.34, breath: 0, glide: 0.25 },
  rhythm: { arms: 'stroke', kick: 0.50, roll: 0.64, tempo: 0.30, flow: 0.38, breath: 0.34, glide: 0.15 },
  continuousFlow: { arms: 'stroke', kick: 0.55, roll: 0.62, tempo: 0.38, flow: 0.46, breath: 0.34, glide: 0.08 },
  spl: { arms: 'stroke', kick: 0.50, roll: 0.62, tempo: 0.34, flow: 0.50, breath: 0.34, glide: 0.10 },
  effortless25: { arms: 'stroke', kick: 0.55, roll: 0.62, tempo: 0.40, flow: 0.58, breath: 0.34, glide: 0.08 },
  comparison: { arms: 'stroke', kick: 0.55, roll: 0.62, tempo: 0.40, flow: 0.42, breath: 0.34, glide: 0.08, split: 1 },
};

// Stroke cycles per second at 1x playback; 0 for the balance drills that hold a
// pose. Poolside mode reads this to beat its tempo dot in time with the scene.
export function strokeTempo(drill) {
  return (DP[drill] || DP.superman).tempo;
}
