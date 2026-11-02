'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHIPS, TRACES, type TraceDef } from './layout';
import { roundedPath, traceGeometry } from './traceGeometry';
import { createTraceMaterial } from './traceMaterial';
import { store } from '@/lib/store';

const TRACE_Y = 0.012;

function onChip(x: number, z: number) {
  return CHIPS.some(({ pos, size }) =>
    Math.abs(x - pos[0]) <= size[0] / 2 + 0.03 && Math.abs(z - pos[1]) <= size[2] / 2 + 0.03,
  );
}

function Trace({ def, reducedMotion }: { def: TraceDef; reducedMotion: boolean }) {
  const { geo, mat, uniforms } = useMemo(() => {
    const path = roundedPath(def.pts, TRACE_Y);
    const { geo, length } = traceGeometry(path);
    const { mat, uniforms } = createTraceMaterial(def.speed / length, def.offset);
    return { geo, mat, uniforms };
  }, [def]);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  const lastTick = useRef(store.get().pulseTick);

  useFrame((state, dt) => {
    const s = store.get();
    const focus = s.hovered ?? s.selected;
    const active = focus !== null && def.links.includes(focus) ? 1 : 0;
    uniforms.uActive.value = THREE.MathUtils.damp(uniforms.uActive.value, active, 6, dt);
    if (s.pulseTick !== lastTick.current) {
      lastTick.current = s.pulseTick;
      if (s.selected && def.links.includes(s.selected)) uniforms.uBurst.value = 1;
    }
    uniforms.uBurst.value = THREE.MathUtils.damp(uniforms.uBurst.value, 0, 2.5, dt);
    // Reduced motion: pulses hold still and only the highlight changes.
    if (!reducedMotion) uniforms.uTime.value = state.clock.elapsedTime;
  });

  const ends = [def.pts[0], def.pts[def.pts.length - 1]].filter(([x, z]) => !onChip(x, z));

  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {ends.map(([x, z], i) => (
        <Via key={i} x={x} z={z} />
      ))}
    </group>
  );
}

const viaRing = new THREE.CylinderGeometry(0.075, 0.075, 0.024, 24);
const viaHole = new THREE.CylinderGeometry(0.03, 0.03, 0.026, 16);

function Via({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, TRACE_Y, z]}>
      <mesh geometry={viaRing} castShadow receiveShadow>
        <meshStandardMaterial color="#c88754" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh geometry={viaHole} position={[0, 0.002, 0]}>
        <meshStandardMaterial color="#0f1513" roughness={1} />
      </mesh>
    </group>
  );
}

export function Traces({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      {TRACES.map((t, i) => (
        <Trace key={i} def={t} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}
