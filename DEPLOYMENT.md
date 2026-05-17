# Deployment Guide

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Vercel Deployment

1. Import repository into Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

## Netlify Deployment

1. Import repository into Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

## Recommended Environment

- Node.js 20+
- Modern Chromium-based browser
- Hardware acceleration enabled

## Performance Notes

- Reduced motion mode is supported
- Speech synthesis uses browser-native APIs
- Animation performance scales with playback speed

## Future Production Work

- Real telemetry ingestion
- Stroke tracking
- AI-assisted feedback
- Cloud persistence
- User accounts
- Session history
