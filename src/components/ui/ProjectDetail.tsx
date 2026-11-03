'use client';

import { useState } from 'react';
import type { Project } from '@/data/projects';

export function ProjectDetail({ project: p }: { project: Project }) {
  const [active, setActive] = useState(0);
  const img = p.images[active];

  return (
    <article>
      <h2 data-reveal className="font-display text-[2.3rem] leading-[1.02] text-paper">
        {p.name}
      </h2>
      <p data-reveal className="mt-3 text-[14.5px] leading-relaxed text-paper/75">
        {p.summary}
      </p>

      {img && (
        <figure data-reveal className="mt-6">
          <div className="overflow-hidden rounded-lg border border-line bg-[#0d1110]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={img.src} src={img.src} alt={img.caption} className="block max-h-[300px] w-full object-contain" loading="lazy" />
          </div>
          <figcaption className="mt-2 flex items-center justify-between gap-3 text-[12px] text-mute">
            <span>{img.caption}</span>
            {p.images.length > 1 && (
              <span className="flex gap-1.5">
                {p.images.map((im, i) => (
                  <button
                    key={im.src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}: ${im.caption}`}
                    aria-pressed={i === active}
                    className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-copper' : 'w-1.5 bg-line hover:bg-mute'}`}
                  />
                ))}
              </span>
            )}
          </figcaption>
        </figure>
      )}

      <section data-reveal className="mt-7 space-y-3 text-[14px] leading-relaxed text-paper/80">
        {p.description.map((d, i) => (
          <p key={i}>{d}</p>
        ))}
      </section>

      <section data-reveal className="mt-8">
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mute">Stack</h3>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-mint/90">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section data-reveal className="mt-8">
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mute">Engineering challenges</h3>
        <ul className="mt-3 space-y-3">
          {p.challenges.map((c, i) => (
            <li key={i} className="grid grid-cols-[1rem_1fr] gap-2 text-[13.5px] leading-relaxed text-paper/75">
              <span aria-hidden className="mt-[0.6em] h-px w-2.5 bg-copper" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {p.status && (
        <p data-reveal className="mt-7 border-l-2 border-copper/60 pl-3 text-[12.5px] leading-relaxed text-paper/60">
          {p.status}
        </p>
      )}

      <div data-reveal className="mt-8 flex flex-wrap gap-2.5">
        {p.paper && (
          <a
            href={p.paper.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-copper-light"
          >
            {p.paper.label}
            <span aria-hidden>↗</span>
          </a>
        )}
        {p.repo && (
          <a
            href={p.repo}
            target="_blank"
            rel="noreferrer"
            className={
              p.paper
                ? 'inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-paper/85 transition-colors hover:border-copper hover:text-paper'
                : 'inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-copper-light'
            }
          >
            View on GitHub
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
