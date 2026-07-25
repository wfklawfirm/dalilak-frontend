'use client'
import React from 'react'

interface PageBackHeaderProps {
  isAr: boolean
  onBack: () => void
  title: string
  /** Optional emoji/icon rendered before the title text. */
  icon?: string
  subtitle?: string
  titleWeight?: number
  /** 'tokens' uses the v4.0 CSS design tokens; 'legacy' uses this pattern's original hardcoded hex (for pages not yet migrated). */
  variant?: 'tokens' | 'legacy'
  maxWidth?: number
  style?: React.CSSProperties
}

export default function PageBackHeader({
  isAr,
  onBack,
  title,
  icon,
  subtitle,
  titleWeight = 700,
  variant = 'tokens',
  maxWidth = 560,
  style,
}: PageBackHeaderProps) {
  const c =
    variant === 'legacy'
      ? { bg: '#fff', border: '#E6E2DC', text1: '#191713', text3: '#918B82' }
      : { bg: 'var(--surface)', border: 'var(--border)', text1: 'var(--text-1)', text3: 'var(--text-3)' }

  return (
    <div style={{ background: c.bg, borderBottom: `1px solid ${c.border}`, ...style }}>
      <div style={{ maxWidth, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label={isAr ? 'رجوع' : 'Back'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            border: `1.5px solid ${c.border}`,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.text1} strokeWidth="2.3">
            <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
          </svg>
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: titleWeight, color: c.text1, fontFamily: 'inherit' }}>
            {icon ? `${icon} ` : ''}{title}
          </h1>
          {subtitle && <div style={{ fontSize: 11, color: c.text3 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  )
}
