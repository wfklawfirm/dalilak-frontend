'use client'

/**
 * FeedbackWidget — floating site-level feedback button.
 * Appears as a small 💬 button fixed bottom-right, above the BottomNav.
 * On click, opens a mini panel with 1–5 star rating + optional comment.
 * Stores in localStorage: dalilak_site_feedback = { rating, comment, ts }
 *
 * Only renders after:
 *   - 3+ messages sent (sessionStorage dalilak_msg_count ≥ 3), OR
 *   - 5+ minutes since first page load (tracked in sessionStorage dalilak_session_start)
 */

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_KEY = 'dalilak_site_feedback'
const SS_START = 'dalilak_session_start'
const SS_COUNT = 'dalilak_msg_count'
const MIN_WAIT_MS = 5 * 60 * 1000  // 5 minutes
const MIN_MESSAGES = 3

interface StoredFeedback {
  rating: number
  comment: string
  ts: number
}

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false
  try {
    // Already submitted — don't show again for 7 days
    const existing = localStorage.getItem(LS_KEY)
    if (existing) {
      const fb: StoredFeedback = JSON.parse(existing)
      if (Date.now() - fb.ts < 7 * 24 * 3600_000) return false
    }
    // Check session start
    const start = parseInt(sessionStorage.getItem(SS_START) || '0', 10)
    if (Date.now() - start >= MIN_WAIT_MS) return true
    // Check message count
    const count = parseInt(sessionStorage.getItem(SS_COUNT) || '0', 10)
    return count >= MIN_MESSAGES
  } catch { return false }
}

interface Props {
  messageCount?: number  // pass messages.length from page.tsx
}

export default function FeedbackWidget({ messageCount = 0 }: Props) {
  const { isAr } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Record session start
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SS_START)) {
        sessionStorage.setItem(SS_START, String(Date.now()))
      }
    } catch {}
  }, [])

  // Track message count
  useEffect(() => {
    if (messageCount <= 0) return
    try { sessionStorage.setItem(SS_COUNT, String(messageCount)) } catch {}
  }, [messageCount])

  // Check periodically whether to show
  useEffect(() => {
    const check = () => { if (shouldShow()) { setVisible(true); clearRef() } }
    check()
    checkRef.current = setInterval(check, 30_000)
    return () => clearRef()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Also recheck when message count changes
  useEffect(() => {
    if (shouldShow()) setVisible(true)
  }, [messageCount])

  function clearRef() {
    if (checkRef.current) { clearInterval(checkRef.current); checkRef.current = null }
  }

  const handleSubmit = () => {
    if (rating === 0) return
    try {
      const fb: StoredFeedback = { rating, comment, ts: Date.now() }
      localStorage.setItem(LS_KEY, JSON.stringify(fb))
    } catch {}
    setSubmitted(true)
    setTimeout(() => { setOpen(false); setVisible(false) }, 2000)
  }

  if (!visible) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        bottom: 90,          // above BottomNav (~72px)
        [isAr ? 'left' : 'right']: 14,
        zIndex: 9950,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAr ? 'flex-start' : 'flex-end',
        gap: 8,
      }}
    >
      {/* Floating panel */}
      {open && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          width: 260,
          overflow: 'hidden',
          animation: 'fadeUp 0.18s ease both',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 14px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
              {isAr ? 'شاركنا رأيك 💬' : 'Share Your Feedback 💬'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 16, padding: '0 2px' }}
            >×</button>
          </div>

          {submitted ? (
            <div style={{ padding: '20px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                {isAr ? 'شكراً على تقييمك!' : 'Thanks for your feedback!'}
              </div>
            </div>
          ) : (
            <div style={{ padding: '14px' }}>
              {/* Star rating */}
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 8 }}>
                {isAr ? 'كيف تُقيّم تجربتك مع دليلك؟' : 'How would you rate your experience?'}
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 26, padding: '0 2px',
                      color: star <= (hover || rating) ? '#f59e0b' : '#d1d5db',
                      transition: 'color 0.1s, transform 0.1s',
                      transform: star <= (hover || rating) ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >★</button>
                ))}
              </div>

              {/* Optional comment */}
              {rating > 0 && (
                <textarea
                  dir={isAr ? 'rtl' : 'ltr'}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={isAr ? 'أي اقتراحات؟ (اختياري)' : 'Any suggestions? (optional)'}
                  rows={2}
                  style={{
                    width: '100%', resize: 'none', padding: '7px 9px',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontSize: 12, lineHeight: 1.6,
                    color: 'var(--text-1)', background: 'var(--surface)',
                    outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box', marginBottom: 10,
                  }}
                />
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 9,
                  background: rating > 0 ? '#8F1D2C' : 'var(--surface)',
                  color: rating > 0 ? '#fff' : 'var(--text-4)',
                  border: '1px solid var(--border)',
                  fontSize: 12.5, fontWeight: 700, cursor: rating > 0 ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
                }}
              >
                {isAr ? 'إرسال التقييم' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={isAr ? 'شاركنا رأيك' : 'Give feedback'}
        title={isAr ? 'شاركنا رأيك' : 'Give feedback'}
        style={{
          width: 42, height: 42, borderRadius: 13,
          background: open ? '#8F1D2C' : 'var(--bg)',
          border: `1.5px solid ${open ? '#8F1D2C' : 'var(--border)'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          cursor: 'pointer', fontSize: 19,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.18s, border-color 0.18s',
          color: open ? '#fff' : 'var(--text-2)',
        }}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
