# Swim Visual Coach

Interactive visual coaching system for Total Immersion freestyle instruction.

## Stack

- React
- Vite
- TailwindCSS
- Framer Motion
- React Three Fiber
- Vitest + React Testing Library
- Playwright browser acceptance checks

## Development checks

```bash
npm ci
npm run lint
npm test
npm run build
```

Pull requests run the full check suite on Node.js 20 and 22.

To check the production app in Chromium, including the GitHub Pages sub-path:

```bash
npx playwright install --with-deps chromium
DEPLOY_TARGET=gh-pages npm run build
DEPLOY_TARGET=gh-pages npm run test:browser
```

The browser script starts and closes its own preview server. Set `SWIM_QA_DIR`
to choose where screenshots and `verdict.json` are written. An existing Chromium
installation can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
Pull requests also run this browser suite on Node.js 22.

See [the coaching workspace acceptance record](docs/coaching-workspace-acceptance.md)
for the checked flows and a preview of the design.

## Features

- 3D lane with a skeletal freestyle swimmer
- Correct vs common-error motion profiles
- Ghost overlay and side-by-side comparison
- Hydrodynamic drag readout (form, wave, skin)
- A visible, phase-grouped learning path through all 14 lessons
- A focused 3D practice stage with separate coaching guidance and full lesson notes
- Explicit mastery tracking and automatic return to the last lesson
- Breathing and rhythm coaching
- Playback, restart, camera, and guide controls, with selectable focal points
- Keyboard shortcuts, accessible onboarding, and reduced-motion support
- Spoken drill narration with a selectable voice (turn on **Narrate**, then pick a voice; the choice is remembered)
- Self-hosted fonts and responsive desktop, laptop, and narrow layouts

## Curriculum Progression

1. Superman Glide
2. Lazy Flutter
3. Chest Press → Hip Rise
4. Skating Position
5. Head Roll Breathing
6. Sweet Spot
7. Single Switch
8. Triple Switch
9. Two-Beat Kick
10. Rhythm Swim
11. Continuous Flow
12. Stroke Count Efficiency
13. Effortless 25
14. Efficient vs Rushed

## Hydrodynamic drag

The lane scores three sources of drag on every frame:

- **Form** — the hole the body punches (head lift, hanging hips, wide recovery)
- **Wave** — splash, bounce, and bow wave
- **Skin** — extra friction from thrashy kicking

Quiet water is the tell. Switch **Efficient** and **Common error**, then use **Head-on** to see the frontal plate.
These values describe the demonstration's motion profile; they are illustrative,
not measurements of the person using the app.

## Future Systems

- AI voice-guided coaching
- Swim telemetry integration
- Camera-based stroke analysis
- SPL auto-counting
- Mobile poolside mode
- Exportable social clips

## Vision

Build a calm, visually elegant coaching system that teaches swimming through motion clarity, balance, rhythm, and reduced cognitive overload.
