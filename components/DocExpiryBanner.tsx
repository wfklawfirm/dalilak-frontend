'use client'

/**
 * DocExpiryBanner — تنبيهات انتهاء صلاحية وثائق المستخدم
 *
 * Stores document expiry dates in localStorage under `dalilak_doc_expiry`.
 * Shows a banner when any document expires within `WARN_DAYS` (90 days).
 * User can expand to manage dates, or dismiss the banner for 3 days.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_KEY   = 'dalilak_doc_expiry'
const SNOOZE_KEY = 'dalilak_expiry_snoozed_until'
const WARN_DAYS = 90

interface DocEntry {
  id: string
  labelAr: string
  labelEn: string
  icon: string
  expiryDate: string  // ISO date string YYYY-MM-DD, empty = not set
}

const DEFAULT_DOCS: DocEntry[] = [
  { id: 'passport',  labelAr: 'جواز السفر',       labelEn: 'Passport',          icon: '📘', expiryDate: '' },
  { id: 'national_id', labelAr: 'الهوية الوطنية',   labelEn: 'National ID',       icon: '🪪', expiryDate: '' },
  { id: 'driving',   labelAr: 'رخصة القيادة',      labelEn: 'Driving License',   icon: '🚗', expiryDate: '' },
  { id: 'residence', labelAr: 'تصريح الإقامة',     labelEn: 'Residence Permit',  icon: '🏠', expiryDate: '' },
  { id: 'work',      labelAr: 'تصريح العمل',       labelEn: 'Work Permit',       icon: '💼', expiryDate: '' },
]

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr); exp.setHours(0, 0, 0, 0)
  return Math.round((exp.getTime() - now.getTime()) / 86_400_000)
}

function urgencyColor(days: number) {
  if (days < 0)   return { bg: '#FEE2E2', border: '#FCA5A5', text: '#B91C1C', badge: '#DC2626' }
  if (days < 30)  return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', badge: '#D97706' }
  return             { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', badge: '#EA580C' }
}

interface Props {
  /** Called to open AI chat with a renewal question */
  onAsk?: (q: string) => void
}

export default function DocExpiryBanner({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [docs, setDocs] = useState<DocEntry[]>(DEFAULT_DOCS)
  const [expanded, setExpanded] = useState(false)
  const [snoozed, setSnoozed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed: Record<string, string> = JSON.parse(saved)
        setDocs(prev => prev.map(d => ({ ...d, expiryDate: parsed[d.id] ?? '' })))
      }
    } catch { /* ignore */ }

    // Check snooze
    try {
      const until = localStorage.getItem(SNOOZE_KEY)
      if (until && new Date(until) > new Date()) setSnoozed(true)
    } catch { /* ignore */ }
  }, [])

  const save = useCallback((updated: DocEntry[]) => {
    setDocs(updated)
    try {
      const map: Record<string, string> = {}
      updated.forEach(d => { map[d.id] = d.expiryDate })
      localStorage.setItem(LS_KEY, JSON.stringify(map))
    } catch { /* ignore */ }
  }, [])

  const handleDateChange = (id: string, value: string) => {
    save(docs.map(d => d.id === id ? { ...d, expiryDate: value } : d))
  }

  const snooze = () => {
    const until = new Date()
    until.setDate(until.getDate() + 3)
    try { localStorage.setItem(SNOOZE_KEY, until.toISOString()) } catch { /* ignore */ }
    setSnoozed(true)
  }

  // Which docs are expiring soon?
  const expiring = docs.filter(d => {
    const days = daysUntil(d.expiryDate)
    return days !== null && days <= WARN_DAYS
  }).sort((a, b) => (daysUntil(a.expiryDate) ?? 999) - (daysUntil(b.expiryDate) ?? 999))

  if (!mounted || snoozed) return null

  // No dates set at all — show a subtle setup prompt (first-time)
  const hasDates = docs.some(d => d.expiryDate !== '')
  if (!hasDates && !expanded) {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          margin: '0 auto 12px', maxWidth: 720,
          background: 'var(--surface-muted)',
          border: '1px dashed var(--border)',
          borderRadius: 12, padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          animation: 'fadeUp 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
            {isAr
              ? 'تتبّع صلاحية وثائقك — احصل على تنبيه قبل انتهائها'
              : 'Track your document expiry dates — get alerts before they expire'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-2)',
            fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {isAr ? 'إعداد' : 'Set up'}
        </button>
      </div>
    )
  }

  // Has expiring docs — show warning banner
  if (expiring.length > 0 && !expanded) {
    const worst = expiring[0]
    const days = daysUntil(worst.expiryDate)!
    const col = urgencyColor(days)
    const label = isAr ? worst.labelAr : worst.labelEn
    const daysLabel = days < 0
      ? (isAr ? `انتهت منذ ${Math.abs(days)} يوم` : `Expired ${Math.abs(days)} days ago`)
      : days === 0
      ? (isAr ? 'تنتهي اليوم!' : 'Expires today!')
      : (isAr ? `تنتهي خلال ${days} يوم` : `Expires in ${days} days`)

    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        role="alert"
        style={{
          margin: '0 auto 12px', maxWidth: 720,
          background: col.bg, border: `1px solid ${col.border}`,
          borderRadius: 12, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeUp 0.2s ease',
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{worst.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: col.text }}>
            {label} — {daysLabel}
          </span>
          {expiring.length > 1 && (
            <span style={{ fontSize: 11.5, color: col.text, opacity: 0.7, marginInlineStart: 6 }}>
              {isAr ? `+${expiring.length - 1} وثائق أخرى` : `+${expiring.length - 1} more`}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {onAsk && (
            <button
              type="button"
              onClick={() => onAsk(isAr
                ? `كيف أجدّد ${worst.labelAr}؟ ما هي الخطوات والوثائق المطلوبة والرسوم؟`
                : `How do I renew my ${worst.labelEn}? What are the steps, documents, and fees?`)}
              style={{
                padding: '5px 10px', borderRadius: 7,
                border: 'none', background: col.badge,
                color: '#fff', fontSize: 11.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isAr ? 'كيف أجدّد؟' : 'How to renew?'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={isAr ? 'إدارة الوثائق' : 'Manage documents'}
            style={{
              padding: '5px 10px', borderRadius: 7,
              border: `1px solid ${col.border}`, background: 'transparent',
              color: col.text, fontSize: 11.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isAr ? 'إدارة' : 'Manage'}
          </button>
          <button
            type="button"
            onClick={snooze}
            aria-label={isAr ? 'تذكير لاحقاً' : 'Remind me later'}
            title={isAr ? 'تذكير بعد 3 أيام' : 'Remind me in 3 days'}
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: `1px solid ${col.border}`, background: 'transparent',
              color: col.text, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // Expanded management panel
  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 12px', maxWidth: 720,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'fadeUp 0.18s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>
            {isAr ? 'متابعة انتهاء صلاحية الوثائق' : 'Document Expiry Tracker'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          style={{
            width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-3)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Document rows */}
      <div style={{ padding: '10px 0' }}>
        {docs.map(doc => {
          const days = daysUntil(doc.expiryDate)
          const col = days !== null && days <= WARN_DAYS ? urgencyColor(days) : null
          return (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 16px',
              background: col ? col.bg : 'transparent',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{doc.icon}</span>
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: col ? col.text : 'var(--text-1)',
              }}>
                {isAr ? doc.labelAr : doc.labelEn}
              </span>
              {days !== null && days <= WARN_DAYS && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, color: '#fff',
                  background: col!.badge, padding: '2px 7px', borderRadius: 20,
                  flexShrink: 0,
                }}>
                  {days < 0
                    ? (isAr ? `منتهية` : 'Expired')
                    : days === 0
                    ? (isAr ? 'اليوم' : 'Today')
                    : (isAr ? `${days}ي` : `${days}d`)}
                </span>
              )}
              <input
                type="date"
                value={doc.expiryDate}
                onChange={e => handleDateChange(doc.id, e.target.value)}
                aria-label={isAr ? `تاريخ انتهاء ${doc.labelAr}` : `${doc.labelEn} expiry date`}
                style={{
                  height: 30, padding: '0 8px', borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text-1)',
                  fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                  flexShrink: 0, minWidth: 120,
                }}
              />
              {doc.expiryDate && onAsk && days !== null && days <= WARN_DAYS && (
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false)
                    onAsk(isAr
                      ? `كيف أجدّد ${doc.labelAr}؟ ما الخطوات والوثائق والرسوم؟`
                      : `How do I renew my ${doc.labelEn}? Steps, documents, and fees?`)
                  }}
                  style={{
                    flexShrink: 0, padding: '4px 8px', borderRadius: 6,
                    border: 'none', background: col!.badge, color: '#fff',
                    fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'جدّد' : 'Renew'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div style={{ padding: '8px 16px', background: 'var(--surface-muted)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-4)', margin: 0 }}>
          {isAr
            ? '💾 التواريخ محفوظة تلقائياً على جهازك — لا ترفع للخادم'
            : '💾 Dates are saved locally on your device — never uploaded to any server'}
        </p>
      </div>
    </div>
  )
}
