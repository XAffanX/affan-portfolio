'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PROJECTS, categoryById, type CategoryId } from '@/data/projects';
import { store, useUI } from '@/lib/store';
import { ProjectDetail } from './ProjectDetail';

export function ProjectPanel({ reducedMotion, isDesktop }: { reducedMotion: boolean; isDesktop: boolean }) {
  const selected = useUI((s) => s.selected);
  const project = useUI((s) => s.project);
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  // Keep the last category on screen while the panel animates out.
  const [shown, setShown] = useState<CategoryId | null>(null);
  const dur = reducedMotion ? 0 : 1;

  useEffect(() => {
    if (selected) setShown(selected);
  }, [selected]);

  // Slide in once the panel has mounted; slide out before unmounting it.
  const isOpen = useRef(false);
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const hidden = isDesktop ? { xPercent: 104, yPercent: 0 } : { xPercent: 0, yPercent: 104 };
    if (selected && !isOpen.current) {
      isOpen.current = true;
      gsap.set(el, { x: 0, y: 0, ...hidden, visibility: 'visible' });
      gsap.to(el, { xPercent: 0, yPercent: 0, duration: 0.75 * dur, ease: 'power3.out', delay: 0.15 * dur });
    } else if (!selected && isOpen.current) {
      isOpen.current = false;
      gsap.to(el, { ...hidden, duration: 0.5 * dur, ease: 'power2.in', onComplete: () => setShown(null) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, shown, isDesktop]);

  // Staggered reveal whenever the content changes (category or list <-> detail)
  useLayoutEffect(() => {
    if (!body.current || !selected) return;
    body.current.scrollTop = 0;
    const items = body.current.querySelectorAll('[data-reveal]');
    gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6 * dur, ease: 'power3.out', stagger: 0.05 * dur, delay: (project ? 0 : 0.35) * dur },
    );
  }, [selected, project, dur]);

  // Esc: detail -> list -> closed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = store.get();
      if (s.project) store.back();
      else if (s.selected) store.close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!shown) return null;
  const cat = categoryById(shown);
  const detail = project ? PROJECTS[project] : null;

  return (
    <aside
      ref={panel}
      aria-label={`${cat.title} projects`}
      className="fixed inset-x-0 bottom-0 z-30 flex h-[62dvh] flex-col rounded-t-2xl border-t border-line bg-[#111614] lg:inset-x-auto lg:right-0 lg:top-0 lg:h-auto lg:w-[min(480px,42vw)] lg:rounded-none lg:border-l lg:border-t-0"
      style={{ visibility: 'hidden' }}
    >
      <header className="flex items-center justify-between border-b border-line px-6 py-4 lg:px-8 lg:py-5">
        {detail ? (
          <button
            type="button"
            onClick={store.back}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute transition-colors hover:text-paper"
          >
            ← {cat.chip} projects
          </button>
        ) : (
          <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
            <span className="text-copper">{cat.chip}</span>
          </span>
        )}
        <button
          type="button"
          onClick={store.close}
          aria-label="Close panel and return to the full board"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-paper/70 transition-colors hover:border-copper hover:text-paper"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div ref={body} className="panel-scroll flex-1 overflow-y-auto px-6 pb-12 pt-7 lg:px-8">
        {detail ? (
          <ProjectDetail key={detail.slug} project={detail} />
        ) : (
          <>
            <h2 data-reveal className="font-display text-[2.3rem] font-semibold leading-[1.05] tracking-[-0.02em] text-paper">
              {cat.title}
            </h2>
            <p data-reveal className="mt-3 text-[14px] text-paper/65">
              {cat.blurb}
            </p>
            <ol className="mt-8 border-t border-line">
              {cat.projects.map((slug, i) => {
                const p = PROJECTS[slug];
                return (
                  <li key={slug} data-reveal className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => store.openProject(slug)}
                      className="group grid w-full grid-cols-[2.2rem_1fr] gap-x-2 py-5 text-left outline-none"
                    >
                      <span className="pt-1 font-mono text-[11px] text-mute">{String(i + 1).padStart(2, '0')}</span>
                      <span>
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="text-[17px] font-semibold text-paper transition-colors group-hover:text-copper-light group-focus-visible:text-copper-light">
                            {p.name}
                          </span>
                          <span
                            aria-hidden
                            className="translate-x-0 font-mono text-[12px] text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-copper"
                          >
                            →
                          </span>
                        </span>
                        <span className="mt-1.5 block text-[13.5px] leading-relaxed text-paper/60">{p.summary}</span>
                        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] tracking-[0.04em] text-mint/80">
                          {p.paper && (
                            <span className="rounded-full border border-copper/60 px-2 py-0.5 text-copper-light">Paper</span>
                          )}
                          <span>{p.tech.slice(0, 4).join('  ·  ')}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </aside>
  );
}
