'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CATEGORIES, PROFILE } from '@/data/projects';
import { store, useUI } from '@/lib/store';

export function Intro({ reducedMotion, isDesktop }: { reducedMotion: boolean; isDesktop: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const selected = useUI((s) => s.selected);
  const hovered = useUI((s) => s.hovered);

  // Text reveal on load
  useEffect(() => {
    if (!root.current) return;
    const items = root.current.querySelectorAll('[data-reveal]');
    if (reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.25 },
      );
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);

  // On desktop the intro steps aside while a project panel is open.
  useEffect(() => {
    if (!root.current || !isDesktop) return;
    gsap.to(root.current, {
      opacity: selected ? 0 : 1,
      x: selected ? -40 : 0,
      duration: reducedMotion ? 0 : 0.6,
      ease: 'power2.inOut',
      pointerEvents: selected ? 'none' : 'auto',
    });
  }, [selected, isDesktop, reducedMotion]);

  return (
    <div
      ref={root}
      className="relative z-10 px-6 pb-16 pt-8 sm:px-10 lg:pointer-events-auto lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[min(44vw,560px)] lg:flex-col lg:justify-center lg:px-14 lg:py-12"
    >
      <p data-reveal className="font-mono text-[11px] uppercase tracking-[0.22em] text-copper">
        {PROFILE.role} · {PROFILE.location}
      </p>
      <h1 data-reveal className="mt-4 font-display text-[clamp(3.2rem,7vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.025em] text-paper">
        Affan
        <br />
        <span className="font-medium italic text-copper-light">Khan</span>
      </h1>
      <p data-reveal className="mt-6 max-w-[34rem] text-[15.5px] font-[450] leading-relaxed text-paper/85">
        {PROFILE.intro}
      </p>

      <nav data-reveal aria-label="Project categories" className="mt-9">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">Explore the board</p>
        <ul className="max-w-[30rem] border-t border-line">
          {CATEGORIES.map((c) => {
            const lit = hovered === c.id;
            return (
              <li key={c.id} className="border-b border-line">
                <button
                  type="button"
                  onMouseEnter={() => store.hover(c.id)}
                  onMouseLeave={() => store.hover(null)}
                  onFocus={() => store.hover(c.id)}
                  onBlur={() => store.hover(null)}
                  onClick={() => store.select(c.id)}
                  className="group flex w-full items-center gap-4 py-3 text-left outline-none"
                >
                  <span
                    className={`w-[5.5rem] font-mono text-[11px] tracking-[0.12em] transition-colors ${
                      lit ? 'text-mint' : 'text-copper'
                    }`}
                  >
                    {c.chip}
                  </span>
                  <span className={`flex-1 text-[15px] font-medium transition-colors ${lit ? 'text-paper' : 'text-paper/75'}`}>
                    {c.title}
                  </span>
                  <span
                    aria-hidden
                    className={`h-px transition-all duration-300 ${lit ? 'w-8 bg-mint' : 'w-3 bg-line group-focus-visible:w-8'}`}
                  />
                  <span className="font-mono text-[11px] text-mute">{String(c.projects.length).padStart(2, '0')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
        {PROFILE.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="font-medium text-paper/85 underline decoration-line decoration-1 underline-offset-[6px] transition-colors hover:text-copper-light hover:decoration-copper"
          >
            {l.label}
          </a>
        ))}
      </div>

      <dl data-reveal className="mt-9 grid max-w-[30rem] gap-2 text-[12px] leading-snug">
        {PROFILE.education.map((e) => (
          <div key={e.school} className="flex flex-wrap gap-x-2">
            <dt className="font-medium text-paper/75">{e.school}</dt>
            <dd className="text-mute">{e.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
