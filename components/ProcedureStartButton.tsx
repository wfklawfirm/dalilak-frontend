'use client'

/**
 * ProcedureStartButton — "بدأت هذه المعاملة" in-progress tracker.
 *
 * When clicked, saves the start date to localStorage:
 *   dalilak_started_{code} = ISO date string "YYYY-MM-DD"
 *
 * Once started:
 *   - Shows "✓ بدأت" badge with elapsed days
 *   - Shows a "إلغاء" (unmark) button
 *   - Fires custom event dalilak_saved_change so ProcedureProgressTracker updates
 *
 * Props:
 *   code   — procedure code
 *   isAr   — current language
 */

import React, { useState, useEffect } from 'react'

const LS_PREFIX = 'dalilak_started_'

export function getStartDate(code: string): string | null {
  try { return localStorage.getItem(LS_PREFIX + code) } catch { return null }
}

export function setStartDate(code: string) {
  const today = new Date().toISOString().slice(0, 10)
  try { localStorage.setItem(LS_PREFIX + code, today) } catch {}
  window.dispatchEvent(new Event('dalilak_saved_change'))
  window.dispatchEvent(new Event('storage'))
}

export function clearStartDate(code: string) {
  try { localStorage.removeItem(LS_PREFIX + code) } catch {}
  window.dispatchEvent(new Event('dalilak_saved_change'))
  window.dispatchEvent(new Event('storage'))
}

function daysElapsed(isoDate: string): number {
  const start = new Date(isoDate); start.setHours(0, 0, 0, 0)
  const now   = new Date();        now.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureStartButton({ code, isAr }: Props) {
  const [startDate, setStartDateState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setStartDateState(getStartDate(code))
  }, [code])

  if (!mounted) return null

  if (startDate) {
    const days = daysElapsed(startDate)
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 20,
        background: '#ECFDF5', border: '1px solid #A7F3D0',
        fontSize: 10.5, fontWeight: 700, color: '#065F46',
      }}>
        <span>✓</span>
        <span>
          {isAr
            ? (days === 0 ? 'بدأت اليوم' : `بدأت منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`)
            : (days === 0 ? 'Started today' : `Started ${days} day${days !== 1 ? 's' : ''} ago`)}
        </span>
        <button
          type="button"
          onClick={() => { clearStartDate(code); setStartDateState(null) }}
          title={isAr ? 'إلغاء التعيين' : 'Unmark'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#059669', fontSize: 11, padding: 0,
            display: 'flex', alignItems: 'center',
          }}
        >✕</button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => { setStartDate(code); setStartDateState(new Date().toISOString().slice(0, 10)) }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 20,
        background: '#F0FDF4', border: '1.5px dashed #6EE7B7',
        color: '#065F46', fontSize: 10.5, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#D1FAE5'; e.currentTarget.style.borderStyle = 'solid' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderStyle = 'dashed' }}
    >
      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      {isAr ? 'بدأت هذه المعاملة' : 'Mark as started'}
    </button>
  )
}
