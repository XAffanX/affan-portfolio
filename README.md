# Affan Khan — 3D PCB Portfolio

An engineering portfolio built around an interactive, animated 3D circuit board. Each chip
on the board is a project category; click one to fly the camera to it and open its projects.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Deep links open a category or project directly:
`/?chip=power` · `/?chip=fpga&project=fpga-virtual-lab`

## Controls

| Input | Action |
|---|---|
| Drag | Rotate the board |
| Right-drag | Pan |
| Scroll / pinch | Zoom |
| Hover a chip | Highlight it and its traces |
| Click a chip | Focus the camera and open its projects |
| Double-click empty space, Esc, or × | Return to the full board |

The board auto-rotates when idle and stops as soon as you interact.

## Structure

```
src/
  data/projects.ts          profile, categories and project write-ups (from the GitHub READMEs)
  components/scene/
    layout.ts               chip positions, trace routes, decorative parts
    traceGeometry.ts        polyline -> rounded-corner tube, with a 0..1 length attribute
    traceMaterial.ts        copper material + travelling-pulse shader (onBeforeCompile)
    Traces.tsx, Chip.tsx, Board.tsx
    CameraRig.tsx           OrbitControls, idle rotation, GSAP camera flights, view offset
    PCBScene.tsx            Canvas, lighting, environment, contact shadow
  components/ui/            intro column, project panel, project detail, 2D fallback
  lib/store.ts              tiny shared UI store (hover / selection)
```

To add a project: add it to `PROJECTS` in `src/data/projects.ts`, put images under
`public/projects/`, and list its slug in a category. To add a chip, add a `ChipDef` and
some traces in `layout.ts`.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no auto-rotation, float or travelling pulses; transitions are instant.
- No WebGL: a flat SVG version of the board with the same chip navigation.
- Every category is also reachable from the text navigation and keyboard.

## Stack

Next.js 14, TypeScript, React Three Fiber, Three.js, Drei, GSAP, Tailwind CSS.
