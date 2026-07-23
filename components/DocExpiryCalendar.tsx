'use client'

/**
 * DocExpiryCalendar — compact document expiry status overview.
 *
 * Reads `dalilak_doc_expiry` from localStorage (set by DocExpiryBanner).
 * Shows all documents with set expiry dates, sorted by urgency.
 *   🔴 Expired (days < 0)
 *   🟠 Critical — within 30 days
 *   🟡 Warning  — within 90 days
 *   🟢 OK       — more than 90 days
 *
 * Hidden when no dates have been set.
 * Collapsible, max 5 items shown by default.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { formatDate } from '@/lib/useDateDisplay'

const LS_KEY = 'dalilak_doc_expiry'

interface DocDef {
  id: string
  labelAr: string
  labelEn: string
  icon: string
}

const DOC_DEFS: DocDef[] = [
  { id: 'passport',    labelAr: 'جواز السفر',       labelEn: 'Passport',           icon: '📘' },
  { id: 'national_id', labelAr: 'الهوية الوطنية',   labelEn: 'National ID',        icon: '🪪' },
  { id: 'driving',     labelAr: 'رخصة القيادة',     labelEn: 'Driving License',    icon: '🚗' },
  { id: 'residence',   labelAr: 'تصريح الإقامة',    labelEn: 'Residence Permit',   icon: '🏠' },
  { id: 'work',        labelAr: 'تصريح العمل',      labelEn: 'Work Permit',        icon: '💼' },
]

interface DocStatus {
  def: DocDef
  dateStr: string
  days: number | null
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr); exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp.getTime() - now.getTime()) / 86_400_000)
}

function urgencyColor(days: number | null): string {
  if (days === null) return '#9ca3af'
  if (days < 0)   return '#ef4444'
  if (days < 30)  return '#f97316'
  if (days < 90)  return '#eab308'
  return '#10b981'
}

function urgencyBg(days: number | null): string {
  if (days === null) return 'transparent'
  if (days < 0)  return '#FEF2F2'
  if (days < 30) return '#FFF7ED'
  if (days < 90) return '#FEFCE8'
  return '#ECFDF5'
}

function urgencyLabel(days: number | null, isAr: boolean): string {
  if (days === null) return ''
  if (days < 0)   return isAr ? 'منتهية الصلاحية' : 'Expired'
  if (days < 30)  return isAr ? `${days} يوم متبقٍ` : `${days} days left`
  if (days < 90)  return isAr ? `${days} يوماً` : `${days} days`
  return isAr ? `${days} يوماً` : `${days} days`
}

interface Props {
  onAsk?: (q: string) => void
}

export default function DocExpiryCalendar({ onAsk }: Props) {
  const { isAr, lang } = useLanguage()
  const [docs, setDocs] = useState<DocStatus[]>([])
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function load() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) { setDocs([]); return }
        const parsed: Record<string, string> = JSON.parse(raw)
        const statuses: DocStatus[] = DOC_DEFS
          .map(def => ({
            def,
            dateStr: parsed[def.id] ?? '',
            days: daysUntil(parsed[def.id] ?? ''),
          }))
          .filter(d => d.dateStr !== '')
          .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
        setDocs(statuses)
      } catch {
        setDocs([])
      }
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  if (!mounted || docs.length === 0) return null

  const visible = expanded ? docs : docs.slice(0, 4)
  const expired  = docs.filter(d => d.days !== null && d.days < 0).length
  const critical = docs.filter(d => d.days !== null && d.days >= 0 && d.days < 30).length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#fff',
        border: '1px solid #E6E2DC',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '10px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
          borderBottom: open ? '1px solid #E6E2DC' : 'none',
        }}
      >
        <span style={{ fontSize: 17 }}>📅</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#191713' }}>
            {isAr ? 'صلاحية وثائقي' : 'My Document Expiry'}
          </div>
          {(expired > 0 || critical > 0) && (
            <div style={{ fontSize: 10.5, color: expired > 0 ? '#ef4444' : '#f97316', fontWeight: 600 }}>
              {expired > 0
                ? (isAr ? `${expired} وثيقة منتهية الصلاحية` : `${expired} expired`)
                : (isAr ? `${critical} وثيقة تنتهي قريباً` : `${critical} expiring soon`)
              }
            </div>
          )}
        </div>
        <span style={{ color: '#9ca3af', fontSize: 12, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {/* Content */}
      {open && (
        <div style={{ padding: '8px 0' }}>
          {visible.map(({ def, dateStr, days }) => {
            const color = urgencyColor(days)
            const bg    = urgencyBg(days)
            const label = urgencyLabel(days, isAr)

            return (
              <div
                key={def.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px',
                  background: days !== null && days < 30 ? bg : 'transparent',
                  borderBottom: '1px solid transparent',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{def.icon}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191713' }}>
                    {isAr ? def.labelAr : def.labelEn}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 1 }}>
                    {formatDate(new Date(dateStr), lang, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAr ? 'flex-start' : 'flex-end', gap: 3 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color,
                    background: bg, borderRadius: 5,
                    padding: '2px 7px',
                    border: `1px solid ${color}30`,
                  }}>
                    {days !== null && days < 0 ? '❌' : days !== null && days < 30 ? '⚠️' : '✅'} {label}
                  </span>
                  {days !== null && days < 90 && onAsk && (
                    <button
                      type="button"
                      onClick={() => onAsk(isAr
                        ? `كيف أجدد ${def.labelAr}؟`
                        : `How do I renew my ${def.labelEn}?`
                      )}
                      style={{
                        fontSize: 9, fontWeight: 700, color: '#8F1D2C',
                        background: 'rgba(143,29,44,0.07)',
                        border: '1px solid rgba(143,29,44,0.15)',
                        borderRadius: 5, padding: '2px 6px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {isAr ? 'كيف أجدد؟' : 'How to renew?'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Show more */}
          {docs.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              style={{
                display: 'block', width: '100%', padding: '7px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: '#8F1D2C', fontWeight: 700, fontFamily: 'inherit',
              }}
            >
              {expanded
                ? (isAr ? 'عرض أقل ▲' : 'Show less ▲')
                : (isAr ? `عرض ${docs.length - 4} أخرى ▼` : `Show ${docs.length - 4} more ▼`)
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}
