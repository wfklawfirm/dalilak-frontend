'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface ReadinessCheckerProps {
  /** Unique key used for localStorage persistence (slug or service id) */
  storageKey: string
  /** Arabic document names */
  documentsAr: string[]
  /** English document names (parallel array; falls back to Arabic if absent) */
  documentsEn?: string[]
  /** Procedure / service name shown in the header */
  titleAr?: string
  titleEn?: string
  /** Called when user taps "Ask Dalilak" about a missing document */
  onAsk?: (question: string) => void
  /** Compact mode — smaller, no title, used inside a parent card */
  compact?: boolean
}

export default function ReadinessChecker({
  storageKey,
  documentsAr,
  documentsEn,
  titleAr,
  titleEn,
  onAsk,
  compact = false,
}: ReadinessCheckerProps) {
  const { isAr } = useLanguage()
  const lsKey = `dalilak_ready_${storageKey}`

  // checked = Set of indices that the user marked as ready
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem(lsKey)
      return saved ? new Set<number>(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [justSaved, setJustSaved] = useState(false)

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(lsKey, JSON.stringify(Array.from(checked)))
    } catch { /* ignore storage errors */ }
  }, [checked, lsKey])

  const toggle = useCallback((i: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }, [])

  const reset = () => {
    setChecked(new Set())
    try { localStorage.removeItem(lsKey) } catch { /* ignore */ }
  }

  const total = documentsAr.length
  const done = checked.size
  const pct = total === 0 ? 100 : Math.round((done / total) * 100)
  const ready = done === total && total > 0

  const docs = documentsAr.map((ar, i) => ({
    ar,
    en: documentsEn?.[i] || ar,
  }))

  // Colour ramp
  const barColor = pct === 100 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--brand)'
  const barBg = pct === 100 ? 'var(--success-bg)' : pct >= 60 ? 'var(--accent-light)' : 'var(--brand-soft)'
  const barText = pct === 100 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--brand)'

  if (total === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: compact ? 'transparent' : 'var(--surface-muted)',
        border: compact ? 'none' : '1px solid var(--border)',
        borderRadius: compact ? 0 : 14,
        padding: compact ? '0' : '16px',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Header ── */}
      {!compact && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>
                {isAr ? 'مدقق الجاهزية' : 'Readiness Checker'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {/* Print checklist */}
              <button
                type="button"
                onClick={() => {
                  const title = isAr ? (titleAr || 'قائمة الوثائق') : (titleEn || 'Document Checklist')
                  const rows = docs.map(({ ar, en }, i) =>
                    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">
                      <span style="display:inline-block;width:16px;height:16px;border:2px solid #8F1D2C;border-radius:3px;margin-inline-end:8px;vertical-align:middle;background:${checked.has(i) ? '#8F1D2C' : '#fff'}">${checked.has(i) ? '<span style="color:#fff;font-size:11px;line-height:16px;display:block;text-align:center">✓</span>' : ''}</span>
                      ${isAr ? ar : en}
                    </td></tr>`
                  ).join('')
                  const win = window.open('', '_blank', 'width=600,height=800')
                  if (!win) return
                  win.document.write(`<!DOCTYPE html><html dir="${isAr ? 'rtl' : 'ltr'}"><head>
                    <meta charset="utf-8"><title>${title}</title>
                    <style>body{font-family:Arial,sans-serif;margin:40px;color:#1a1a1a}
                    h1{color:#8F1D2C;font-size:20px;margin-bottom:4px}
                    p{color:#666;font-size:12px;margin-bottom:24px}
                    table{width:100%;border-collapse:collapse}
                    .footer{margin-top:32px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
                    @media print{body{margin:20px}button{display:none}}
                    </style></head><body>
                    <h1>${title}</h1>
                    <p>${isAr ? 'قائمة الوثائق المطلوبة — دليلك AI' : 'Required documents checklist — Dalilak AI'}</p>
                    <table>${rows}</table>
                    <div class="footer">${isAr ? 'دليلك AI — dalilak.vercel.app' : 'Dalilak AI — dalilak.vercel.app'} &nbsp;|&nbsp; ${new Date().toLocaleDateString(isAr ? 'ar-LB' : 'en-LB')}</div>
                    <br><button onclick="window.print()" style="padding:8px 16px;background:#8F1D2C;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">${isAr ? 'طباعة / PDF' : 'Print / Save PDF'}</button>
                  </body></html>`)
                  win.document.close()
                }}
                aria-label={isAr ? 'طباعة القائمة' : 'Print checklist'}
                title={isAr ? 'طباعة / حفظ PDF' : 'Print / Save as PDF'}
                style={{
                  fontSize: 11, color: 'var(--text-3)', background: 'none',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  fontFamily: 'inherit', padding: '3px 8px', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 3,
                  transition: 'color 0.13s, border-color 0.13s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/><path strokeLinecap="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                {isAr ? 'طباعة' : 'Print'}
              </button>
              {done > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label={isAr ? 'إعادة ضبط' : 'Reset'}
                  style={{
                    fontSize: 11, color: 'var(--text-3)', background: 'none',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    padding: '3px 8px', borderRadius: 6,
                    transition: 'color 0.13s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
                >
                  {isAr ? 'إعادة ضبط' : 'Reset'}
                </button>
              )}
            </div>
          </div>
          {(titleAr || titleEn) && (
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '4px 0 0', lineHeight: 1.5 }}>
              {isAr
                ? `ضع علامة على الوثائق التي جهّزتها لـ«${titleAr}»`
                : `Mark the documents you've prepared for "${titleEn}"`}
            </p>
          )}
        </div>
      )}

      {/* ── Progress bar ── */}
      <div style={{
        marginBottom: 14,
        padding: '10px 12px',
        background: barBg,
        borderRadius: 10,
        border: `1px solid ${barColor}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: barText }}>
            {ready
              ? (isAr ? '✅ أنت جاهز تماماً!' : '✅ You\'re fully ready!')
              : (isAr ? `${done} من ${total} وثائق جاهزة` : `${done} of ${total} documents ready`)}
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: barText, lineHeight: 1 }}>
            {pct}%
          </span>
        </div>
        <div style={{ height: 6, background: `${barColor}22`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: barColor, borderRadius: 3,
            width: `${pct}%`,
            transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
      </div>

      {/* ── Document list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {docs.map(({ ar, en }, i) => {
          const isChecked = checked.has(i)
          const label = isAr ? ar : en
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 10px', borderRadius: 9,
                background: isChecked ? 'var(--success-bg)' : 'var(--surface)',
                border: `1px solid ${isChecked ? 'var(--success-border)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onClick={() => toggle(i)}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && toggle(i)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
            >
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: `2px solid ${isChecked ? 'var(--success)' : 'var(--border-strong)'}`,
                background: isChecked ? 'var(--success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
                {isChecked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>

              {/* Label */}
              <span style={{
                flex: 1, fontSize: 13, fontWeight: isChecked ? 500 : 600,
                color: isChecked ? 'var(--success-fg)' : 'var(--text-1)',
                lineHeight: 1.5,
                textDecoration: isChecked ? 'line-through' : 'none',
                textDecorationColor: 'var(--success)',
                transition: 'color 0.15s',
              }}>
                {label}
              </span>

              {/* Ask button — only when unchecked + onAsk provided */}
              {!isChecked && onAsk && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    onAsk(isAr
                      ? `كيف أحصل على: ${ar}؟ وما هي الجهة المختصة وكم تكلّف؟`
                      : `How do I get: ${en}? Which authority issues it and how much does it cost?`)
                  }}
                  aria-label={isAr ? `اسأل عن ${ar}` : `Ask about ${en}`}
                  style={{
                    flexShrink: 0, height: 24, padding: '0 8px', borderRadius: 6,
                    border: '1.5px solid var(--border)', background: 'transparent',
                    color: 'var(--text-3)', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 3,
                    transition: 'border-color 0.13s, color 0.13s',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget as HTMLButtonElement
                    t.style.borderColor = 'var(--brand)'; t.style.color = 'var(--brand)'
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget as HTMLButtonElement
                    t.style.borderColor = 'var(--border)'; t.style.color = 'var(--text-3)'
                  }}
                >
                  <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                  </svg>
                  {isAr ? 'كيف؟' : 'How?'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Ready CTA ── */}
      {ready && (
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--success-fg)', marginBottom: 2 }}>
              {isAr ? 'ممتاز! أنت جاهز تماماً.' : 'Excellent! You\'re fully prepared.'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--success-fg)', opacity: 0.8 }}>
              {isAr
                ? 'يمكنك الذهاب للجهة المختصة بكل ثقة.'
                : 'You can visit the relevant authority with full confidence.'}
            </div>
          </div>
        </div>
      )}

      {/* ── Hint when nothing checked ── */}
      {done === 0 && !compact && (
        <p style={{ fontSize: 11.5, color: 'var(--text-4)', margin: '10px 0 0', textAlign: 'center' }}>
          {isAr
            ? '💡 اضغط على كل وثيقة عندما تجهّزها — تُحفظ تلقائياً'
            : '💡 Tap each document when you have it — saved automatically'}
        </p>
      )}
    </div>
  )
}
