# Swim Visual Coach

Interactive visual coaching system for Total Immersion freestyle instruction.

## Stack

- React
- Vite
- TailwindCSS
- Framer Motion
- React Three Fiber
- Vitest + React Testing Library

## Development checks

```bash
npm ci
npm run lint
npm test
npm run build
```

Pull requests run the full check suite on Node.js 20 and 22.

## Features

- 3D lane with a skeletal freestyle swimmer
- Correct vs common-error motion profiles
- Ghost overlay and side-by-side comparison
- Hydrodynamic drag readout (form, wave, skin)
- Interactive lesson progression
- Breathing and rhythm coaching
- Playback, camera, and guide controls
- Adaptive coaching scaffolding
- Export-ready lesson cards

## Curriculum Progression

1. Superman Glide
2. Lazy Flutter
3. Chest Press → Hip Rise
4. Skating Position
5. Head Roll Breathing
6. Single Switch
7. Triple Switch
8. Rhythm Swim
9. Continuous Flow
10. Stroke Count Efficiency
11. Effortless 25
12. Efficient vs Rushed

## Hydrodynamic drag

The lane scores three sources of drag on every frame:

- **Form** — the hole the body punches (head lift, hanging hips, wide recovery)
- **Wave** — splash, bounce, and bow wave
- **Skin** — extra friction from thrashy kicking

Quiet water is the tell. Switch **Correct** and **Common Error**, then use **Head-on** to see the frontal plate.

## Future Systems

- AI voice-guided coaching
- Swim telemetry integration
- Camera-based stroke analysis
- SPL auto-counting
- Mobile poolside mode
- Exportable social clips

## Vision

Build a calm, visually elegant coaching system that teaches swimming through motion clarity, balance, rhythm, and reduced cognitive overload.
