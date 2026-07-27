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

// batch #550: daysLeft was computed by parsing the stored "YYYY-MM-DD"
// deadline via `new Date(dateStr)` (interpreted as UTC midnight per spec)
// then `.setHours(0,0,0,0)` (re-anchored to the DEVICE's local midnight) —
// and comparing it against `today` computed the same locally-anchored way.
// For any device with a negative UTC offset (any North America timezone —
// a real diaspora-Lebanese audience for this app), that silently rolls the
// deadline back one calendar day: a deadline stored as "2026-07-28" and
// "today" both collapse onto the same local date a day early, showing
// "Today!"/urgent-red styling roughly a day before the real Beirut-relative
// deadline, or understating urgency depending on time of day — risking a
// missed real government deadline. Fixed by comparing pure calendar dates
// (Date.UTC anchors, no local-timezone re-interpretation at all) instead of
// timezone-sensitive Date object arithmetic.
function daysBetweenDateStrings(fromStr: string, toStr: string): number {
  const [fy, fm, fd] = fromStr.split('-').map(Number)
  const [ty, tm, td] = toStr.split('-').map(Number)
  const from = Date.UTC(fy, (fm || 1) - 1, fd || 1)
  const to = Date.UTC(ty, (tm || 1) - 1, td || 1)
  return Math.round((to - from) / 86_400_000)
}

function scanDeadlines(): DeadlineItem[] {
  const items: DeadlineItem[] = []
  const todayStr = new Date().toISOString().slice(0, 10)
  // Snooze lookup key must use the same "local date, then ISO-stringify the
  // current instant" technique as snooze() below (new Date().toISOString()),
  // NOT today.toISOString() — today has been rolled back to local midnight
  // via setHours(0,0,0,0), and converting THAT instant to a UTC ISO string
  // rolls it back into the previous UTC calendar day for any positive-UTC
  // timezone (Lebanon is UTC+2/+3). Since this is a Lebanon-only app, that
  // mismatch previously happened for essentially the entire day (all but a
  // ~2-3h window right after local midnight): a user tapping "Snooze 1 day"
  // wrote key `..._{today}` but the very next scan looked up
  // `..._{yesterday}`, found nothing, and the alert reappeared immediately —
  // the snooze button was effectively non-functional for the whole user base.
  const snoozeToday = new Date().toISOString().slice(0,10)

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(LS_DEADLINE_PREFIX)) continue
      const code = key.slice(LS_DEADLINE_PREFIX.length)
      const dateStr = localStorage.getItem(key)
      if (!dateStr) continue

      // Check snooze
      if (localStorage.getItem(LS_SNOOZE_PREFIX + code + '_' + snoozeToday)) continue

      const daysLeft = daysBetweenDateStrings(todayStr, dateStr)

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
        // Only daysLeft values 2-7 ever reach the final branch below (the
        // scan filters out daysLeft > 7 at scanDeadlines(), and 0/1 are
        // special-cased above). Of those, "N أيام" (plural) is correct
        // Arabic for 3-7, but wrong for 2 — Arabic requires the dual form
        // "يومان متبقيان", not "2 أيام".
        const daysLabel = item.daysLeft < 0
          ? (isAr ? 'تأخر الموعد' : 'Past deadline')
          : item.daysLeft === 0
            ? (isAr ? 'اليوم!' : 'Today!')
            : item.daysLeft === 1
              ? (isAr ? 'غداً!' : 'Tomorrow!')
              : item.daysLeft === 2
                ? (isAr ? 'يومان متبقيان' : '2 days left')
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
