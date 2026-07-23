'use client'

/**
 * ProcedureComparator — compare two procedures side by side.
 * Shows docs, fees, processing time, steps count, authority.
 * Collapsible panel on homepage empty state.
 */

import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES, type EnrichedProcedure } from '@/lib/enrichedProcedures'

interface ProcPickerProps {
  value: EnrichedProcedure | null
  onSelect: (p: EnrichedProcedure) => void
  placeholder: string
  isAr: boolean
  side: 'A' | 'B'
}

function ProcPicker({ value, onSelect, placeholder, isAr, side }: ProcPickerProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    if (!search.trim()) return ENRICHED_PROCEDURES.slice(0, 6)
    const q = search.toLowerCase()
    return ENRICHED_PROCEDURES.filter(p =>
      p.title.includes(search) ||
      (p.title_en || '').toLowerCase().includes(q)
    ).slice(0, 6)
  }, [search])

  const color = side === 'A' ? '#1a56db' : '#8F1D2C'

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color, letterSpacing: '0.06em',
        textTransform: 'uppercase', marginBottom: 5,
      }}>
        {side === 'A'
          ? (isAr ? 'المعاملة الأولى' : 'Procedure A')
          : (isAr ? 'المعاملة الثانية' : 'Procedure B')}
      </div>

      {value && !open ? (
        <div
          onClick={() => { setOpen(true); setSearch('') }}
          style={{
            padding: '8px 10px', borderRadius: 9, cursor: 'pointer',
            border: `1.5px solid ${color}`, background: `${color}08`,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>
            {isAr ? value.title : (value.title_en || value.title)}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>
            {isAr ? value.ministry : (value.ministry_en || value.ministry)}
          </div>
        </div>
      ) : (
        <input
          type="text"
          dir={isAr ? 'rtl' : 'ltr'}
          placeholder={placeholder}
          value={search}
          autoFocus={open}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          style={{
            width: '100%', padding: '8px 10px',
            border: `1.5px solid ${color}`, borderRadius: 9,
            fontSize: 12, color: 'var(--text-1)', background: 'var(--bg)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      )}

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)',
            [isAr ? 'right' : 'left']: 0,
            width: '100%', minWidth: 200,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 50, maxHeight: 180, overflowY: 'auto',
          }}>
            {results.map(proc => (
              <button
                key={proc.code}
                type="button"
                onClick={() => { onSelect(proc); setOpen(false); setSearch('') }}
                style={{
                  display: 'block', width: '100%', textAlign: isAr ? 'right' : 'left',
                  padding: '8px 10px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 11.5, color: 'var(--text-1)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{ fontWeight: 600 }}>
                  {isAr ? proc.title : (proc.title_en || proc.title)}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-4)', marginTop: 1 }}>
                  {isAr ? proc.ministry : (proc.ministry_en || proc.ministry)}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface Props {
  onAsk?: (q: string) => void
}

export default function ProcedureComparator({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [procA, setProcA] = useState<EnrichedProcedure | null>(null)
  const [procB, setProcB] = useState<EnrichedProcedure | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const rows: { labelAr: string; labelEn: string; icon: string; getVal: (p: EnrichedProcedure) => string | number }[] = [
    { icon: '📄', labelAr: 'عدد الوثائق', labelEn: 'Documents', getVal: p => p.requiredDocuments.length },
    { icon: '💵', labelAr: 'الرسوم', labelEn: 'Fees', getVal: p => (isAr ? p.fees : (p.fees_en || p.fees)) },
    { icon: '⏱', labelAr: 'مدة المعالجة', labelEn: 'Processing Time', getVal: p => (isAr ? p.processingTime : (p.processingTime_en || p.processingTime)) },
    { icon: '🗂', labelAr: 'عدد الخطوات', labelEn: 'Steps', getVal: p => p.steps.length },
    { icon: '🏛️', labelAr: 'الجهة المختصة', labelEn: 'Authority', getVal: p => (isAr ? p.ministry : (p.ministry_en || p.ministry)) },
    { icon: '📍', labelAr: 'مكان التقديم', labelEn: 'Where to Apply', getVal: p => (isAr ? p.whereToApply : (p.whereToApply_en || p.whereToApply)) },
  ]

  const bothSelected = procA && procB

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {isAr ? 'مقارنة المعاملات' : 'Compare Procedures'}
          </span>
        </div>
        <span style={{
          fontSize: 10, color: 'var(--text-4)',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s', display: 'inline-block',
        }}>▾</span>
      </div>

      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>

          {/* Pickers */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <ProcPicker
              value={procA}
              onSelect={setProcA}
              placeholder={isAr ? 'ابحث عن المعاملة الأولى...' : 'Search procedure A...'}
              isAr={isAr}
              side="A"
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-4)', fontSize: 16, fontWeight: 700, padding: '0 2px',
            }}>
              VS
            </div>
            <ProcPicker
              value={procB}
              onSelect={setProcB}
              placeholder={isAr ? 'ابحث عن المعاملة الثانية...' : 'Search procedure B...'}
              isAr={isAr}
              side="B"
            />
          </div>

          {/* Comparison table */}
          {bothSelected && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '7px 10px', textAlign: isAr ? 'right' : 'left',
                      color: 'var(--text-4)', fontWeight: 700, fontSize: 10.5,
                      borderBottom: '1px solid var(--border)', width: '30%',
                    }}>
                      {isAr ? 'العنصر' : 'Item'}
                    </th>
                    <th style={{
                      padding: '7px 10px', textAlign: 'center',
                      color: '#1a56db', fontWeight: 700, fontSize: 10.5,
                      borderBottom: '1px solid var(--border)', width: '35%',
                    }}>
                      {isAr ? procA.title : (procA.title_en || procA.title)}
                    </th>
                    <th style={{
                      padding: '7px 10px', textAlign: 'center',
                      color: '#8F1D2C', fontWeight: 700, fontSize: 10.5,
                      borderBottom: '1px solid var(--border)', width: '35%',
                    }}>
                      {isAr ? procB.title : (procB.title_en || procB.title)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const valA = String(row.getVal(procA))
                    const valB = String(row.getVal(procB))
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)' }}>
                        <td style={{
                          padding: '8px 10px', color: 'var(--text-3)',
                          fontWeight: 600, fontSize: 11, borderBottom: '1px solid var(--border)',
                        }}>
                          {row.icon} {isAr ? row.labelAr : row.labelEn}
                        </td>
                        <td style={{
                          padding: '8px 10px', textAlign: 'center',
                          color: 'var(--text-1)', fontWeight: 500,
                          borderBottom: '1px solid var(--border)',
                          fontSize: 11.5,
                        }}>
                          {valA}
                        </td>
                        <td style={{
                          padding: '8px 10px', textAlign: 'center',
                          color: 'var(--text-1)', fontWeight: 500,
                          borderBottom: '1px solid var(--border)',
                          fontSize: 11.5,
                        }}>
                          {valB}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Ask button */}
              {onAsk && (
                <button
                  type="button"
                  onClick={() => onAsk(
                    isAr
                      ? `قارن بين "${procA.title}" و "${procB.title}" — أيهما أسهل وأسرع؟`
                      : `Compare "${procA.title_en || procA.title}" and "${procB.title_en || procB.title}" — which is easier and faster?`
                  )}
                  style={{
                    marginTop: 10, padding: '8px 14px', borderRadius: 8,
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  💬 {isAr ? 'اسأل دليلك عن الفرق' : 'Ask Dalilak about the difference'}
                </button>
              )}
            </div>
          )}

          {!bothSelected && (
            <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--text-4)', fontSize: 12 }}>
              {isAr ? 'اختر معاملتين لمقارنتهما' : 'Select two procedures to compare them'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
