'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { store, useUI } from '@/lib/store';
import { chipAnchors } from './Chip';

const FOV = 30;
const IDLE_RESUME_MS = 7000;

/** Camera distance that fits the board for the current aspect ratio. */
function defaultView(width: number, height: number) {
  const aspect = width / height;
  const tan2 = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  // Board spans ~8 units across once tilted; give it ~58% of a desktop screen, ~92% of a phone.
  const share = width >= 1024 ? 0.58 : 0.92;
  const dist = Math.max(11.5, 8 / (share * tan2 * aspect), 4.6 / (0.72 * tan2));
  const dir = new THREE.Vector3(0.3, 0.68, 0.67).normalize();
  return dir.multiplyScalar(dist);
}

export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const selected = useUI((s) => s.selected);
  const resetTick = useUI((s) => s.resetTick);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const tween = useRef<gsap.core.Timeline | null>(null);
  const shift = useRef({ x: 0, y: 0 });
  const first = useRef(true);

  const isDesktop = size.width >= 1024;

  const setAutoRotate = (on: boolean) => {
    if (controls.current) controls.current.autoRotate = on && !reducedMotion;
  };

  const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, duration: number) => {
    const c = controls.current;
    if (!c) return;
    tween.current?.kill();
    const d = reducedMotion ? 0 : duration;
    tween.current = gsap
      .timeline({ onUpdate: () => c.update() })
      .to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: d, ease: 'power3.inOut' }, 0)
      .to(c.target, { x: target.x, y: target.y, z: target.z, duration: d, ease: 'power3.inOut' }, 0);
  };

  // Initial placement, and keep the default framing in sync with the window when idle.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      camera.position.copy(defaultView(size.width, size.height));
      controls.current?.target.set(0, 0, 0);
      controls.current?.update();
      setAutoRotate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // Fly to a chip when one is selected.
  useEffect(() => {
    if (!selected) return;
    const anchor = chipAnchors.get(selected);
    const c = controls.current;
    if (!anchor || !c) return;
    setAutoRotate(false);
    clearTimeout(idleTimer.current);
    const p = new THREE.Vector3();
    anchor.getWorldPosition(p);
    const az = Math.atan2(camera.position.x - c.target.x, camera.position.z - c.target.z);
    const r = isDesktop ? 6.4 : 8.6;
    const pos = new THREE.Vector3(p.x + Math.sin(az) * r, p.y + (isDesktop ? 7.4 : 9.6), p.z + Math.cos(az) * r);
    flyTo(pos, p, 1.4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Return to the default view (panel closed, or double-click on empty space).
  useEffect(() => {
    if (resetTick === 0) return;
    flyTo(defaultView(size.width, size.height), new THREE.Vector3(0, 0, 0), 1.3);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setAutoRotate(true), 1400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTick]);

  // Any user interaction stops auto-rotation at once; it resumes after a quiet spell.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const onStart = () => {
      tween.current?.kill();
      setAutoRotate(false);
      clearTimeout(idleTimer.current);
    };
    const onEnd = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (!store.get().selected) setAutoRotate(true);
      }, IDLE_RESUME_MS);
    };
    c.addEventListener('start', onStart);
    c.addEventListener('end', onEnd);
    return () => {
      c.removeEventListener('start', onStart);
      c.removeEventListener('end', onEnd);
      clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Slide the board across the screen with a projection offset: right of the intro text
  // when idle, left of the project panel when it is open. On phones it moves vertically.
  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const open = store.get().selected !== null;
    const tx = isDesktop ? (open ? -0.2 : 0.16) : 0;
    const ty = isDesktop ? 0 : open ? 0.16 : 0;
    const k = reducedMotion ? 60 : 3.2;
    shift.current.x = THREE.MathUtils.damp(shift.current.x, tx, k, dt);
    shift.current.y = THREE.MathUtils.damp(shift.current.y, ty, k, dt);
    const w = size.width;
    const h = size.height;
    cam.setViewOffset(w, h, -shift.current.x * w, shift.current.y * h, w, h);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      panSpeed={0.7}
      screenSpacePanning
      minDistance={3.2}
      maxDistance={20}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI - 0.05}
      autoRotateSpeed={0.55}
    />
  );
}

export const CAMERA_FOV = FOV;
