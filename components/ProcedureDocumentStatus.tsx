'use client'

/**
 * ProcedureDocumentStatus — per-document expiry date tracker.
 *
 * Shows alongside ProcedureDocumentChecklist. Each doc gets an optional
 * "expires" date field. Dates within 30 days show amber warning, expired
 * show red, far-future show green.
 *
 * LS keys: dalilak_doc_expiry_{code}_{index} → YYYY-MM-DD string
 * Dispatches dalilak_saved_change on update.
 *
 * Props: { code: string; docs: string[]; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  docs: string[]
  isAr: boolean
}

const lsKey = (code: string, i: number) => `dalilak_doc_expiry_${code}_${i}`

function loadExpiries(code: string, count: number): string[] {
  try {
    return Array.from({ length: count }, (_, i) =>
      localStorage.getItem(lsKey(code, i)) || ''
    )
  } catch { return Array(count).fill('') }
}

function saveExpiry(code: string, i: number, val: string) {
  try {
    if (val) localStorage.setItem(lsKey(code, i), val)
    else      localStorage.removeItem(lsKey(code, i))
  } catch {}
}

function getStatus(dateStr: string): { color: string; bg: string; label: string; labelEn: string } | null {
  if (!dateStr) return null
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (days < 0)   return { color: '#991B1B', bg: '#FEF2F2', label: 'منتهية', labelEn: 'Expired' }
  if (days <= 30) return { color: '#92400E', bg: '#FFFBEB', label: `${days} يوم`, labelEn: `${days}d left` }
  return { color: '#065F46', bg: '#ECFDF5', label: 'صالحة', labelEn: 'Valid' }
}

export default function ProcedureDocumentStatus({ code, docs, isAr }: Props) {
  const [mounted,   setMounted]   = useState(false)
  const [expiries,  setExpiries]  = useState<string[]>([])
  const [editIdx,   setEditIdx]   = useState<number | null>(null)
  const [expanded,  setExpanded]  = useState(false)

  useEffect(() => {
    setMounted(true)
    setExpiries(loadExpiries(code, docs.length))
  }, [code, docs.length])

  if (!mounted || docs.length === 0) return null

  function update(i: number, val: string) {
    const next = [...expiries]
    next[i] = val
    setExpiries(next)
    saveExpiry(code, i, val)
    window.dispatchEvent(new CustomEvent('dalilak_saved_change'))
  }

  // Count how many have expiry dates set
  const setCount = expiries.filter(Boolean).length
  const urgentCount = expiries.filter(e => {
    if (!e) return false
    const s = getStatus(e)
    return s && (s.label === 'منتهية' || s.labelEn === 'Expired' || parseInt(s.labelEn) <= 30)
  }).length

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', padding: '3px 0',
        }}
      >
        <span style={{ fontSize: 14 }}>📅</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: urgentCount > 0 ? '#92400E' : '#78716C' }}>
          {isAr ? 'تواريخ انتهاء صلاحية الوثائق' : 'Document expiry dates'}
          {setCount > 0 && (
            <span style={{
              marginInlineStart: 5, padding: '1px 7px', borderRadius: 10,
              background: urgentCount > 0 ? '#FEF3C7' : '#ECFDF5',
              color: urgentCount > 0 ? '#92400E' : '#065F46',
              fontSize: 9,
            }}>
              {setCount}/{docs.length}
            </span>
          )}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {docs.map((doc, i) => {
            const status = getStatus(expiries[i])
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 9,
                background: status ? status.bg : '#F9F7F5',
                border: `1.5px solid ${status ? (status.color + '33') : '#EDE9E3'}`,
                flexWrap: 'wrap',
              }}>
                {/* Doc name */}
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#44403C',
                  flex: 1, minWidth: 120, lineHeight: 1.4,
                }}>
                  {doc.length > 45 ? doc.slice(0, 45) + '…' : doc}
                </span>

                {/* Status chip */}
                {status && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '2px 7px',
                    borderRadius: 10, background: status.bg,
                    color: status.color, border: `1px solid ${status.color}44`,
                    flexShrink: 0,
                  }}>
                    {isAr ? status.label : status.labelEn}
                  </span>
                )}

                {/* Date input / edit button */}
                {editIdx === i ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="date"
                      value={expiries[i] || ''}
                      onChange={e => update(i, e.target.value)}
                      style={{
                        fontSize: 10, padding: '3px 6px', borderRadius: 7,
                        border: '1.5px solid #D1CBC4', fontFamily: 'inherit',
                        outline: 'none', background: '#fff',
                      }}
                    />
                    <button type="button" onClick={() => setEditIdx(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#78716C' }}>
                      ✓
                    </button>
                    {expiries[i] && (
                      <button type="button" onClick={() => { update(i, ''); setEditIdx(null) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#EF4444' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditIdx(i)}
                    style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                      background: '#F5F3EE', border: '1.5px solid #E5E0D8',
                      color: '#78716C', cursor: 'pointer', fontFamily: 'inherit',
                      flexShrink: 0,
                    }}
                  >
                    {expiries[i]
                      ? expiries[i]
                      : (isAr ? '+ تاريخ الانتهاء' : '+ Set expiry')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
