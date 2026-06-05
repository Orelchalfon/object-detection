# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`). Install deps with `pnpm install`.

- `pnpm dev` — start the Vite dev server. **Served over HTTPS** (via `vite-plugin-mkcert`), which is required because `getUserMedia`/webcam access only works on secure origins. The first run installs a locally-trusted cert.
- `pnpm build` — production build to `dist/`.
- `pnpm preview` — serve the production build locally.
- `pnpm lint` — run ESLint over all `.js`/`.jsx` files.

There is no test runner configured.

## Architecture

A browser-only React app (Vite) that runs real-time object detection on the webcam feed entirely client-side — no backend. The entire app lives in `src/App.jsx`; `main.jsx` is just the React root.

Detection pipeline (all in `App.jsx`):
1. `requestCameraPermission` calls `getUserMedia`, then triggers `runCoco`.
2. `runCoco` loads the TensorFlow.js COCO-SSD model.
3. `startDetection` runs `detect` on a `setInterval` (every 100ms); `stopDetection` clears it.
4. `detect` reads the current video frame, runs `net.detect(video)`, and `drawDetections` paints bounding boxes + labels onto a `<canvas>` overlaid on the `<Webcam>`.

Key state/refs to be aware of:
- `detectionIntervalRef` is **overloaded**: it holds the loaded COCO-SSD model, and the interval handle is stashed on it as `detectionIntervalRef.current.interval`. It is not purely an interval ref despite the name.
- The `<Webcam>` and `<canvas>` are only mounted while `isDetecting` is true (inside the framer-motion `AnimatePresence` block), so detection must be running for the refs to be valid.

The model classifies the 80 COCO classes. `drawDetections` currently special-cases `"dog"` (green box) vs everything else (red) — purely a display choice.

## Stack notes

- React 18 + Vite 6, plain JSX (no TypeScript).
- TensorFlow.js (`@tensorflow/tfjs` + `@tensorflow-models/coco-ssd`) for inference.
- `react-webcam` for the camera, `framer-motion` for the show/hide transition.
