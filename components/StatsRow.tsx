'use client'

import React from 'react'

// ── StatsRow ─────────────────────────────────────────────────────────────
// Shared "N stat cards in a grid" strip (big number + small label),
// extracted from the near-identical markup /procedures, /faq, /authorities,
// /services each hand-rolled just below their header. Named per the design
// brief's section 22 request for reusable components.
//
// The 4 originals had drifted slightly from each other (border-radius 12 vs
// 14, entrance animation present on 3 of 4 but missing on /procedures,
// label color var(--text-2) vs var(--text-3) on /services, label font-size
// 9.5 vs 11 on /procedures) — this component standardizes on the majority
// values (radius 12, animated, var(--text-2), 9.5px) rather than keeping
// every page's own one-off variant. Documented in UX_AUDIT.md, not a silent
// side effect.
interface StatItem {
  value: string
  label: string
}

interface StatsRowProps {
  stats: StatItem[]
  /** Grid column count. Defaults to stats.length (e.g. 3 items -> 3 cols;
   *  /authorities passes 2 explicitly for its 4-item 2x2 layout). */
  columns?: number
  style?: React.CSSProperties
}

export default function StatsRow({ stats, columns, style }: StatsRowProps) {
  const cols = columns ?? stats.length
  return (
    <>
      <style>{`@keyframes statsRowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, marginBottom: 16, ...style }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{
            padding: '14px 8px 16px', textAlign: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'statsRowIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
            animationDelay: `${0.06 + i * 0.07}s`,
          }}>
            <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-2)', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
