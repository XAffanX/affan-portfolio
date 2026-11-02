'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { ChipDef } from './layout';
import { store, useUI } from '@/lib/store';
import { categoryById } from '@/data/projects';

/** World-space anchors the camera rig flies to. */
export const chipAnchors = new Map<string, THREE.Object3D>();

const BODY = '#26292a';
const BODY_TOP = '#2f3333';
const LEAD = '#b7ad9d';

function useLabelTexture(label: string, sub: string, aspect: number) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const draw = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;
      const W = 512;
      const H = Math.round(W / aspect);
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const g = c.getContext('2d')!;
      const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'monospace';
      g.clearRect(0, 0, W, H);
      // pin-1 dot
      g.fillStyle = 'rgba(236,232,223,0.55)';
      g.beginPath();
      g.arc(W * 0.1, H * 0.16, W * 0.022, 0, Math.PI * 2);
      g.fill();
      // main label
      const big = Math.min(H * 0.3, (W * 0.8) / (label.length * 0.62));
      g.fillStyle = '#ece8df';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `600 ${big}px ${mono}`;
      g.fillText(label, W / 2, H * 0.48);
      g.fillStyle = 'rgba(236,232,223,0.45)';
      g.font = `500 ${Math.max(14, big * 0.3)}px ${mono}`;
      g.fillText(sub, W / 2, H * 0.48 + big * 0.62);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    draw();
    return () => { cancelled = true; };
  }, [label, sub, aspect]);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

function Leads({ kind, w, d }: { kind: ChipDef['kind']; w: number; d: number }) {
  const leads = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number] }[] = [];
    const along = (len: number, n: number) => Array.from({ length: n }, (_, i) => -len / 2 + (len * (i + 0.5)) / n);
    if (kind === 'qfp') {
      const n = 7;
      along(w * 0.8, n).forEach((x) => {
        out.push({ p: [x, 0.03, d / 2 + 0.06], s: [0.05, 0.03, 0.14] });
        out.push({ p: [x, 0.03, -d / 2 - 0.06], s: [0.05, 0.03, 0.14] });
      });
      along(d * 0.8, n).forEach((z) => {
        out.push({ p: [w / 2 + 0.06, 0.03, z], s: [0.14, 0.03, 0.05] });
        out.push({ p: [-w / 2 - 0.06, 0.03, z], s: [0.14, 0.03, 0.05] });
      });
    } else if (kind === 'soic') {
      along(w * 0.82, 6).forEach((x) => {
        out.push({ p: [x, 0.03, d / 2 + 0.07], s: [0.07, 0.035, 0.16] });
        out.push({ p: [x, 0.03, -d / 2 - 0.07], s: [0.07, 0.035, 0.16] });
      });
    } else if (kind === 'qfn') {
      along(w * 0.7, 4).forEach((x) => {
        out.push({ p: [x, 0.008, d / 2 + 0.03], s: [0.08, 0.016, 0.07] });
        out.push({ p: [x, 0.008, -d / 2 - 0.03], s: [0.08, 0.016, 0.07] });
      });
    }
    return out;
  }, [kind, w, d]);
  if (!leads.length) return null;
  return (
    <group>
      {leads.map((l, i) => (
        <mesh key={i} position={l.p} castShadow>
          <boxGeometry args={l.s} />
          <meshStandardMaterial color={LEAD} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Chip({ def }: { def: ChipDef }) {
  const [w, h, d] = def.size;
  const group = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const hovered = useUI((s) => s.hovered === def.id);
  const selected = useUI((s) => s.selected === def.id);
  const anySelected = useUI((s) => s.selected !== null);

  const isFins = def.kind === 'fins';
  // Footprint of the flat label: fins put it on the base in front of the plates.
  const labelW = isFins ? w * 0.9 : def.kind === 'bga' ? w * 0.78 : w * 0.86;
  const labelD = isFins ? d * 0.34 : def.kind === 'bga' ? d * 0.78 : d * 0.82;
  const tex = useLabelTexture(def.label, def.sub, labelW / labelD);
  const outline = useMemo(() => {
    const plane = new THREE.PlaneGeometry(w + 0.22, d + 0.22).rotateX(-Math.PI / 2);
    const edges = new THREE.EdgesGeometry(plane);
    plane.dispose();
    return edges;
  }, [w, d]);
  useEffect(() => () => outline.dispose(), [outline]);

  useEffect(() => {
    if (group.current) chipAnchors.set(def.id, group.current);
    return () => { chipAnchors.delete(def.id); };
  }, [def.id]);

  useFrame((_, dt) => {
    if (!lift.current) return;
    const target = selected ? 0.12 : hovered ? 0.08 : 0;
    lift.current.position.y = THREE.MathUtils.damp(lift.current.position.y, target, 8, dt);
    const sc = hovered && !selected ? 1.035 : 1;
    const cur = lift.current.scale.x;
    lift.current.scale.setScalar(THREE.MathUtils.damp(cur, sc, 8, dt));
    if (bodyMat.current) {
      const e = selected ? 0.03 : hovered ? 0.02 : 0;
      bodyMat.current.emissiveIntensity = THREE.MathUtils.damp(bodyMat.current.emissiveIntensity, e, 6, dt);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    store.hover(def.id);
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    if (store.get().hovered === def.id) store.hover(null);
    document.body.style.cursor = '';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // that was a drag, not a click
    store.select(def.id);
  };

  // Body geometry per package type
  const baseH = isFins ? 0.18 : def.kind === 'bga' ? 0.07 : h;
  const finCount = 3;

  return (
    <group ref={group} position={[def.pos[0], 0, def.pos[1]]}>
      <group ref={lift}>
        {/* silkscreen outline under the part */}
        <lineSegments position={[0, 0.003, 0]} geometry={outline}>
          <lineBasicMaterial color="#cfd6cc" transparent opacity={0.28} />
        </lineSegments>

        {def.kind === 'bga' && (
          <>
            <RoundedBox args={[w, baseH, d]} radius={0.03} smoothness={3} position={[0, baseH / 2, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#3a3b2e" roughness={0.7} />
            </RoundedBox>
            <RoundedBox args={[w * 0.84, h - baseH, d * 0.84]} radius={0.06} smoothness={4} position={[0, baseH + (h - baseH) / 2, 0]} castShadow receiveShadow>
              <meshStandardMaterial ref={bodyMat} color={BODY} roughness={0.55} emissive="#9fd3bd" emissiveIntensity={0} />
            </RoundedBox>
          </>
        )}

        {(def.kind === 'qfp' || def.kind === 'soic' || def.kind === 'qfn') && (
          <RoundedBox args={[w, h, d]} radius={0.05} smoothness={4} position={[0, h / 2, 0]} castShadow receiveShadow>
            <meshStandardMaterial ref={bodyMat} color={BODY} roughness={0.55} emissive="#9fd3bd" emissiveIntensity={0} />
          </RoundedBox>
        )}

        {isFins && (
          <>
            <RoundedBox args={[w, baseH, d]} radius={0.05} smoothness={4} position={[0, baseH / 2, 0]} castShadow receiveShadow>
              <meshStandardMaterial ref={bodyMat} color={BODY} roughness={0.55} emissive="#9fd3bd" emissiveIntensity={0} />
            </RoundedBox>
            {Array.from({ length: finCount }, (_, i) => {
              const fx = -w / 2 + (w * (i + 0.5)) / finCount;
              return (
                <RoundedBox
                  key={i}
                  args={[0.2, h - baseH, d * 0.6]}
                  radius={0.05}
                  smoothness={4}
                  position={[fx, baseH + (h - baseH) / 2, -d * 0.18]}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial color={BODY_TOP} roughness={0.45} metalness={0.15} />
                </RoundedBox>
              );
            })}
          </>
        )}

        <Leads kind={def.kind} w={w} d={d} />

        {tex && (
          <mesh
            position={[0, (def.kind === 'bga' ? h : isFins ? baseH : h) + 0.002, isFins ? d * 0.3 : 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[labelW, labelD]} />
            <meshBasicMaterial map={tex} transparent toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* Invisible hit box so hover is stable across the whole part */}
      <mesh position={[0, h / 2 + 0.05, 0]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <boxGeometry args={[w + 0.25, h + 0.2, d + 0.25]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {hovered && !anySelected && (
        <Html position={[0, h + 0.45, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="chip-tag">
            <span className="chip-tag-code">{def.label}</span>
            <span>{categoryById(def.id).title}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
