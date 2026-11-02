'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { Intro } from '@/components/ui/Intro';
import { ProjectPanel } from '@/components/ui/ProjectPanel';
import { FallbackBoard } from '@/components/ui/FallbackBoard';
import { useIsDesktop, useReducedMotion, useWebGL } from '@/lib/env';
import { store, useUI } from '@/lib/store';
import { CATEGORIES, PROJECTS, type CategoryId } from '@/data/projects';

const PCBScene = dynamic(() => import('@/components/scene/PCBScene'), {
  ssr: false,
  loading: () => <BoardLoading />,
});

function BoardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center lg:pl-[44vw]">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Powering up the board…</span>
    </div>
  );
}

function Hint({ isDesktop }: { isDesktop: boolean }) {
  const selected = useUI((s) => s.selected);
  return (
    <p
      className={`pointer-events-none absolute bottom-5 right-6 z-10 hidden font-mono text-[10.5px] tracking-[0.08em] text-mute transition-opacity duration-500 lg:block ${
        selected ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {isDesktop
        ? 'Drag to rotate · Right-drag to pan · Scroll to zoom · Click a chip · Double-click to reset'
        : 'Drag to rotate · Pinch to zoom · Tap a chip'}
    </p>
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion();
  const webgl = useWebGL();
  const isDesktop = useIsDesktop();

  // Deep links: ?chip=power&project=linear-power-supply
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // Headless screenshots render slowly; stop GSAP from stretching time to compensate.
    if (q.has('capture')) gsap.ticker.lagSmoothing(0);
    const chip = q.get('chip') as CategoryId | null;
    const project = q.get('project');
    if (!chip || !CATEGORIES.some((c) => c.id === chip)) return;
    const t = setTimeout(() => {
      store.select(chip);
      if (project && PROJECTS[project]) store.openProject(project);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
      {/* Board: full-screen behind the text on desktop, a block above it on phones */}
      <section aria-label="Interactive circuit board" className="relative h-[64dvh] lg:absolute lg:inset-0 lg:h-auto">
        {webgl === null ? <BoardLoading /> : webgl ? <PCBScene reducedMotion={reducedMotion} /> : <FallbackBoard />}
        {webgl && (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-[10px] tracking-[0.08em] text-mute lg:hidden">
            Drag to rotate · Pinch to zoom · Tap a chip
          </p>
        )}
      </section>

      <div className="lg:pointer-events-none lg:absolute lg:inset-0">
        <Intro reducedMotion={reducedMotion} isDesktop={isDesktop} />
      </div>

      {webgl && <Hint isDesktop={isDesktop} />}
      <ProjectPanel reducedMotion={reducedMotion} isDesktop={isDesktop} />
    </main>
  );
}
