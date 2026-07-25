'use client'

import React from 'react'

// ── MobileHeader ────────────────────────────────────────────────────────────
// Shared flat v4.0 page header (back button + title + optional right slot +
// language toggle), extracted from the near-identical inline markup that
// /procedures, /faq, /authorities, /forms, /services each hand-rolled during
// the v4.0 flat-design pass (batches #366-373). Named per the design brief's
// section 22 request for reusable components. Purely a markup extraction —
// same visual output, same props each page already had inline.
interface MobileHeaderProps {
  titleAr: string
  titleEn: string
  isAr: boolean
  onBack: () => void
  toggleLang: () => void
  /** Screen-reader label for the back button. Defaults to "Home"/"الرئيسية"
   *  since every current usage navigates to '/', matching the exact text
   *  each page already used before extraction. */
  backLabelAr?: string
  backLabelEn?: string
  /** Optional content rendered between the title and the language toggle
   *  (e.g. /services' "N نتيجة" results-count badge). */
  rightSlot?: React.ReactNode
  /** Set false to hide the language toggle (no current page needs this,
   *  kept for completeness/future use). */
  showLangToggle?: boolean
  /** Inner row max-width. Defaults to the shared var(--container-md) token
   *  (720px) that /procedures, /faq, /authorities, /forms already used.
   *  /services pre-dates that token migration and used a literal 1024px —
   *  passed explicitly there to keep this extraction a pure no-visual-diff
   *  move; not silently "fixed" as part of an unrelated refactor. */
  maxWidth?: string | number
}

export default function MobileHeader({
  titleAr, titleEn, isAr, onBack, toggleLang,
  backLabelAr = 'الرئيسية', backLabelEn = 'Home',
  rightSlot, showLangToggle = true, maxWidth = 'var(--container-md)',
}: MobileHeaderProps) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: 'var(--header-padding)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          aria-label={isAr ? backLabelAr : backLabelEn}
          onClick={onBack}
          onTouchStart={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
          onTouchEnd={e => { e.currentTarget.style.background = 'transparent' }}
          style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text-1)', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.2, flex: 1, minWidth: 0, fontFamily: 'inherit' }}>
          {isAr ? titleAr : (titleEn || titleAr)}
        </h1>
        {rightSlot}
        {showLangToggle && (
          <button
            type="button"
            onClick={toggleLang}
            aria-label={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
            className="tap-hit-2"
            style={{ position: 'relative', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', cursor: 'pointer', height: 38, padding: '0 12px', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}
          >
            {isAr ? 'EN' : 'AR'}
          </button>
        )}
      </div>
    </header>
  )
}
