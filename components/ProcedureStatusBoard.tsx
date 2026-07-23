'use client'

/**
 * ProcedureStatusBoard — collapsible kanban overview of all tracked procedures.
 *
 * Three groups:
 *   🕐 بدأت (started, not completed)
 *   ✅ أُنجزت (completed)
 *
 * For each procedure, shows: icon, title, ministry, elapsed days since start.
 * Tapping a card navigates to /procedures#proc-{code}.
 *
 * Listens to dalilak_saved_change + storage events for live refresh.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface ProcCard {
  code: string
  icon: string
  titleAr: string
  titleEn?: string
  ministryAr: string
  ministryEn?: string
  startDate: string
  completedDate: string | null
  elapsedDays: number
}

function readTracked(): { started: ProcCard[]; completed: ProcCard[] } {
  const started: ProcCard[]   = []
  const completed: ProcCard[] = []
  const now = Date.now()
  try {
    for (const proc of ENRICHED_PROCEDURES) {
      const startStr = localStorage.getItem(`dalilak_started_${proc.code}`)
      if (!startStr) continue
      const completedStr = localStorage.getItem(`dalilak_completed_${proc.code}`)
      const elapsed = Math.floor((now - new Date(startStr).getTime()) / 86_400_000)
      const card: ProcCard = {
        code: proc.code,
        icon: proc.icon || '📄',
        titleAr: proc.title,
        titleEn: proc.title_en,
        ministryAr: proc.ministry,
        ministryEn: proc.ministry_en,
        startDate: startStr,
        completedDate: completedStr,
        elapsedDays: Math.max(0, elapsed),
      }
      if (completedStr) completed.push(card)
      else started.push(card)
    }
  } catch {}
  return { started, completed }
}

export default function ProcedureStatusBoard() {
  const { isAr } = useLanguage()
  const [data, setData] = useState<{ started: ProcCard[]; completed: ProcCard[] }>({ started: [], completed: [] })
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => setData(readTracked()), [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted || (data.started.length === 0 && data.completed.length === 0)) return null

  const total = data.started.length + data.completed.length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 18 }}>📊</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#191713' }}>
            {isAr ? 'لوحة تتبع المعاملات' : 'Procedure Tracker'}
          </div>
          <div style={{ fontSize: 10, color: '#918B82', marginTop: 1 }}>
            {isAr
              ? `${data.completed.length} أُنجزت · ${data.started.length} قيد الإنجاز`
              : `${data.completed.length} done · ${data.started.length} in progress`}
          </div>
        </div>
        {/* Mini progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 48, height: 5, borderRadius: 3, background: '#E6E2DC', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, background: '#10B981',
              width: `${total > 0 ? (data.completed.length / total) * 100 : 0}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2.5"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #E6E2DC', padding: '10px 14px 12px' }}>
          {/* In Progress */}
          {data.started.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>🕐</span> {isAr ? `قيد الإنجاز (${data.started.length})` : `In Progress (${data.started.length})`}
              </div>
              {data.started.map(c => (
                <ProcCardRow key={c.code} card={c} isAr={isAr} status="started" />
              ))}
            </div>
          )}

          {/* Completed */}
          {data.completed.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✅</span> {isAr ? `أُنجزت (${data.completed.length})` : `Completed (${data.completed.length})`}
              </div>
              {data.completed.map(c => (
                <ProcCardRow key={c.code} card={c} isAr={isAr} status="completed" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProcCardRow({ card, isAr, status }: { card: ProcCard; isAr: boolean; status: 'started' | 'completed' }) {
  const title    = isAr ? card.titleAr : (card.titleEn || card.titleAr)
  const ministry = isAr ? card.ministryAr : (card.ministryEn || card.ministryAr)
  const accent   = status === 'completed' ? '#065F46' : '#92400E'
  const bg       = status === 'completed' ? '#ECFDF5' : '#FFFBEB'
  const border   = status === 'completed' ? '#A7F3D0' : '#FDE68A'

  return (
    <a
      href={`/procedures#proc-${card.code}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 10, marginBottom: 5,
        background: bg, border: `1px solid ${border}`,
        textDecoration: 'none', color: 'inherit',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{card.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#191713', lineHeight: 1.3 }}>
          {title.length > 45 ? title.slice(0, 45) + '…' : title}
        </div>
        <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 1 }}>{ministry}</div>
      </div>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, flexShrink: 0, textAlign: 'center' }}>
        {status === 'completed'
          ? (isAr ? '🎉 منجز' : '🎉 Done')
          : (isAr ? `يوم ${card.elapsedDays}` : `Day ${card.elapsedDays}`)}
      </div>
    </a>
  )
}
