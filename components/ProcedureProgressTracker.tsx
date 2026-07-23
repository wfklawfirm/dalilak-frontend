'use client'

/**
 * ProcedureProgressTracker — shows overall user progress across all procedures.
 * Reads dalilak_checklist_* keys from localStorage to find started/completed checklists.
 * Reads dalilak_ratings_* for rated procedures.
 * Displays a compact progress summary on the homepage empty state.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

const LS_CHECKLIST_PREFIX = 'dalilak_checklist_'
const LS_RATING_PREFIX = 'dalilak_ratings_'
const LS_COMPLETED_PREFIX = 'dalilak_proc_done_'

interface ProcSummary {
  code: string
  titleAr: string
  titleEn: string
  totalDocs: number
  checkedDocs: number
  rated: boolean
  completed: boolean
}

function loadProgress(): ProcSummary[] {
  if (typeof window === 'undefined') return []
  const results: ProcSummary[] = []

  for (const proc of ENRICHED_PROCEDURES) {
    const clKey = LS_CHECKLIST_PREFIX + proc.code
    const ratingKey = LS_RATING_PREFIX + proc.code
    const doneKey = LS_COMPLETED_PREFIX + proc.code

    const clRaw = localStorage.getItem(clKey)
    const hasChecklist = clRaw !== null

    if (!hasChecklist) continue // only show procedures user interacted with

    let checkedDocs = 0
    const totalDocs = (proc.requiredDocuments || []).length

    try {
      const checked: number[] = JSON.parse(clRaw || '[]')
      checkedDocs = checked.length
    } catch {}

    const rated = !!localStorage.getItem(ratingKey)
    const completed = !!localStorage.getItem(doneKey) || (totalDocs > 0 && checkedDocs >= totalDocs)

    results.push({
      code: proc.code,
      titleAr: proc.title,
      titleEn: proc.title_en || proc.title,
      totalDocs,
      checkedDocs,
      rated,
      completed,
    })
  }

  return results
}

interface Props {
  onAsk?: (q: string) => void
}

export default function ProcedureProgressTracker({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [procs, setProcs] = useState<ProcSummary[]>([])
  const [expanded, setExpanded] = useState(false)

  const refresh = useCallback(() => {
    setProcs(loadProgress())
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('dalilak_saved_change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_saved_change', refresh)
    }
  }, [refresh])

  if (procs.length === 0) return null

  const completedCount = procs.filter(p => p.completed).length
  const inProgressCount = procs.length - completedCount
  const overallPct = procs.length > 0
    ? Math.round(
        procs.reduce((sum, p) => {
          if (p.totalDocs === 0) return sum + (p.completed ? 1 : 0)
          return sum + (p.checkedDocs / p.totalDocs)
        }, 0) / procs.length * 100
      )
    : 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
              {isAr ? 'تقدّمي في المعاملات' : 'My Procedure Progress'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 1 }}>
              {isAr
                ? `${completedCount} مكتملة · ${inProgressCount} قيد التنفيذ`
                : `${completedCount} completed · ${inProgressCount} in progress`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Overall progress ring */}
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={overallPct >= 100 ? '#10b981' : '#8F1D2C'}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - overallPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: 'var(--text-1)',
            }}>
              {overallPct}%
            </span>
          </div>
          <span style={{
            fontSize: 10, color: 'var(--text-4)',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.18s', display: 'inline-block',
          }}>▾</span>
        </div>
      </button>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)', marginInline: 14 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: overallPct >= 100 ? '#10b981' : '#8F1D2C',
          width: `${overallPct}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Expanded list */}
      {expanded && (
        <div style={{ padding: '10px 14px 12px', borderTop: '1px solid var(--border)', marginTop: 2 }}>
          {procs.map(p => {
            const pct = p.totalDocs > 0
              ? Math.round(p.checkedDocs / p.totalDocs * 100)
              : p.completed ? 100 : 0

            return (
              <div
                key={p.code}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {/* Status icon */}
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {p.completed ? '✅' : pct > 0 ? '🔄' : '📋'}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--text-1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {isAr ? p.titleAr : p.titleEn}
                  </div>
                  {p.totalDocs > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2 }}>
                        <div style={{
                          height: '100%', background: p.completed ? '#10b981' : '#8F1D2C',
                          borderRadius: 2, width: `${pct}%`,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ fontSize: 9.5, color: 'var(--text-4)', flexShrink: 0 }}>
                        {p.checkedDocs}/{p.totalDocs} {isAr ? 'وثيقة' : 'docs'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ask CTA */}
                {onAsk && !p.completed && (
                  <button
                    type="button"
                    onClick={() => onAsk(isAr
                      ? `ما هي المتطلبات لإتمام معاملة: ${p.titleAr}؟`
                      : `What do I need to complete the procedure: ${p.titleEn}?`
                    )}
                    style={{
                      flexShrink: 0, padding: '4px 9px', borderRadius: 7,
                      background: '#8F1D2C18', color: '#8F1D2C',
                      border: '1px solid #8F1D2C44', fontSize: 10.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {isAr ? 'اسأل' : 'Ask'}
                  </button>
                )}

                {p.rated && (
                  <span style={{ fontSize: 11, color: '#f59e0b', flexShrink: 0 }}>★</span>
                )}
              </div>
            )
          })}

          {procs.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-4)', fontSize: 12, padding: '8px 0' }}>
              {isAr ? 'ابدأ بفتح قائمة وثائق أي معاملة' : 'Open a procedure checklist to start tracking'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
