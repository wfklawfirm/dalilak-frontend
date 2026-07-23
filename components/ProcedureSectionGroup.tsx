'use client'

/**
 * ProcedureSectionGroup — a labeled, collapsible container used to organize
 * the many small widgets on an expanded procedure card into clear sections
 * (documents, steps, tracking, share & print, etc.) instead of one long
 * unlabeled stack. No functionality is removed — every widget passed as
 * children still renders and works exactly as before; this only adds a
 * section header + consistent spacing, and lets secondary/power-user
 * sections start collapsed to reduce visual clutter.
 *
 * Props: { icon, titleAr, titleEn, isAr, defaultOpen?, children }
 */

import React, { useState } from 'react'

interface Props {
  icon: string
  titleAr: string
  titleEn: string
  isAr: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function ProcedureSectionGroup({ icon, titleAr, titleEn, isAr, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 14, border: '1px solid #E6E2DC', borderRadius: 11, overflow: 'hidden', background: '#FDFDFC' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 12px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 11.5, fontWeight: 800, color: '#5C4A3A' }}>
          {isAr ? titleAr : titleEn}
        </span>
        <span style={{
          color: '#918B82', transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s', display: 'inline-flex', flexShrink: 0,
        }}>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '2px 12px 12px', borderTop: '1px solid #EFEBE5',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
