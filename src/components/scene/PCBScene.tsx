'use client';

import { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { Board } from './Board';
import { CameraRig, CAMERA_FOV } from './CameraRig';
import { store } from '@/lib/store';

function Lights() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <hemisphereLight args={['#e6efe9', '#0a0f0d', 0.55]} />
      <directionalLight
        position={[4.5, 9, 3.5]}
        intensity={1.9}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3, -5]} intensity={0.55} color="#9fd3bd" />
      {/* Soft studio reflections for the copper, built locally (no HDR download). */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} color="#fff1e2" position={[0, 6, 2]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} color="#cfe9dd" position={[-6, 2, 0]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#f2c9a6" position={[6, 2, -2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="circle" intensity={0.6} color="#ffffff" position={[0, 3, -7]} scale={4} />
      </Environment>
    </>
  );
}

export default function PCBScene({ reducedMotion }: { reducedMotion: boolean }) {
  // Double-click on empty space returns to the default view.
  const onDoubleClick = useCallback(() => {
    if (store.get().hovered === null) store.close();
  }, []);

  return (
    <div className="absolute inset-0" onDoubleClick={onDoubleClick}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: CAMERA_FOV, near: 0.1, far: 100, position: [3, 8, 8] }}
        onPointerMissed={() => store.hover(null)}
        aria-label="Interactive 3D circuit board. Drag to rotate, scroll to zoom, click a chip to open its projects."
        role="img"
      >
        <Suspense fallback={null}>
          <Lights />
          <Float
            speed={reducedMotion ? 0 : 1.1}
            rotationIntensity={reducedMotion ? 0 : 0.12}
            floatIntensity={reducedMotion ? 0 : 0.35}
            floatingRange={[-0.06, 0.06]}
          >
            <Board reducedMotion={reducedMotion} />
          </Float>
          <ContactShadows position={[0, -0.75, 0]} opacity={0.5} scale={14} blur={2.8} far={3} resolution={512} color="#000000" />
          <CameraRig reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
