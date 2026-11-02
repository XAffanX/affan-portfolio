'use client';

import { BOARD, CHIPS, TRACES } from '@/components/scene/layout';
import { store, useUI } from '@/lib/store';

/** Flat, clickable version of the board for browsers without WebGL. */
export function FallbackBoard() {
  const hovered = useUI((s) => s.hovered);
  const selected = useUI((s) => s.selected);
  const focus = hovered ?? selected;
  const { w, d } = BOARD;
  const pad = 0.2;

  return (
    <div className="flex h-full w-full items-center justify-center p-8 lg:pl-[44vw]">
      <svg
        viewBox={`${-w / 2 - pad} ${-d / 2 - pad} ${w + pad * 2} ${d + pad * 2}`}
        className="w-full max-w-[720px]"
        role="group"
        aria-label="Circuit board map of project categories"
      >
        <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={0.32} fill="#1d3029" />
        {TRACES.map((t, i) => {
          const lit = focus !== null && t.links.includes(focus);
          return (
            <polyline
              key={i}
              points={t.pts.map(([x, z]) => `${x},${z}`).join(' ')}
              fill="none"
              stroke={lit ? '#e2b48c' : '#a96e44'}
              strokeWidth={lit ? 0.075 : 0.06}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {CHIPS.map((c) => {
          const lit = focus === c.id;
          return (
            <g
              key={c.id}
              role="button"
              tabIndex={0}
              aria-label={`${c.label} projects`}
              onMouseEnter={() => store.hover(c.id)}
              onMouseLeave={() => store.hover(null)}
              onClick={() => store.select(c.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && store.select(c.id)}
              className="cursor-pointer outline-none"
            >
              <rect
                x={c.pos[0] - c.size[0] / 2}
                y={c.pos[1] - c.size[2] / 2}
                width={c.size[0]}
                height={c.size[2]}
                rx={0.06}
                fill={lit ? '#323837' : '#26292a'}
                stroke={lit ? '#9fd3bd' : '#3a403e'}
                strokeWidth={0.02}
              />
              <text
                x={c.pos[0]}
                y={c.pos[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ece8df"
                style={{ font: `600 ${c.label.length > 6 ? 0.12 : 0.16}px var(--font-mono), monospace` }}
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
