'use client'

/**
 * ProcedureHistoryLog — per-procedure event log.
 *
 * Records events with timestamps: "viewed", "started", "step_N_done", "completed".
 * Displayed as a compact expandable timeline inside the procedure detail.
 *
 * LS key: dalilak_history_{code} → LogEntry[]
 * LogEntry: { event: string; ts: number }
 *
 * Auto-appends "viewed" event on mount (once per day).
 *
 * Export: addHistoryEvent(code, event) — call from other components
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

export interface LogEntry {
  event: string
  ts: number
}

const EVENT_LABELS: Record<string, { ar: string; en: string; icon: string }> = {
  viewed:    { ar: 'تم العرض',      en: 'Viewed',          icon: '👁️' },
  started:   { ar: 'بدأت المعاملة', en: 'Started',         icon: '🚀' },
  completed: { ar: 'أكملت المعاملة',en: 'Completed',       icon: '✅' },
}

function getLabel(event: string, isAr: boolean): { label: string; icon: string } {
  if (EVENT_LABELS[event]) {
    const e = EVENT_LABELS[event]
    return { label: isAr ? e.ar : e.en, icon: e.icon }
  }
  const m = event.match(/^step_(\d+)_done$/)
  if (m) {
    const n = parseInt(m[1], 10) + 1
    return { label: isAr ? `خطوة ${n} مكتملة` : `Step ${n} done`, icon: '☑️' }
  }
  return { label: event, icon: '📌' }
}

export function addHistoryEvent(code: string, event: string) {
  try {
    const key = `dalilak_history_${code}`
    const list: LogEntry[] = JSON.parse(localStorage.getItem(key) || '[]')
    list.push({ event, ts: Date.now() })
    // Keep only the most recent 30 entries
    if (list.length > 30) list.splice(0, list.length - 30)
    localStorage.setItem(key, JSON.stringify(list))
  } catch {}
}

function loadHistory(code: string): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(`dalilak_history_${code}`) || '[]')
  } catch { return [] }
}

function formatTs(ts: number, isAr: boolean): string {
  const d = new Date(ts)
  return d.toLocaleString(isAr ? 'ar-LB' : 'en-LB', {
    timeZone: 'Asia/Beirut',
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getTodayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureHistoryLog({ code, isAr }: Props) {
  const [log, setLog]       = useState<LogEntry[]>([])
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Record "viewed" once per day
    const viewKey = `dalilak_viewed_today_${code}`
    const today = getTodayKey()
    if (localStorage.getItem(viewKey) !== today) {
      addHistoryEvent(code, 'viewed')
      localStorage.setItem(viewKey, today)
    }

    setLog(loadHistory(code))

    const handler = () => setLog(loadHistory(code))
    window.addEventListener('dalilak_saved_change', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('dalilak_saved_change', handler)
      window.removeEventListener('storage', handler)
    }
  }, [code])

  if (!mounted || log.length === 0) return null

  const latest = log[log.length - 1]
  const { label: latestLabel, icon: latestIcon } = getLabel(latest.event, isAr)

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 10px', background: '#F5F3EE', border: '1px solid #E6E2DC',
          borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 13 }}>📋</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#191713' }}>
            {isAr ? 'سجل النشاط' : 'Activity log'}
          </div>
          <div style={{ fontSize: 9, color: '#918B82' }}>
            {isAr ? 'آخر حدث:' : 'Last:'} {latestIcon} {latestLabel} — {formatTs(latest.ts, isAr)}
          </div>
        </div>
        <span style={{ fontSize: 9.5, background: '#E6E2DC', color: '#6B5A4A', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>
          {log.length}
        </span>
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2.5" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{
          marginTop: 4, padding: '8px 10px',
          background: '#FDFCFA', border: '1px solid #E6E2DC', borderRadius: 8,
          maxHeight: 240, overflowY: 'auto',
          display: 'flex', flexDirection: 'column-reverse', gap: 4,
        }}>
          {[...log].reverse().map((entry, i) => {
            const { label, icon } = getLabel(entry.event, isAr)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 6, background: i === 0 ? 'rgba(143,29,44,0.04)' : 'transparent' }}>
                <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
                <span style={{ flex: 1, fontSize: 10.5, fontWeight: i === 0 ? 700 : 500, color: '#191713' }}>{label}</span>
                <span style={{ fontSize: 9, color: '#B8B2AB', flexShrink: 0 }}>{formatTs(entry.ts, isAr)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
