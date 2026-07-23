'use client'

/**
 * HomepageWeeklyGoalWidget — "هدف الأسبوع" goal tracker.
 *
 * User picks a procedure as their weekly goal. Shows a progress bar based on
 * how many steps they've completed (dalilak_step_{code}_{i}). Resets each week.
 *
 * LS keys:
 *   dalilak_weekly_goal           → { code, title, stepCount, weekOf: "YYYY-WW" }
 *   dalilak_step_{code}_{i}       → "1" per completed step (from ProcedureStepProgress)
 *
 * Collapses by default; hidden if no enriched procedures found.
 */

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface GoalData {
  code: string
  title: string
  title_en?: string
  stepCount: number
  weekOf: string
}

function getWeekOf(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function loadGoal(): GoalData | null {
  try {
    const raw = localStorage.getItem('dalilak_weekly_goal')
    if (!raw) return null
    const g: GoalData = JSON.parse(raw)
    if (g.weekOf !== getWeekOf()) {
      localStorage.removeItem('dalilak_weekly_goal')
      return null
    }
    return g
  } catch { return null }
}

function saveGoal(g: GoalData) {
  try { localStorage.setItem('dalilak_weekly_goal', JSON.stringify(g)) } catch {}
}

function countCompleted(code: string, stepCount: number): number {
  let count = 0
  try {
    for (let i = 0; i < stepCount; i++) {
      if (localStorage.getItem(`dalilak_step_${code}_${i}`) === '1') count++
    }
  } catch {}
  return count
}

export default function HomepageWeeklyGoalWidget() {
  const { isAr } = useLanguage()
  const [goal, setGoal]         = useState<GoalData | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [picking, setPicking]   = useState(false)
  const [search, setSearch]     = useState('')
  const [completed, setCompleted] = useState(0)
  const [mounted, setMounted]   = useState(false)

  const refreshCompleted = useCallback((g: GoalData | null) => {
    if (g) setCompleted(countCompleted(g.code, g.stepCount))
  }, [])

  useEffect(() => {
    setMounted(true)
    const g = loadGoal()
    setGoal(g)
    refreshCompleted(g)
    const handler = () => { const g2 = loadGoal(); setGoal(g2); refreshCompleted(g2) }
    window.addEventListener('dalilak_saved_change', handler)
    window.addEventListener('storage', handler)
    return () => { window.removeEventListener('dalilak_saved_change', handler); window.removeEventListener('storage', handler) }
  }, [refreshCompleted])

  function pickGoal(proc: typeof ENRICHED_PROCEDURES[0]) {
    const g: GoalData = { code: proc.code, title: proc.title, title_en: proc.title_en, stepCount: proc.steps.length, weekOf: getWeekOf() }
    saveGoal(g)
    setGoal(g)
    refreshCompleted(g)
    setPicking(false)
    setSearch('')
    setExpanded(true)
  }

  function clearGoal() {
    try { localStorage.removeItem('dalilak_weekly_goal') } catch {}
    setGoal(null)
    setCompleted(0)
  }

  if (!mounted) return null

  const filtered = ENRICHED_PROCEDURES.filter(p => {
    const q = search.toLowerCase()
    return !q || p.title.includes(q) || (p.title_en || '').toLowerCase().includes(q)
  }).slice(0, 8)

  const pct = goal && goal.stepCount > 0 ? Math.round((completed / goal.stepCount) * 100) : 0
  const isDone = pct === 100
  const goalTitle = goal ? (isAr ? goal.title : (goal.title_en || goal.title)) : ''

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: isDone ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #F5F3EE, #F5F0F8)',
        border: `1.5px solid ${isDone ? '#A7F3D0' : 'rgba(124,58,237,0.18)'}`,
        borderRadius: 12, overflow: 'hidden', marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{isDone ? '🏆' : '🎯'}</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: isDone ? '#065F46' : '#4C1D95' }}>
            {isAr ? 'هدف الأسبوع' : 'Weekly Goal'}
          </div>
          {goal ? (
            <div style={{ fontSize: 10, color: isDone ? '#059669' : '#7C3AED', fontWeight: 600, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
              {isDone ? (isAr ? '✓ مكتمل — ' : '✓ Done — ') : ''}{goalTitle}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: '#918B82', marginTop: 1 }}>
              {isAr ? 'لم تختر هدفًا بعد' : 'No goal set yet'}
            </div>
          )}
        </div>
        {goal && (
          <div style={{ flexShrink: 0, textAlign: isAr ? 'left' : 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: isDone ? '#059669' : '#7C3AED' }}>{pct}%</div>
            <div style={{ fontSize: 9, color: '#918B82' }}>{completed}/{goal.stepCount}</div>
          </div>
        )}
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isDone ? '#059669' : '#7C3AED'} strokeWidth="2.5" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${isDone ? '#A7F3D0' : 'rgba(124,58,237,0.15)'}`, padding: '10px 13px' }}>
          {/* Progress bar */}
          {goal && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 7, background: '#E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 10,
                  background: isDone ? '#10B981' : 'linear-gradient(90deg,#7C3AED,#A855F7)',
                  width: `${pct}%`, transition: 'width 0.5s ease',
                }}/>
              </div>
              <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 4 }}>
                {isAr
                  ? `${completed} من ${goal.stepCount} خطوات مكتملة`
                  : `${completed} of ${goal.stepCount} steps done`}
              </div>
              {isDone && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginTop: 5 }}>
                  🎉 {isAr ? 'أنجزت هدفك هذا الأسبوع!' : 'You crushed your weekly goal!'}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Link href={`/procedures?q=${encodeURIComponent(goal.title)}`}
                  style={{ flex: 1, textAlign: 'center', padding: '6px', background: isDone ? '#059669' : '#7C3AED', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>
                  {isAr ? 'اذهب للمعاملة ←' : 'Go to procedure →'}
                </Link>
                <button type="button" onClick={clearGoal}
                  style={{ padding: '6px 10px', background: 'none', border: '1px solid #D1CBC4', borderRadius: 8, cursor: 'pointer', fontSize: 10, color: '#918B82', fontFamily: 'inherit', fontWeight: 600 }}>
                  {isAr ? 'تغيير' : 'Change'}
                </button>
              </div>
            </div>
          )}

          {/* Goal picker */}
          {(!goal || picking) && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', marginBottom: 6 }}>
                {isAr ? 'اختر هدف الأسبوع:' : 'Set your weekly goal:'}
              </div>
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن معاملة...' : 'Search procedure...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '5px 9px', border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', color: '#191713', marginBottom: 6, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 180, overflowY: 'auto' }}>
                {filtered.map(p => (
                  <button key={p.code} type="button" onClick={() => pickGoal(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px',
                      background: '#F5F3EE', border: '1px solid #E6E2DC', borderRadius: 8,
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                    }}>
                    <span style={{ fontSize: 13 }}>{p.icon || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#191713', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {isAr ? p.title : (p.title_en || p.title)}
                      </div>
                      <div style={{ fontSize: 9, color: '#918B82' }}>
                        {p.steps.length} {isAr ? 'خطوة' : 'steps'} · {isAr ? p.ministry : (p.ministry_en || p.ministry)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {goal && (
                <button type="button" onClick={() => setPicking(false)}
                  style={{ marginTop: 6, fontSize: 10, color: '#918B82', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
