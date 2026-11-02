import type { CategoryId } from '@/data/projects';

// Board coordinates: x to the right, z toward the viewer, y up. The board top is y = 0.
export const BOARD = { w: 7, d: 5, t: 0.28, radius: 0.32 };

export type ChipKind = 'bga' | 'fins' | 'qfp' | 'soic' | 'qfn';

export interface ChipDef {
  id: CategoryId;
  label: string;
  sub: string;
  kind: ChipKind;
  pos: [number, number];          // x, z of the centre
  size: [number, number, number]; // width (x), height (y), depth (z)
}

export const CHIPS: ChipDef[] = [
  { id: 'fpga', label: 'FPGA', sub: 'XC7A · DIGITAL', kind: 'bga', pos: [-1.1, -0.5], size: [1.5, 0.3, 1.5] },
  { id: 'power', label: 'POWER', sub: 'LINEAR REG', kind: 'fins', pos: [1.85, -1.15], size: [1.3, 0.72, 0.9] },
  { id: 'embedded', label: 'EMBEDDED', sub: 'MCU · GPIO', kind: 'qfp', pos: [1.35, 1.05], size: [1.0, 0.22, 1.0] },
  { id: 'pcb', label: 'PCB', sub: 'KICAD · SPICE', kind: 'soic', pos: [-0.35, 1.4], size: [1.1, 0.2, 0.62] },
  { id: 'software', label: 'SOFTWARE', sub: 'CS · ML · DSP', kind: 'qfn', pos: [-2.55, 1.25], size: [0.85, 0.26, 0.85] },
];

export interface TraceDef {
  pts: [number, number][];   // polyline in x, z; corners are rounded when built
  links: CategoryId[];        // chips this trace belongs to (lights up on hover)
  speed: number;              // pulse speed in board units per second
  offset: number;             // phase so pulses don't line up
}

export const TRACES: TraceDef[] = [
  // FPGA <-> POWER
  { pts: [[-0.35, -0.85], [0.55, -0.85], [0.85, -1.15], [1.2, -1.15]], links: ['fpga', 'power'], speed: 0.9, offset: 0.1 },
  { pts: [[-0.35, -1.1], [0.35, -1.1], [0.7, -1.45], [1.2, -1.45]], links: ['fpga', 'power'], speed: 0.6, offset: 0.55 },
  // FPGA <-> EMBEDDED
  { pts: [[-0.35, -0.3], [0.35, -0.3], [0.85, 0.2], [1.1, 0.2], [1.1, 0.55]], links: ['fpga', 'embedded'], speed: 1.1, offset: 0.3 },
  { pts: [[-0.35, -0.05], [0.2, -0.05], [0.6, 0.35], [0.6, 0.85], [0.85, 0.85]], links: ['fpga', 'embedded'], speed: 0.75, offset: 0.8 },
  // FPGA <-> PCB
  { pts: [[-0.7, 0.25], [-0.7, 0.6], [-0.45, 0.85], [-0.45, 1.09]], links: ['fpga', 'pcb'], speed: 0.8, offset: 0.2 },
  // FPGA <-> SOFTWARE
  { pts: [[-1.55, 0.25], [-1.55, 0.7], [-1.85, 1.0], [-2.125, 1.0]], links: ['fpga', 'software'], speed: 0.95, offset: 0.65 },
  // SOFTWARE <-> PCB
  { pts: [[-2.125, 1.5], [-0.9, 1.5]], links: ['software', 'pcb'], speed: 0.7, offset: 0.4 },
  // PCB <-> EMBEDDED
  { pts: [[0.2, 1.3], [0.85, 1.3]], links: ['pcb', 'embedded'], speed: 0.85, offset: 0.15 },
  // EMBEDDED <-> POWER
  { pts: [[1.6, 0.55], [1.6, 0.05], [1.85, -0.2], [1.85, -0.7]], links: ['embedded', 'power'], speed: 0.8, offset: 0.7 },
  // POWER / EMBEDDED -> edge connectors
  { pts: [[2.25, -0.7], [2.25, -0.3], [2.5, -0.05], [2.75, -0.05]], links: ['power'], speed: 0.6, offset: 0.25 },
  { pts: [[1.85, 0.7], [2.35, 0.7], [2.55, 0.5], [2.75, 0.5]], links: ['embedded'], speed: 0.9, offset: 0.9 },
  { pts: [[1.85, 1.1], [2.75, 1.1]], links: ['embedded'], speed: 0.7, offset: 0.5 },
  // FPGA fan-out to vias
  { pts: [[-1.85, -0.9], [-2.4, -0.9], [-2.75, -1.25], [-2.75, -1.6]], links: ['fpga'], speed: 0.7, offset: 0.05 },
  { pts: [[-1.85, -0.4], [-2.85, -0.4]], links: ['fpga'], speed: 0.5, offset: 0.6 },
  { pts: [[-1.85, -0.15], [-2.3, -0.15], [-2.6, 0.15]], links: ['fpga'], speed: 0.65, offset: 0.35 },
  { pts: [[-1.4, -1.25], [-1.4, -1.65], [-1.7, -1.95]], links: ['fpga'], speed: 0.6, offset: 0.75 },
  { pts: [[-0.8, -1.25], [-0.8, -1.6], [-0.5, -1.9], [0.3, -1.9]], links: ['fpga'], speed: 0.85, offset: 0.45 },
  // short stubs
  { pts: [[1.6, -1.6], [1.6, -1.95], [1.35, -2.15]], links: ['power'], speed: 0.5, offset: 0.2 },
  { pts: [[1.2, 1.55], [1.2, 1.8], [0.95, 2.0]], links: ['embedded'], speed: 0.6, offset: 0.85 },
  { pts: [[-0.1, 1.71], [-0.1, 2.05]], links: ['pcb'], speed: 0.5, offset: 0.1 },
  { pts: [[-0.6, 1.71], [-0.6, 1.95], [-0.85, 2.15], [-1.4, 2.15]], links: ['pcb'], speed: 0.6, offset: 0.6 },
  { pts: [[-2.55, 1.675], [-2.55, 2.05]], links: ['software'], speed: 0.5, offset: 0.3 },
];

// Off-white blocks on the right edge, like screw terminals.
export const CONNECTORS: { pos: [number, number]; size: [number, number, number] }[] = [
  { pos: [3.0, 0.2], size: [0.5, 0.42, 0.62] },
  { pos: [3.0, 1.05], size: [0.5, 0.42, 0.62] },
];

export const CAPACITORS: { pos: [number, number]; r: number; h: number }[] = [
  { pos: [2.95, -1.25], r: 0.2, h: 0.42 },
  { pos: [2.95, -0.68], r: 0.14, h: 0.3 },
];

export const COPPER_DISCS: { pos: [number, number]; r: number }[] = [
  { pos: [-2.45, -1.95], r: 0.24 },
];

export const SMD: { pos: [number, number]; rot: number }[] = [
  { pos: [0.05, 0.55], rot: 0 },
  { pos: [0.05, 0.75], rot: 0 },
  { pos: [-1.05, 0.75], rot: Math.PI / 2 },
  { pos: [2.35, -2.0], rot: 0 },
  { pos: [-0.15, -1.55], rot: Math.PI / 4 },
];
