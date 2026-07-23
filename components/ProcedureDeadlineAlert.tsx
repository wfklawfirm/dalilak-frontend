'use client'

/**
 * ProcedureDeadlineAlert — deadline reminder banner for time-sensitive procedures.
 *
 * Users can set a personal deadline for any procedure.
 * This component scans localStorage for deadline keys and shows a sticky
 * alert banner on /procedures when any deadline is within 7 days.
 *
 * localStorage key format: dalilak_proc_deadline_{code}
 * Value: ISO date string "YYYY-MM-DD"
 *
 * Features:
 *   - Red if deadline is today or past
 *   - Amber if deadline within 3 days
 *   - Yellow if deadline within 7 days
 *   - Dismissable (per alert, per day — snooze key dalilak_deadline_snoozed_{code}_{date})
 *   - "Go to procedure" button scrolls to procedure card
 *   - "Set deadline" utility: exported function setDeadline(code, date)
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { formatDate } from '@/lib/useDateDisplay'

const LS_DEADLINE_PREFIX = 'dalilak_proc_deadline_'
const LS_SNOOZE_PREFIX   = 'dalilak_deadline_snoozed_'

export function setDeadline(code: string, dateIso: string) {
  try { localStorage.setItem(LS_DEADLINE_PREFIX + code, dateIso) } catch {}
  window.dispatchEvent(new Event('dalilak_deadline_change'))
}

export function clearDeadline(code: string) {
  try { localStorage.removeItem(LS_DEADLINE_PREFIX + code) } catch {}
  window.dispatchEvent(new Event('dalilak_deadline_change'))
}

interface DeadlineItem {
  code: string
  titleAr: string
  titleEn: string
  dateStr: string
  daysLeft: number
}

function scanDeadlines(): DeadlineItem[] {
  const items: DeadlineItem[] = []
  const today = new Date(); today.setHours(0,0,0,0)
  const snoozeToday = today.toISOString().slice(0,10)

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(LS_DEADLINE_PREFIX)) continue
      const code = key.slice(LS_DEADLINE_PREFIX.length)
      const dateStr = localStorage.getItem(key)
      if (!dateStr) continue

      // Check snooze
      if (localStorage.getItem(LS_SNOOZE_PREFIX + code + '_' + snoozeToday)) continue

      const deadline = new Date(dateStr); deadline.setHours(0,0,0,0)
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000)

      if (daysLeft > 7) continue // Only show if within 7 days

      const proc = ENRICHED_PROCEDURES.find(p => p.code === code)
      if (!proc) continue

      items.push({
        code,
        titleAr: proc.title,
        titleEn: proc.title_en || proc.title,
        dateStr,
        daysLeft,
      })
    }
  } catch {}

  return items.sort((a, b) => a.daysLeft - b.daysLeft)
}

function alertColor(days: number): { bg: string; border: string; text: string; icon: string } {
  if (days <= 0) return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '🚨' }
  if (days <= 3) return { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E', icon: '⚠️' }
  return          { bg: '#FEFCE8', border: '#FDE68A', text: '#78350F', icon: '⏰' }
}

interface Props {
  onGoTo?: (code: string) => void
}

export default function ProcedureDeadlineAlert({ onGoTo }: Props) {
  const { isAr, lang } = useLanguage()
  const [items, setItems] = useState<DeadlineItem[]>([])
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    setItems(scanDeadlines())
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('dalilak_deadline_change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_deadline_change', refresh)
    }
  }, [refresh])

  function snooze(code: string) {
    const today = new Date().toISOString().slice(0,10)
    try { localStorage.setItem(LS_SNOOZE_PREFIX + code + '_' + today, '1') } catch {}
    refresh()
  }

  if (!mounted || items.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}
    >
      {items.map(item => {
        const { bg, border, text, icon } = alertColor(item.daysLeft)
        const dateLabel = formatDate(new Date(item.dateStr), lang, { month: 'short', day: 'numeric' })
        const daysLabel = item.daysLeft < 0
          ? (isAr ? 'تأخر الموعد' : 'Past deadline')
          : item.daysLeft === 0
            ? (isAr ? 'اليوم!' : 'Today!')
            : item.daysLeft === 1
              ? (isAr ? 'غداً!' : 'Tomorrow!')
              : (isAr ? `${item.daysLeft} أيام متبقية` : `${item.daysLeft} days left`)

        return (
          <div
            key={item.code}
            role="alert"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 14px',
              background: bg, border: `1px solid ${border}`, borderRadius: 12,
              animation: 'fadeUp 0.2s ease both',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{icon}</span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: text, marginBottom: 2 }}>
                {isAr ? item.titleAr : item.titleEn}
              </div>
              <div style={{ fontSize: 11, color: text, opacity: 0.85 }}>
                {isAr ? `الموعد النهائي: ${dateLabel} — ${daysLabel}` : `Deadline: ${dateLabel} — ${daysLabel}`}
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                {onGoTo && (
                  <button
                    type="button"
                    onClick={() => onGoTo(item.code)}
                    style={{
                      padding: '4px 10px', borderRadius: 7,
                      background: text, color: '#fff', border: 'none',
                      fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {isAr ? 'انتقل إلى المعاملة' : 'Go to procedure'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => snooze(item.code)}
                  style={{
                    padding: '4px 10px', borderRadius: 7,
                    background: 'rgba(255,255,255,0.7)', color: text,
                    border: `1px solid ${border}`, fontSize: 10.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'تأجيل ليوم واحد' : 'Snooze 1 day'}
                </button>
                <button
                  type="button"
                  onClick={() => clearDeadline(item.code)}
                  style={{
                    padding: '4px 10px', borderRadius: 7,
                    background: 'none', color: text, opacity: 0.7,
                    border: 'none', fontSize: 10.5, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'حذف الموعد' : 'Remove deadline'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
