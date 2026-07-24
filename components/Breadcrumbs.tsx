'use client'

// Breadcrumbs — small, reusable trail showing "Home > Section > Current page"
// on detail pages. Purely additive (new component, not replacing any existing
// header/back-button navigation) — improves wayfinding on deep pages and
// gives search engines a visible trail that matches the BreadcrumbList
// JSON-LD emitted server-side by the page.tsx wrapper (see lib/breadcrumbJsonLd.ts).

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export interface BreadcrumbItem {
  label_ar: string
  label_en: string
  /** Omit on the last (current-page) item */
  href?: string
}

export default function Breadcrumbs({ items, style }: { items: BreadcrumbItem[]; style?: CSSProperties }) {
  const { isAr } = useLanguage()

  return (
    <nav
      aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 5,
        fontSize: 12,
        color: 'var(--text-3, #918B82)',
        marginBottom: 10,
        ...style,
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1 || !item.href
        const label = isAr ? item.label_ar : item.label_en
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            {i > 0 && (
              <span aria-hidden="true" style={{ color: 'var(--text-4, #C8BEB2)', flexShrink: 0 }}>
                {isAr ? '‹' : '›'}
              </span>
            )}
            {isLast ? (
              <span
                aria-current="page"
                style={{
                  color: 'var(--text-2, #69645C)', fontWeight: 700,
                  maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            ) : (
              <Link
                href={item.href!}
                style={{ color: 'inherit', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand, #8F1D2C)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
