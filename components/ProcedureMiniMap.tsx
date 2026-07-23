'use client'

/**
 * ProcedureMiniMap — sticky mini-navigation for long procedure detail pages.
 *
 * Shows a vertical pill of anchor links targeting sections within the
 * expanded procedure detail. Sections are identified by data-section
 * attributes set on parent elements (or by section IDs).
 *
 * Since sections are rendered inline (not separate pages), we use
 * smooth-scroll to named anchors.
 *
 * The component renders a compact sidebar strip with:
 *   - 📄 الوثائق / Documents
 *   - 📝 الخطوات / Steps
 *   - 💰 الرسوم / Fees
 *   - 🗓️ الموعد النهائي / Deadline
 *   - 📋 ملاحظات / Notes
 *
 * Each link scrolls to a section anchor ID passed via props.
 * If a section ID doesn't exist in DOM, the button is greyed out.
 *
 * Props: { anchorPrefix: string; isAr: boolean }
 * anchorPrefix e.g. `proc-${code}` → sections like `proc-ABC123-docs`
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Section {
  id: string
  icon: string
  labelAr: string
  labelEn: string
}

function buildSections(prefix: string): Section[] {
  return [
    { id: `${prefix}-docs`,     icon: '📄', labelAr: 'الوثائق',      labelEn: 'Docs'     },
    { id: `${prefix}-steps`,    icon: '📝', labelAr: 'الخطوات',      labelEn: 'Steps'    },
    { id: `${prefix}-fees`,     icon: '💰', labelAr: 'الرسوم',       labelEn: 'Fees'     },
    { id: `${prefix}-deadline`, icon: '🗓️', labelAr: 'الموعد',       labelEn: 'Date'     },
    { id: `${prefix}-notes`,    icon: '📋', labelAr: 'ملاحظات',      labelEn: 'Notes'    },
  ]
}

interface Props {
  anchorPrefix: string
  isAr: boolean
}

export default function ProcedureMiniMap({ anchorPrefix, isAr }: Props) {
  const [present, setPresent]   = useState<Set<string>>(new Set())
  const [active, setActive]     = useState<string | null>(null)
  const [mounted, setMounted]   = useState(false)
  const sections = buildSections(anchorPrefix)

  // Check which anchor IDs are present in DOM
  const scan = useCallback(() => {
    const found = new Set<string>()
    for (const s of sections) {
      if (document.getElementById(s.id)) found.add(s.id)
    }
    setPresent(found)
  }, [sections])

  // Track scroll to highlight active section
  const onScroll = useCallback(() => {
    for (const s of [...sections].reverse()) {
      const el = document.getElementById(s.id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) { setActive(s.id); return }
      }
    }
    setActive(null)
  }, [sections])

  useEffect(() => {
    setMounted(true)
    scan()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scan, onScroll])

  if (!mounted || present.size === 0) return null

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        background: '#FAFAF8', border: '1.5px solid #E6E2DC',
        borderRadius: 12, padding: '8px 6px', marginBottom: 10,
        width: 'fit-content',
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, color: '#C8C2BB', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
        {isAr ? 'الأقسام' : 'Sections'}
      </div>
      {sections.map(s => {
        if (!present.has(s.id)) return null
        const isActive = active === s.id
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            title={isAr ? s.labelAr : s.labelEn}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: isActive ? '#F8EDEF' : 'transparent',
              fontFamily: 'inherit', fontSize: 10.5, fontWeight: isActive ? 800 : 600,
              color: isActive ? '#8F1D2C' : '#918B82',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 13 }}>{s.icon}</span>
            <span>{isAr ? s.labelAr : s.labelEn}</span>
            {isActive && (
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#8F1D2C', flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
