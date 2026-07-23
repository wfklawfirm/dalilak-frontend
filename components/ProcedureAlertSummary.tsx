'use client'

/**
 * ProcedureAlertSummary — unified alert count widget.
 *
 * Scans localStorage for:
 *   - Overdue/due deadlines: dalilak_proc_deadline_{code} (date <= today, not snoozed)
 *   - Due reminders: dalilak_reminders entries where date <= today and !dismissed
 *   - Expiring docs: dalilak_expiry_{key} where date within 30 days
 *
 * Shows a red/amber banner: "X تنبيهات تحتاج انتباهك"
 * Expands to show breakdown by type.
 * Hides completely if no alerts.
 *
 * Listens to dalilak_saved_change + storage for live refresh.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { getReminders } from '@/components/SmartReminder'

interface AlertCounts {
  deadlines: number
  reminders: number
  expiringDocs: number
}

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function getIn30DaysLb(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function scanAlerts(): AlertCounts {
  const today   = getTodayLb()
  const in30    = getIn30DaysLb()
  let deadlines = 0
  let expiringDocs = 0

  try {
    for (const proc of ENRICHED_PROCEDURES) {
      const dl = localStorage.getItem(`dalilak_proc_deadline_${proc.code}`)
      if (dl && dl <= today) {
        const snoozeKey = `dalilak_deadline_snoozed_${proc.code}_${today}`
        if (!localStorage.getItem(snoozeKey)) deadlines++
      }
    }

    // Scan all keys for expiry
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ''
      if (key.startsWith('dalilak_expiry_')) {
        const val = localStorage.getItem(key) || ''
        if (val && val <= in30 && val >= today) expiringDocs++
      }
    }
  } catch {}

  // Reminders due
  const reminders = getReminders().filter(r => !r.dismissed && r.date <= today).length

  return { deadlines, reminders, expiringDocs }
}

export default function ProcedureAlertSummary() {
  const { isAr } = useLanguage()
  const [counts, setCounts] = useState<AlertCounts>({ deadlines: 0, reminders: 0, expiringDocs: 0 })
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted]   = useState(false)

  const refresh = useCallback(() => setCounts(scanAlerts()), [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted) return null

  const total = counts.deadlines + counts.reminders + counts.expiringDocs
  if (total === 0) return null

  const isUrgent = counts.deadlines > 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        borderRadius: 12, overflow: 'hidden', marginBottom: 10,
        border: `1.5px solid ${isUrgent ? '#FECACA' : '#FDE68A'}`,
        background: isUrgent ? '#FEF2F2' : '#FFFBEB',
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 13px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {/* Bell icon */}
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: isUrgent ? '#FEE2E2' : '#FEF3C7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          🔔
        </div>

        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: isUrgent ? '#991B1B' : '#92400E' }}>
            {isAr
              ? `${total} ${total === 1 ? 'تنبيه يحتاج' : 'تنبيهات تحتاج'} انتباهك`
              : `${total} alert${total !== 1 ? 's' : ''} need attention`}
          </div>
          <div style={{ fontSize: 9.5, color: isUrgent ? '#B91C1C' : '#B45309', marginTop: 1 }}>
            {isAr ? 'اضغط للتفاصيل' : 'Tap for details'}
          </div>
        </div>

        {/* Count badge */}
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: isUrgent ? '#EF4444' : '#F59E0B',
          color: '#fff', fontSize: 11, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {total}
        </div>

        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke={isUrgent ? '#991B1B' : '#92400E'} strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${isUrgent ? '#FECACA' : '#FDE68A'}`, padding: '8px 13px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {counts.deadlines > 0 && (
            <AlertRow
              icon="⏰" count={counts.deadlines} isUrgent={true}
              labelAr={`${counts.deadlines} ${counts.deadlines === 1 ? 'موعد نهائي' : 'مواعيد نهائية'} متأخرة أو اليوم`}
              labelEn={`${counts.deadlines} deadline${counts.deadlines !== 1 ? 's' : ''} overdue/due`}
              href="/procedures"
              isAr={isAr}
            />
          )}
          {counts.reminders > 0 && (
            <AlertRow
              icon="🔔" count={counts.reminders} isUrgent={false}
              labelAr={`${counts.reminders} ${counts.reminders === 1 ? 'تذكير' : 'تذكيرات'} موعده اليوم`}
              labelEn={`${counts.reminders} reminder${counts.reminders !== 1 ? 's' : ''} due today`}
              href="/"
              isAr={isAr}
            />
          )}
          {counts.expiringDocs > 0 && (
            <AlertRow
              icon="📄" count={counts.expiringDocs} isUrgent={false}
              labelAr={`${counts.expiringDocs} ${counts.expiringDocs === 1 ? 'وثيقة' : 'وثائق'} تنتهي خلال 30 يوماً`}
              labelEn={`${counts.expiringDocs} document${counts.expiringDocs !== 1 ? 's' : ''} expiring within 30 days`}
              href="/"
              isAr={isAr}
            />
          )}
        </div>
      )}
    </div>
  )
}

function AlertRow({ icon, count: _count, isUrgent, labelAr, labelEn, href, isAr }: {
  icon: string; count: number; isUrgent: boolean
  labelAr: string; labelEn: string; href: string; isAr: boolean
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 8px', borderRadius: 8,
        background: isUrgent ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: isUrgent ? '#991B1B' : '#92400E', flex: 1 }}>
        {isAr ? labelAr : labelEn}
      </span>
      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isUrgent ? '#991B1B' : '#92400E'} strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
      </svg>
    </a>
  )
}
