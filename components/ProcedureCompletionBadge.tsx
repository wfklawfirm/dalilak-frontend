'use client'

/**
 * ProcedureCompletionBadge — marks a procedure as fully completed.
 *
 * localStorage key: dalilak_completed_{code} = "YYYY-MM-DD"
 *
 * States:
 *   - Not started  → shows nothing (hides if no dalilak_started_{code} key either)
 *   - Not complete → shows "✓ أنهيت هذه المعاملة" button
 *   - Completed    → shows green badge with completion date + undo
 *
 * On first completion fires a 1-second confetti burst via CSS keyframes.
 * Fires dalilak_saved_change event so progress trackers update.
 */

import React, { useState, useEffect } from 'react'

const LS_COMPLETE = 'dalilak_completed_'
const LS_STARTED  = 'dalilak_started_'

export function getCompletionDate(code: string): string | null {
  try { return localStorage.getItem(LS_COMPLETE + code) } catch { return null }
}

export function markCompleted(code: string) {
  const today = new Date().toISOString().slice(0, 10)
  try { localStorage.setItem(LS_COMPLETE + code, today) } catch {}
  window.dispatchEvent(new Event('dalilak_saved_change'))
  window.dispatchEvent(new Event('storage'))
}

export function unmarkCompleted(code: string) {
  try { localStorage.removeItem(LS_COMPLETE + code) } catch {}
  window.dispatchEvent(new Event('dalilak_saved_change'))
  window.dispatchEvent(new Event('storage'))
}

function formatDate(iso: string, isAr: boolean): string {
  try {
    return new Date(iso).toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Beirut',
    })
  } catch { return iso }
}

const CONFETTI_COLORS = ['#8F1D2C', '#10B981', '#F59E0B', '#3B82F6', '#EC4899']

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureCompletionBadge({ code, isAr }: Props) {
  const [completedDate, setCompletedDate] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCompletedDate(getCompletionDate(code))
  }, [code])

  function handleComplete() {
    markCompleted(code)
    setCompletedDate(new Date().toISOString().slice(0, 10))
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1800)
  }

  function handleUndo() {
    unmarkCompleted(code)
    setCompletedDate(null)
  }

  if (!mounted) return null

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Confetti burst */}
      {showConfetti && (
        <div aria-hidden="true" style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 9999 }}>
          <style>{`
            @keyframes confetti-fall {
              0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
              100% { transform: translateY(60px) rotate(720deg) scale(0.3); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 7, height: 7,
                borderRadius: i % 3 === 0 ? '50%' : 2,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                left: `${(i - 6) * 8}px`,
                animation: `confetti-fall ${0.8 + (i % 4) * 0.2}s ease-out ${i * 0.05}s both`,
              }}
            />
          ))}
        </div>
      )}

      {completedDate ? (
        /* Completed state */
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 20,
          background: '#ECFDF5', border: '1.5px solid #6EE7B7',
          fontSize: 10.5, fontWeight: 700, color: '#065F46',
        }}>
          <span style={{ fontSize: 13 }}>🎉</span>
          <span>
            {isAr
              ? `أُنجزت — ${formatDate(completedDate, isAr)}`
              : `Completed — ${formatDate(completedDate, isAr)}`}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            title={isAr ? 'إلغاء' : 'Undo'}
            aria-label={isAr ? 'إلغاء الإنجاز' : 'Undo completion'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#059669', fontSize: 11, padding: 0,
              display: 'flex', alignItems: 'center',
            }}
          >✕</button>
        </div>
      ) : (
        /* Not completed */
        <button
          type="button"
          onClick={handleComplete}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 20,
            background: '#F0FDF4', border: '1.5px dashed #34D399',
            color: '#047857', fontSize: 10.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#D1FAE5'
            e.currentTarget.style.borderStyle = 'solid'
            e.currentTarget.style.borderColor = '#10B981'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#F0FDF4'
            e.currentTarget.style.borderStyle = 'dashed'
            e.currentTarget.style.borderColor = '#34D399'
          }}
        >
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {isAr ? 'أنهيت هذه المعاملة 🎉' : 'Mark as completed 🎉'}
        </button>
      )}
    </div>
  )
}
