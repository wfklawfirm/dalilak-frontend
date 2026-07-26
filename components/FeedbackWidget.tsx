'use client'

/**
 * FeedbackWidget — inline site-level feedback card, shown within the chat
 * message flow (same placement pattern as ChatSummaryCard). Collapsed by
 * default to a single compact row; tapping it expands a 1–5 star rating +
 * optional comment inline, in place — no floating popover.
 *
 * Was previously a fixed-position floating FAB in the corner. Converted to
 * an inline card as the last step of the UX consolidation pass
 * (UX_AUDIT.md — "one floating button app-wide", now fully satisfied
 * app-wide with zero exceptions). Same trigger logic, same data, only the
 * container changed from position:fixed to a normal block element.
 * Stores in localStorage: dalilak_site_feedback = { rating, comment, ts }
 *
 * Only renders after:
 *   - 3+ messages sent (sessionStorage dalilak_msg_count ≥ 3), OR
 *   - 5+ minutes since first page load (tracked in sessionStorage dalilak_session_start)
 */

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { authHeaders } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'
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
    // batch #499: كان هذا التقييم يُخزَّن محلياً على جهاز المستخدم فقط ولا
    // يصل لأي مكان — يعرض "شكراً على تقييمك" مع أن الفريق لا يرى شيئاً.
    // يُرسَل الآن فعلياً لنقطة /feedback الحقيقية نفسها التي يستخدمها تقييم
    // 👍/👎 على الردود (AgentResponseRenderer.tsx)، فيظهر ضمن لوحة
    // /admin/feedback الحقيقية. لا تعديل على شكل الـ Backend API — فقط
    // إعادة استخدام الحقول الموجودة أصلاً (rating بصيغة up/down، question،
    // answer) بإسقاط تقييم النجوم عليها.
    fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        question: 'تقييم عام لتجربة الموقع (Site Feedback Widget)',
        answer: comment ? `${rating}/5 نجوم — ${comment}` : `${rating}/5 نجوم`,
        rating: rating >= 4 ? 'up' : 'down',
        confidence: 'site_feedback',
      }),
    }).catch(() => {})
    setSubmitted(true)
    setTimeout(() => { setOpen(false); setVisible(false) }, 2000)
  }

  if (!visible) return null

  // Submitted state auto-hides the whole card after 2s (see handleSubmit's
  // setVisible(false) timeout) — while it's showing, replace the card
  // content with a brief thank-you instead of the rating form.
  if (submitted) {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          margin: '12px 0', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.22s ease both',
          padding: '16px 14px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>🙏</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>
          {isAr ? 'شكراً على تقييمك!' : 'Thanks for your feedback!'}
        </div>
      </div>
    )
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '12px 0',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Collapsed row — tap to expand inline (no floating popover) */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="tap-hit-1"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 14px', border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)' }}>
          {isAr ? 'شاركنا رأيك' : 'Share Your Feedback'}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--text-3)', fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '4px 14px 14px', borderTop: '1px solid var(--border)' }}>
          {/* Star rating */}
          <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 8px' }}>
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
                aria-label={isAr ? `${star} من 5 نجوم` : `${star} out of 5 stars`}
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
              aria-label={isAr ? 'تعليق اختياري على تقييمك' : 'Optional comment on your rating'}
              rows={2}
              style={{
                width: '100%', resize: 'none', padding: '7px 9px',
                border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 12, lineHeight: 1.6,
                color: 'var(--text-1)', background: 'var(--bg)',
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
              background: rating > 0 ? '#8F1D2C' : 'var(--bg)',
              color: rating > 0 ? '#fff' : 'var(--text-3)',
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
  )
}
