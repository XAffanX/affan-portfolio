'use client';

import { useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { BOARD, CAPACITORS, CHIPS, CONNECTORS, COPPER_DISCS, SMD } from './layout';
import { Chip } from './Chip';
import { Traces } from './Traces';

const COPPER = '#c27f4e';
const IVORY = '#d9c7a6';

function Silkscreen() {
  const tex = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 128;
    const g = c.getContext('2d')!;
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'monospace';
    g.fillStyle = 'rgba(214,222,212,0.42)';
    g.font = `500 44px ${mono}`;
    g.textBaseline = 'middle';
    g.fillText('A.F.KHAN  ·  PORTFOLIO  ·  REV 1.0', 8, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  useEffect(() => () => tex?.dispose(), [tex]);
  if (!tex) return null;
  return (
    <mesh position={[1.75, 0.002, 2.25]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.0, 0.25]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

function MountingHole({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.012, 32]} />
        <meshStandardMaterial color={COPPER} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.014, 32]} />
        <meshStandardMaterial color="#0d1210" roughness={1} />
      </mesh>
    </group>
  );
}

function Connector({ pos, size }: { pos: [number, number]; size: [number, number, number] }) {
  const [w, h, d] = size;
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <RoundedBox args={[w, h, d]} radius={0.07} smoothness={4} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={IVORY} roughness={0.75} />
      </RoundedBox>
      {/* wire entries on the outer face */}
      {[-d / 4, d / 4].map((z, i) => (
        <mesh key={i} position={[w / 2 + 0.001, h * 0.42, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color="#3b3328" roughness={1} />
        </mesh>
      ))}
      {/* screw heads */}
      {[-d / 4, d / 4].map((z, i) => (
        <group key={i} position={[0, h + 0.004, z]}>
          <mesh>
            <cylinderGeometry args={[0.085, 0.085, 0.012, 24]} />
            <meshStandardMaterial color="#b9b2a4" roughness={0.35} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.007, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.13, 0.006, 0.022]} />
            <meshStandardMaterial color="#4a463e" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Capacitor({ pos, r, h }: { pos: [number, number]; r: number; h: number }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 40]} />
        <meshStandardMaterial color="#2b302e" roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.003, 0]}>
        <cylinderGeometry args={[r * 0.92, r * 0.92, 0.006, 40]} />
        <meshStandardMaterial color="#b8b4ab" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* polarity stripe */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r + 0.002, r + 0.002, h * 0.96, 40, 1, true, -0.35, 0.7]} />
        <meshStandardMaterial color="#9fd3bd" roughness={0.6} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Resistor({ pos, rot }: { pos: [number, number]; rot: number }) {
  return (
    <group position={[pos[0], 0, pos[1]]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.035, 0]} castShadow>
        <boxGeometry args={[0.2, 0.06, 0.1]} />
        <meshStandardMaterial color="#202322" roughness={0.6} />
      </mesh>
      {[-0.115, 0.115].map((x) => (
        <mesh key={x} position={[x, 0.033, 0]} castShadow>
          <boxGeometry args={[0.05, 0.066, 0.104]} />
          <meshStandardMaterial color="#cdc6b8" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Rounded-rectangle slab with a soft bevelled edge; top face at y = 0. */
function useBoardGeometry() {
  const geo = useMemo(() => {
    const { w, d, t, radius: r } = BOARD;
    const bevel = 0.05;
    const hw = w / 2 - bevel;
    const hd = d / 2 - bevel;
    const rr = r - bevel;
    const s = new THREE.Shape();
    s.moveTo(-hw + rr, -hd);
    s.lineTo(hw - rr, -hd);
    s.quadraticCurveTo(hw, -hd, hw, -hd + rr);
    s.lineTo(hw, hd - rr);
    s.quadraticCurveTo(hw, hd, hw - rr, hd);
    s.lineTo(-hw + rr, hd);
    s.quadraticCurveTo(-hw, hd, -hw, hd - rr);
    s.lineTo(-hw, -hd + rr);
    s.quadraticCurveTo(-hw, -hd, -hw + rr, -hd);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: t - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 5,
      curveSegments: 24,
    });
    // Extruded along +z; lay it flat so thickness runs along y with the top at y = 0.
    g.rotateX(Math.PI / 2);
    g.translate(0, -bevel, 0);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

export function Board({ reducedMotion }: { reducedMotion: boolean }) {
  const { w, d } = BOARD;
  const boardGeo = useBoardGeometry();
  return (
    <group>
      <mesh geometry={boardGeo} receiveShadow castShadow>
        <meshStandardMaterial color="#1d3029" roughness={0.88} metalness={0.02} />
      </mesh>

      <Traces reducedMotion={reducedMotion} />
      {CHIPS.map((c) => (
        <Chip key={c.id} def={c} />
      ))}
      {CONNECTORS.map((c, i) => (
        <Connector key={i} {...c} />
      ))}
      {CAPACITORS.map((c, i) => (
        <Capacitor key={i} {...c} />
      ))}
      {COPPER_DISCS.map((c, i) => (
        <mesh key={i} position={[c.pos[0], 0.04, c.pos[1]]} castShadow receiveShadow>
          <cylinderGeometry args={[c.r, c.r, 0.08, 40]} />
          <meshStandardMaterial color={COPPER} roughness={0.42} metalness={0.7} />
        </mesh>
      ))}
      {SMD.map((s, i) => (
        <Resistor key={i} {...s} />
      ))}
      {[
        [-w / 2 + 0.42, -d / 2 + 0.42],
        [w / 2 - 0.42, -d / 2 + 0.42],
        [-w / 2 + 0.42, d / 2 - 0.42],
        [w / 2 - 0.42, d / 2 - 0.42],
      ].map(([x, z], i) => (
        <MountingHole key={i} x={x} z={z} />
      ))}
      <Silkscreen />
    </group>
  );
}
