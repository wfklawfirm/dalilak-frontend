'use client'

/**
 * ProcedurePriorityTag — user-set urgency label for a procedure.
 *
 * Three levels: urgent (🔴) / soon (🟡) / later (🟢) / none.
 * LS key: dalilak_priority_{code} → 'urgent' | 'soon' | 'later' | ''
 * Dispatches dalilak_saved_change on change.
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

type Priority = 'urgent' | 'soon' | 'later' | ''

const lsKey = (code: string) => `dalilak_priority_${code}`

const LEVELS: Array<{ value: Priority; ar: string; en: string; dot: string; bg: string; border: string; color: string }> = [
  { value: 'urgent', ar: 'عاجل',  en: 'Urgent', dot: '🔴', bg: '#FEF2F2', border: '#FECACA', color: '#991B1B' },
  { value: 'soon',   ar: 'قريباً', en: 'Soon',   dot: '🟡', bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
  { value: 'later',  ar: 'لاحقاً', en: 'Later',  dot: '🟢', bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46' },
]

interface Props { code: string; isAr: boolean }

export function loadPriority(code: string): Priority {
  try { return (localStorage.getItem(lsKey(code)) as Priority) || '' } catch { return '' }
}

export default function ProcedurePriorityTag({ code, isAr }: Props) {
  const [mounted,  setMounted]  = useState(false)
  const [priority, setPriority] = useState<Priority>('')
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    setMounted(true)
    setPriority(loadPriority(code))
  }, [code])

  function set(p: Priority) {
    try {
      if (p) localStorage.setItem(lsKey(code), p)
      else    localStorage.removeItem(lsKey(code))
    } catch {}
    setPriority(p)
    setOpen(false)
    window.dispatchEvent(new CustomEvent('dalilak_saved_change'))
  }

  if (!mounted) return null

  const current = LEVELS.find(l => l.value === priority)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 16,
          background: current ? current.bg : '#F5F3EE',
          border: `1.5px solid ${current ? current.border : '#E5E0D8'}`,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 700,
          color: current ? current.color : '#78716C',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 11 }}>{current ? current.dot : '⚪'}</span>
        {current
          ? (isAr ? current.ar : current.en)
          : (isAr ? 'الأولوية' : 'Priority')}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)',
          [isAr ? 'right' : 'left']: 0,
          background: '#fff', border: '1.5px solid #E5E0D8',
          borderRadius: 10, padding: 6, zIndex: 50,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          display: 'flex', flexDirection: 'column', gap: 3, minWidth: 130,
        }}>
          {LEVELS.map(l => (
            <button key={l.value} type="button"
              onClick={() => set(l.value === priority ? '' : l.value)}
              dir={isAr ? 'rtl' : 'ltr'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 9px', borderRadius: 8,
                background: priority === l.value ? l.bg : 'transparent',
                border: priority === l.value ? `1px solid ${l.border}` : '1px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 10, fontWeight: 700, color: l.color,
                textAlign: isAr ? 'right' : 'left',
              }}
            >
              <span>{l.dot}</span>
              {isAr ? l.ar : l.en}
              {priority === l.value && <span style={{ marginInlineStart: 'auto', fontSize: 10 }}>✓</span>}
            </button>
          ))}
          {priority && (
            <button type="button" onClick={() => set('')}
              style={{
                padding: '4px 9px', borderRadius: 8, marginTop: 2,
                background: '#F5F3EE', border: '1px solid #E5E0D8',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 9.5, fontWeight: 700, color: '#78716C',
              }}>
              {isAr ? 'إزالة الأولوية' : 'Remove priority'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
