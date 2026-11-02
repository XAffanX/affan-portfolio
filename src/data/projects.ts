// Project content is taken from each repository's README and source.
// Keep claims here limited to what the repos document.

export type CategoryId = 'fpga' | 'power' | 'pcb' | 'embedded' | 'software';

export interface ProjectImage {
  src: string;
  caption: string;
}

export interface Project {
  slug: string;
  name: string;
  repo: string;
  summary: string;
  description: string[];
  tech: string[];
  challenges: string[];
  status?: string;
  images: ProjectImage[];
}

export interface Category {
  id: CategoryId;
  chip: string;
  title: string;
  blurb: string;
  projects: string[];
}

const GH = 'https://github.com/XAffanX/';

export const PROFILE = {
  name: 'Affan Fahim Khan',
  short: 'Affan Khan',
  role: 'Computer Engineering',
  location: 'Laurel, Maryland',
  intro:
    'Computer engineering student working across FPGA tooling, digital hardware, PCB design and power electronics. ' +
    'I like taking a circuit from the analysis on paper to a simulation, then to something on the bench.',
  education: [
    { school: 'University of Maryland, Baltimore County', detail: 'Computer Engineering · upcoming junior' },
    { school: 'Howard Community College', detail: 'Computer Engineering · A.S.E. expected Dec 2026' },
    { school: 'BRAC University', detail: 'Electronics Engineering · transferred' },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/XAffanX' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/affan-fahim-khan' },
    { label: 'Email', href: 'mailto:affanfahimkhanofficial@gmail.com' },
  ],
};

export const PROJECTS: Record<string, Project> = {
  'fpga-virtual-lab': {
    slug: 'fpga-virtual-lab',
    name: 'FPGA Virtual Lab',
    repo: GH + 'FPGA-Virtual-Lab',
    summary:
      'Virtual Digilent Basys 3 and Nexys 4 DDR boards that run real Vivado bitstreams and can be programmed from Vivado’s Hardware Manager.',
    description: [
      'A desktop app that stands in for a physical Artix-7 board. You build the bitstream in Vivado as usual; the app finds the routed checkpoint saved next to the .bit, has Vivado export it as a netlist of 7-series primitives, and simulates that netlist with Xilinx’s UNISIM models in Icarus Verilog at 100 MHz simulated time.',
      'Switches, buttons, LEDs and seven-segment displays are interactive, and the simulated board devices include a USB-UART terminal, a 640×480 VGA screen, Pmod headers, and on the Nexys 4 DDR an ADT7420 temperature sensor (I2C), ADXL362 accelerometer (SPI) and PDM microphone.',
      'A virtual Xilinx Virtual Cable (XVC) emulates the FPGA’s JTAG port and IDCODE, so Vivado’s Hardware Manager connects to the virtual board and programs it as if it were real.',
    ],
    tech: ['Python', 'PySide6', 'Vivado / Tcl', 'Icarus Verilog', 'UNISIM', 'XVC / JTAG', 'pytest'],
    challenges: [
      'Bitstream configuration frames are undocumented, so instead of decoding the .bit the app simulates the routed checkpoint Vivado writes alongside it.',
      'Optional timing simulation back-annotates every cell and wire delay (slow corner) from Vivado’s SDF, so a design that fails timing misbehaves the way it would on hardware.',
      'When a real USB JTAG board is plugged in, the app avoids starting a second hw_server that could take its cable, and adds the virtual cable to Vivado’s local server instead.',
    ],
    status: '101 tests; test fixtures are real Vivado 2026.1 bitstreams with their routed checkpoints.',
    images: [
      { src: '/projects/fpga/01-basys3-board.png', caption: 'Virtual Basys 3 with a VGA test bitstream selected' },
      { src: '/projects/fpga/02-devices-vga-screen.png', caption: 'Devices page: 640×480 VGA output' },
      { src: '/projects/fpga/03-simulation-controls.png', caption: 'Simulation controls, timing simulation and I/O monitor' },
      { src: '/projects/fpga/04-waveform-viewer.png', caption: 'Waveform viewer with VCD export' },
    ],
  },
  'linear-power-supply': {
    slug: 'linear-power-supply',
    name: 'Multi-Rail Linear Power Supply',
    repo: GH + 'multi-rail-linear-power-supply',
    summary:
      'KiCad bench supply with +12, +5, −12 and −5 V fixed rails plus an LM317 adjustable output, on a routed two-layer PCB.',
    description: [
      'A centre-tapped transformer feeds a KBU6M bridge and 2200 µF bulk capacitors to make ± raw DC rails. LM7812 and LM7912 produce ±12 V, and LM7805 / LM7905 run from those outputs to make ±5 V. An LM317 with a 470 Ω / 10 k network provides the adjustable rail.',
      'The 130 × 88 mm board puts the AC input and bridge on the left, positive regulators along the top edge, negative regulators in the lower half, and output terminals on the right edge. Both copper layers are ground planes; power runs on 1.5 mm tracks.',
    ],
    tech: ['KiCad 10', 'LM78xx / LM79xx', 'LM317', 'Two-layer PCB', 'ERC / DRC'],
    challenges: [
      'Before layout, ERC review caught a floating LM317 adjust resistor and capacitors returned to the wrong rail; these were fixed in the schematic first.',
      'Regulator tabs sit at different potentials (GND, negative input, LM317 output), so each regulator gets its own heatsink space and the board calls out isolation.',
      'Rail ordering at the output terminals forced crossings; these are resolved with a few short bottom-layer tracks so the ground planes stay largely unbroken.',
    ],
    status: 'Layout complete with ERC and DRC clean. Not yet fabricated.',
    images: [
      { src: '/projects/psu/03-pcb-3d.jpg', caption: '3D render of the routed board' },
      { src: '/projects/psu/02-pcb-layout.png', caption: 'Top and bottom copper' },
      { src: '/projects/psu/01-schematic.png', caption: 'Schematic' },
    ],
  },
  'resonance-pfc': {
    slug: 'resonance-pfc',
    name: 'Series Resonance & Power Factor Correction',
    repo: GH + 'resonance-and-power-factor-correction',
    summary:
      'AC analysis from specification to component values: resonance at 1 kHz with maximum power transfer, plus a power factor correction feasibility study.',
    description: [
      'Resonance: the load inductance and resistance were solved analytically so the output current resonates at 1 kHz while the load is matched for maximum average power. The results, L = 62.09 mH and R_L = 275.08 Ω, were confirmed with PSpice parameter sweeps.',
      'An AC sweep from 10 Hz to 10 kHz shows current and power peaking near 1.025 kHz, about 2.5% above target and consistent with rounding the component values. The circuit was built on a breadboard and probed on an oscilloscope.',
      'Power factor correction: correcting a 120 V, 60 Hz industrial load to 0.95 PF was shown to be infeasible, needing 24.7 A against an 18 A limit.',
    ],
    tech: ['PSpice', 'Phasor analysis', 'Thévenin equivalents', 'Parametric sweeps', 'Oscilloscope'],
    challenges: [
      'Resonance and maximum power transfer had to hold at the same time, so the reactive and resistive parts were solved separately: a quadratic in X_L, then matching R_L to |Z_th|.',
      'Each analytic value was checked independently with a PSpice .STEP sweep rather than trusting a single derivation.',
    ],
    images: [
      { src: '/projects/resonance/power-vs-frequency.png', caption: 'Delivered power vs frequency' },
      { src: '/projects/resonance/final-circuit.png', caption: 'Final PSpice circuit' },
      { src: '/projects/resonance/breadboard.jpg', caption: 'Hardware build' },
    ],
  },
  'rc-transient': {
    slug: 'rc-transient',
    name: 'RC Transient Response',
    repo: GH + 'rc-transient-response',
    summary:
      'An RC network that turns a 0–20 V, 20 Hz square wave into a smoothed 0–10 V waveform with τ = 1 ms, verified in PSpice and on hardware.',
    description: [
      'A resistive divider sets the capacitor’s drive to half the input, and the divider’s Thévenin resistance sets the time constant. With C = 1 µF, both constraints are met by R1 = R2 = 2 kΩ.',
      'Tested in two stages, divider alone and then with the capacitor, in PSpice 9.2 and on a breadboard with a function generator and oscilloscope. The measured traces reproduce the simulated exponential charge and discharge.',
    ],
    tech: ['OrCAD PSpice 9.2', 'Transient analysis', 'Function generator', 'Oscilloscope'],
    challenges: [
      'One resistor cannot set both a voltage ratio and a time constant; the design shows analytically why two are needed.',
    ],
    images: [
      { src: '/projects/rc/pspice-plot.png', caption: 'PSpice: capacitor voltage' },
      { src: '/projects/rc/oscilloscope.jpg', caption: 'Measured on the oscilloscope' },
      { src: '/projects/rc/breadboard.jpg', caption: 'Breadboard build' },
    ],
  },
  'arduino-piano': {
    slug: 'arduino-piano',
    name: 'Arduino Digital Piano',
    repo: GH + 'arduino-digital-piano',
    summary:
      'Eight-key C4–C5 piano on an Arduino Uno with two preprogrammed melodies and an animated 16×2 LCD, built in TinkerCad and on hardware.',
    description: [
      'Eight pushbuttons map to the C-major scale from 262 to 523 Hz. A key press drives a passive piezo with tone() and shows the note name, solfège and frequency on an HD44780 LCD in 4-bit mode.',
      'Two more buttons play the ABC song and “Mary Had a Little Lamb” while a three-frame custom character animates on the display. Melody data is kept separate from playback, and the LCD is redrawn only when the note changes to avoid flicker.',
    ],
    tech: ['Arduino Uno', 'C++', 'GPIO', 'HD44780 LCD', 'TinkerCad'],
    challenges: [
      'The C5 key behaved inverted, sounding when released. Its pin mode did not match the external pull-down wiring; setting it to INPUT like the other keys fixed it.',
      'Note keys use external pull-downs while song keys use INPUT_PULLUP; the README documents why both conventions coexist.',
    ],
    images: [
      { src: '/projects/piano/tinkercad.png', caption: 'TinkerCad simulation' },
      { src: '/projects/piano/breadboard.jpg', caption: 'Hardware build' },
    ],
  },
  snaplite: {
    slug: 'snaplite',
    name: 'SnapLite',
    repo: GH + 'SnapLite',
    summary:
      'Lightweight offline Windows screenshot and annotation tool built with Tauri 2, Rust, React and TypeScript.',
    description: [
      'Region, fullscreen, window and delayed capture with a borderless overlay that spans the virtual desktop, a loupe magnifier with RGB readout, and resize handles.',
      'The annotation studio has vector tools, numbered steps, pixel blur and mosaic redaction as selectable, undoable objects, plus crop. Captures copy to the clipboard as PNG or export as PNG, JPEG or WebP. It runs fully offline from the system tray.',
    ],
    tech: ['Tauri 2', 'Rust', 'React', 'TypeScript', 'Tailwind CSS'],
    challenges: [
      'A multi-window pipeline: the overlay renders a frozen desktop snapshot 1:1 across monitors, then hands the selection bounds to Rust, which crops the native pixel buffer.',
      'Global shortcut conflicts at startup are detected and reported to the UI instead of crashing the app.',
    ],
    images: [],
  },
  'signal-processing': {
    slug: 'signal-processing',
    name: 'Signal & Image Processing Labs',
    repo: GH + 'matlab-signal-processing',
    summary:
      'Six MATLAB and Python labs: Haar wavelet approximation and denoising, M-term transform coding, modular-arithmetic image recovery and chirp analysis.',
    description: [
      'A normalised 512 × 512 Haar basis built from scratch in NumPy reconstructs its test signal to 1.8 × 10⁻¹⁵ (machine precision), confirming orthonormality. Keeping half the coefficients reproduces the signal to 0.65% relative RMSE.',
      'Other labs cover M-term transform coding with a retained-energy ratio, exact recovery of a “solarized” image via modular arithmetic, and analysis of a non-linear chirp.',
    ],
    tech: ['MATLAB', 'Python', 'NumPy', 'Matplotlib'],
    challenges: [
      'Recovering the solarized image relies on addition modulo 256 being a bijection, so the operation inverts exactly with no information lost.',
    ],
    images: [
      { src: '/projects/dsp/haar.png', caption: 'Haar approximation vs original' },
      { src: '/projects/dsp/chirp.jpg', caption: 'Chirp analysis' },
    ],
  },
};

export const CATEGORIES: Category[] = [
  {
    id: 'fpga',
    chip: 'FPGA',
    title: 'FPGA & Digital Logic',
    blurb: 'Artix-7 boards, Vivado flows and gate-level simulation.',
    projects: ['fpga-virtual-lab'],
  },
  {
    id: 'power',
    chip: 'POWER',
    title: 'Power Electronics',
    blurb: 'Rectification, linear regulation and AC power analysis.',
    projects: ['linear-power-supply', 'resonance-pfc'],
  },
  {
    id: 'pcb',
    chip: 'PCB',
    title: 'PCB & Circuit Design',
    blurb: 'Schematic capture, layout, and circuits verified on the bench.',
    projects: ['linear-power-supply', 'rc-transient'],
  },
  {
    id: 'embedded',
    chip: 'EMBEDDED',
    title: 'Embedded Systems',
    blurb: 'Microcontroller I/O, timing and display interfaces.',
    projects: ['arduino-piano'],
  },
  {
    id: 'software',
    chip: 'SOFTWARE',
    title: 'Software & Signal Processing',
    blurb: 'Desktop tools, numerical methods and signal processing.',
    projects: ['snaplite', 'signal-processing'],
  },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
