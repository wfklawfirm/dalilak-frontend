'use client'

/**
 * NotificationBell — badge in TopNav showing count of:
 *  • Documents expiring within 30 days (from dalilak_doc_expiry_{code}_{i},
 *    written by ProcedureDocumentStatus.tsx)
 *  • Appointments within 3 days (from dalilak_appointments)
 *  • Due/overdue reminders (from dalilak_reminders, written by
 *    ProcedureRemindMeLater.tsx / ProcedureReminderBell.tsx — see below)
 *
 * Reads localStorage directly so it works without prop drilling.
 * Listens to `dalilak_saved_change` + storage events to stay in sync.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { getReminders, dismissReminderById } from '@/components/SmartReminder'

// ── Types mirroring AppointmentTracker ───────────────────────────────────────

interface Appointment {
  id: string; titleAr: string; titleEn: string
  location: string; date: string; time?: string
  noteAr?: string; noteEn?: string; createdAt: number
}

// Per-document expiry keys are written by ProcedureDocumentStatus.tsx as
// dalilak_doc_expiry_{code}_{docIndex} -> plain 'YYYY-MM-DD' strings (one
// key per tracked document), NOT a single flat 'dalilak_doc_expiry' JSON
// object. This used to read that flat key, but its only producer,
// DocExpiryBanner.tsx, has zero imports/JSX usage anywhere in the app —
// so no live component ever wrote it, and document-expiry alerts could
// never fire regardless of how urgent a real tracked document was.
const DOC_LS_PREFIX = 'dalilak_doc_expiry_'
const APPT_LS_KEY = 'dalilak_appointments'
const WARN_DAYS   = 30
const APPT_DAYS   = 3

// Reminders written to dalilak_reminders by ProcedureRemindMeLater.tsx /
// ProcedureReminderBell.tsx (both live, on /procedures) share this store
// with SmartReminder.tsx's exported getReminders(). SmartReminder's own
// default-exported component (the only place that used to render "due
// today / overdue" banners for this data) is not mounted anywhere live —
// it was intentionally kept as dead UI when the homepage widget stack was
// decluttered (see UX_AUDIT.md) — so without reading it here, reminders
// set via either live writer were saved but never surfaced again.

// batch #498: was `new Date(); now.setHours(0,0,0,0)` -- the device's LOCAL
// timezone midnight, not Beirut's. For a Lebanese-diaspora user on a non-
// Beirut device clock (a real audience for this app, see
// ProcedureVersionTag.tsx), this produced a different day-count than
// ProcedureDocumentStatus.tsx's getStatus() (already fixed in batch #494 to
// anchor on Asia/Beirut) even though both read the identical
// dalilak_doc_expiry_{code}_{i} localStorage keys -- the exact contradiction
// ProcedureDocumentStatus.tsx's own comment warned about but didn't
// propagate here. Also brings this in line with the Beirut-anchored `today`
// already used a few lines below (line ~127) for reminder due-filtering,
// which was itself inconsistently paired with this device-local daysUntil()
// for the displayed day count.
function daysUntil(dateStr: string): number {
  const todayLb = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - new Date(todayLb + 'T00:00:00').getTime()) / 86_400_000)
}

// Arabic number-agreement for "يوم" (day): 1 → مفرد, 2 → مثنى, 3-10 → جمع, 11+ → تمييز مفرد منصوب
function arDays(n: number): string {
  if (n === 1) return 'يوم واحد'
  if (n === 2) return 'يومين'
  if (n >= 3 && n <= 10) return `${n} أيام`
  return `${n} يوماً`
}

interface NotiItem {
  id: string
  icon: string
  labelAr: string
  labelEn: string
  days: number
  type: 'doc' | 'appt' | 'reminder'
  promptAr: string
  promptEn: string
  // batch #501: raw dalilak_reminders entry id (undoing the `rem_` prefix
  // used for `id` above), needed so a dismiss button can call
  // dismissReminderById() -- see loadItems()'s reminder push below and the
  // dismiss button added in the item render.
  rawId?: string
}

function loadItems(): NotiItem[] {
  if (typeof window === 'undefined') return []
  const items: NotiItem[] = []

  // Docs — scan the real per-procedure/per-doc keys (see DOC_LS_PREFIX
  // comment above) and resolve the human-readable doc name from the same
  // ENRICHED_PROCEDURES dataset ProcedureDocumentStatus's `docs` prop is
  // built from, so index i lines up with the actual document list.
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(DOC_LS_PREFIX)) continue
      const m = key.slice(DOC_LS_PREFIX.length).match(/^(.+)_(\d+)$/)
      if (!m) continue
      const [, code, idxStr] = m
      const idx = parseInt(idxStr, 10)
      const dateStr = localStorage.getItem(key)
      if (!dateStr) continue
      const days = daysUntil(dateStr)
      if (days < 0 || days > WARN_DAYS) continue
      const proc = ENRICHED_PROCEDURES.find(p => p.code === code)
      const ar = proc?.requiredDocuments?.[idx]
      if (!proc || !ar) continue
      const en = proc.requiredDocuments_en?.[idx] || ar
      items.push({
        id: `doc_${key}`, icon: '📄', labelAr: ar, labelEn: en, days, type: 'doc',
        promptAr: `كيف أجدد ${ar}؟ تنتهي صلاحيته خلال ${arDays(days)}.`,
        promptEn: `How do I renew my ${en}? It expires in ${days} day(s).`,
      })
    }
  } catch { /* ignore */ }

  // Appointments
  try {
    const raw = localStorage.getItem(APPT_LS_KEY)
    if (raw) {
      const appts = JSON.parse(raw) as Appointment[]
      appts.forEach(a => {
        const days = daysUntil(a.date)
        if (days >= 0 && days <= APPT_DAYS) {
          items.push({
            id: a.id, icon: '📅', labelAr: a.titleAr, labelEn: a.titleEn, days, type: 'appt',
            promptAr: `ما هي المستندات والمتطلبات لـ«${a.titleAr}»؟ الموعد بعد ${arDays(days)}.`,
            promptEn: `What do I need for "${a.titleEn}"? The appointment is in ${days} day(s).`,
          })
        }
      })
    }
  } catch { /* ignore */ }

  // Reminders — same due/overdue definition SmartReminder.tsx uses
  // (date <= today, not dismissed): date <= today.
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
    getReminders().forEach(r => {
      if (r.dismissed || r.date > today) return
      const days = daysUntil(r.date)
      items.push({
        id: `rem_${r.id}`, icon: '🔔', labelAr: r.title, labelEn: r.title, days, type: 'reminder',
        promptAr: `ذكّرتني بـ: ${r.title}. ماذا يجب أن أفعل الآن؟`,
        promptEn: `You reminded me about: ${r.title}. What should I do now?`,
        rawId: r.id,
      })
    })
  } catch { /* ignore */ }

  return items.sort((a, b) => a.days - b.days)
}

interface Props {
  onAsk?: (q: string) => void
}

export default function NotificationBell({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [items, setItems] = useState<NotiItem[]>([])
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const bellBtnRef = useRef<HTMLButtonElement>(null)

  const reload = useCallback(() => setItems(loadItems()), [])

  useEffect(() => {
    setMounted(true)
    reload()
    window.addEventListener('dalilak_saved_change', reload)
    window.addEventListener('storage', reload)
    const t = setInterval(reload, 60_000)
    return () => {
      window.removeEventListener('dalilak_saved_change', reload)
      window.removeEventListener('storage', reload)
      clearInterval(t)
    }
  }, [reload])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape — every other modal/sheet in the app supports this
  // (batch #344), this dropdown was missed. Also returns focus to the bell
  // button so keyboard users don't lose their place after dismissing.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); bellBtnRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!mounted || items.length === 0) return null

  const hasUrgent = items.some(i => i.days <= 3)
  const count = items.length

  function urgencyColor(days: number) {
    if (days === 0) return '#DC2626'
    if (days <= 3)  return '#F97316'
    if (days <= 7)  return '#F59E0B'
    return '#6366F1'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        ref={bellBtnRef}
        type="button"
        aria-label={isAr ? `${count} تنبيه` : `${count} notification${count > 1 ? 's' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          width: 34, height: 34, borderRadius: 9,
          background: 'transparent', border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-2)',
          transition: 'border-color 0.13s, background 0.13s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {/* Badge */}
        <span style={{
          position: 'absolute', top: -4, right: isAr ? 'auto' : -4, left: isAr ? -4 : 'auto',
          minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
          background: hasUrgent ? '#DC2626' : '#F59E0B',
          color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: '16px',
          textAlign: 'center',
          animation: hasUrgent ? 'pulse 2s infinite' : 'none',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            top: 40, [isAr ? 'left' : 'right']: 0,
            // clamp instead of a fixed 300px — the bell sits close to the screen
            // edge on mobile, so a fixed width could overflow off-screen there.
            width: 'min(300px, calc(100vw - 24px))', zIndex: 1000,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)' }}>
              {isAr ? '🔔 تنبيهاتك' : '🔔 Notifications'}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={isAr ? 'إغلاق قائمة التنبيهات' : 'Close notifications panel'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, fontSize: 14 }}
            >×</button>
          </div>

          {/* Items */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {items.map(item => {
              const color = urgencyColor(item.days)
              const dayLabel = item.days === 0
                ? (isAr ? 'اليوم' : 'Today')
                : isAr ? `خلال ${arDays(item.days)}` : `in ${item.days} day${item.days > 1 ? 's' : ''}`
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', width: '100%', alignItems: 'stretch',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onAsk) onAsk(isAr ? item.promptAr : item.promptEn)
                      setOpen(false)
                    }}
                    style={{
                      display: 'flex', flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 10,
                      padding: '10px 14px', background: 'transparent', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{
                      flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                      background: `${color}18`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 14,
                    }}>
                      {item.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>
                        {isAr ? item.labelAr : item.labelEn}
                      </div>
                      <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>
                        {item.type === 'doc'
                          ? (isAr ? `تنتهي الصلاحية ${dayLabel}` : `Expires ${dayLabel}`)
                          : item.type === 'appt'
                          ? (isAr ? `موعد ${dayLabel}` : `Appointment ${dayLabel}`)
                          : (item.days < 0
                            ? (isAr ? `تذكير متأخر — ${arDays(-item.days)}` : `Overdue reminder — ${-item.days} day(s)`)
                            : (isAr ? 'تذكير اليوم' : 'Reminder — today'))}
                      </div>
                      {onAsk && (
                        <div style={{ fontSize: 10.5, color: 'var(--brand)', marginTop: 3, fontWeight: 600 }}>
                          {isAr ? 'اضغط لاسأل دليلك ←' : 'Tap to ask Dalilak →'}
                        </div>
                      )}
                    </div>
                  </button>
                  {/* batch #501: reminders added via ProcedureReminderBell.tsx had
                      no dismiss control anywhere in the live app -- once due, they
                      stayed in this dropdown forever, re-appearing daily with no
                      way to clear them short of wiping localStorage. Doc-expiry
                      and appointment items already have a resolution path
                      elsewhere (editing/clearing the expiry date, or the
                      appointment feature itself), so only the reminder type gets
                      a direct dismiss button here. */}
                  {item.type === 'reminder' && item.rawId && (
                    <button
                      type="button"
                      onClick={() => { dismissReminderById(item.rawId!); reload() }}
                      aria-label={isAr ? 'إخفاء هذا التذكير' : 'Dismiss this reminder'}
                      title={isAr ? 'إخفاء' : 'Dismiss'}
                      style={{
                        flexShrink: 0, width: 34, minHeight: 44,
                        background: 'transparent', border: 'none',
                        borderInlineStart: '1px solid var(--border)',
                        color: 'var(--text-3)', cursor: 'pointer', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-muted)'; e.currentTarget.style.color = '#DC2626' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)' }}
                    >✕</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
