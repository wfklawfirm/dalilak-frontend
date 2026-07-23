'use client'

/**
 * HomepageQuickActionsBar — sticky-feeling row of 4 shortcut buttons
 * to the most-used destinations (procedures, forms, faq, contacts),
 * placed near the top of the homepage for fast navigation.
 *
 * Props: { isAr: boolean }
 */

import React from 'react'
import Link from 'next/link'

interface Props {
  isAr: boolean
}

const ACTIONS = [
  { href: '/procedures', icon: '📋', ar: 'المعاملات', en: 'Procedures' },
  { href: '/forms',      icon: '📄', ar: 'النماذج',   en: 'Forms' },
  { href: '/faq',        icon: '❓', ar: 'الأسئلة',    en: 'FAQ' },
  { href: '/authorities', icon: '🏛️', ar: 'الوزارات',   en: 'Ministries' },
]

export default function HomepageQuickActionsBar({ isAr }: Props) {
  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
    >
      {ACTIONS.map(a => (
        <Link
          key={a.href}
          href={a.href}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 4px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 18 }}>{a.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>
            {isAr ? a.ar : a.en}
          </span>
        </Link>
      ))}
    </div>
  )
}
