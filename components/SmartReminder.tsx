'use client'

/**
 * SmartReminder — set and display named date-based reminders.
 *
 * LS key: dalilak_reminders = JSON array of ReminderEntry
 *
 * On homepage:
 *   - Shows "due today / overdue" banners for any matching reminders
 *   - Collapsed form to add a new reminder (title + date)
 *   - Max 10 reminders stored
 *
 * Reminders are dismissed per-entry (not globally).
 * Fires dalilak_saved_change on add/delete.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export interface ReminderEntry {
  id: string
  title: string
  date: string       // YYYY-MM-DD in Lebanon time
  dismissed: boolean
  createdAt: string
}

export function getReminders(): ReminderEntry[] {
  try { return JSON.parse(localStorage.getItem('dalilak_reminders') || '[]') } catch { return [] }
}

function saveReminders(list: ReminderEntry[]) {
  try {
    localStorage.setItem('dalilak_reminders', JSON.stringify(list))
    window.dispatchEvent(new Event('dalilak_saved_change'))
  } catch {}
}

function getTodayLb(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' }) // YYYY-MM-DD
}

export default function SmartReminder() {
  const { isAr } = useLanguage()
  const [mounted, setMounted]     = useState(false)
  const [reminders, setReminders] = useState<ReminderEntry[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [title, setTitle]         = useState('')
  const [date, setDate]           = useState('')
  const [showAll, setShowAll]     = useState(false)

  const refresh = useCallback(() => setReminders(getReminders()), [])

  useEffect(() => {
    setMounted(true)
    refresh()
    const today = getTodayLb()
    setDate(today)
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted) return null

  const today = getTodayLb()

  // Due reminders (not dismissed, date <= today)
  const due = reminders.filter(r => !r.dismissed && r.date <= today)
  const upcoming = reminders.filter(r => !r.dismissed && r.date > today).slice(0, 3)

  function handleAdd() {
    if (!title.trim() || !date) return
    const entry: ReminderEntry = {
      id: `rem_${Date.now()}`,
      title: title.trim().slice(0, 80),
      date,
      dismissed: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [entry, ...getReminders()].slice(0, 10)
    saveReminders(updated)
    refresh()
    setTitle('')
    setDate(today)
    setShowForm(false)
  }

  function dismiss(id: string) {
    const updated = getReminders().map(r => r.id === id ? { ...r, dismissed: true } : r)
    saveReminders(updated)
    refresh()
  }

  function deleteReminder(id: string) {
    const updated = getReminders().filter(r => r.id !== id)
    saveReminders(updated)
    refresh()
  }

  function formatDate(d: string): string {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
        day: 'numeric', month: 'short', weekday: 'short',
      })
    } catch { return d }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 10 }}>
      {/* Due banners */}
      {due.map(r => {
        const isOverdue = r.date < today
        const bg     = isOverdue ? '#FEF2F2' : '#FFFBEB'
        const border = isOverdue ? '#FECACA' : '#FDE68A'
        const color  = isOverdue ? '#991B1B' : '#92400E'
        return (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 10, marginBottom: 6,
            background: bg, border: `1.5px solid ${border}`,
            animation: 'fadeUp 0.2s ease both',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{isOverdue ? '⚠️' : '🔔'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color, lineHeight: 1.3 }}>{r.title}</div>
              <div style={{ fontSize: 10, color, marginTop: 1, opacity: 0.75 }}>
                {isOverdue
                  ? (isAr ? `متأخر — ${formatDate(r.date)}` : `Overdue — ${formatDate(r.date)}`)
                  : (isAr ? 'موعد اليوم' : 'Due today')}
              </div>
            </div>
            <button type="button" onClick={() => dismiss(r.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 18, padding: 0 }}>
              ✓
            </button>
            <button type="button" onClick={() => deleteReminder(r.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 13, opacity: 0.6, padding: 0 }}>
              ✕
            </button>
          </div>
        )
      })}

      {/* Upcoming + Add button strip */}
      <div style={{
        background: '#FAFAF8', border: '1px solid #E6E2DC', borderRadius: 12,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px' }}>
          <span style={{ fontSize: 15 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#191713' }}>
              {isAr ? 'التذكيرات' : 'Reminders'}
            </div>
            {upcoming.length > 0 && (
              <div style={{ fontSize: 9.5, color: '#918B82' }}>
                {isAr ? `${upcoming.length} تذكير قادم` : `${upcoming.length} upcoming`}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setShowAll(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918B82', fontSize: 13 }}>
            {showAll ? '▲' : `▼`}
          </button>
          <button type="button" onClick={() => setShowForm(v => !v)}
            style={{
              background: '#8F1D2C', border: 'none', borderRadius: 8,
              color: '#fff', fontSize: 10.5, fontWeight: 700,
              padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {isAr ? '+ تذكير' : '+ Add'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{ borderTop: '1px solid #E6E2DC', padding: '10px 12px', background: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={isAr ? 'عنوان التذكير...' : 'Reminder title...'}
                dir={isAr ? 'rtl' : 'ltr'}
                maxLength={80}
                style={{
                  border: '1px solid #E6E2DC', borderRadius: 8, padding: '7px 10px',
                  fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#191713',
                  background: '#FAFAF8',
                }}
              />
              <div style={{ display: 'flex', gap: 7 }}>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    flex: 1, border: '1px solid #E6E2DC', borderRadius: 8, padding: '7px 10px',
                    fontSize: 12, fontFamily: 'inherit', outline: 'none', color: '#191713',
                    background: '#FAFAF8',
                  }}
                />
                <button type="button" onClick={handleAdd}
                  disabled={!title.trim() || !date}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    background: title.trim() && date ? '#8F1D2C' : '#E6E2DC',
                    color: title.trim() && date ? '#fff' : '#918B82',
                    fontSize: 11.5, fontWeight: 700, cursor: title.trim() && date ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                  }}>
                  {isAr ? 'حفظ' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming list */}
        {showAll && upcoming.length > 0 && (
          <div style={{ borderTop: '1px solid #E6E2DC', padding: '6px 12px 8px' }}>
            {upcoming.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 0', borderBottom: '1px solid #F0EDE8',
              }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#191713' }}>{r.title}</div>
                  <div style={{ fontSize: 9.5, color: '#918B82' }}>{formatDate(r.date)}</div>
                </div>
                <button type="button" onClick={() => deleteReminder(r.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8C2BB', fontSize: 13 }}>✕</button>
              </div>
            ))}
          </div>
        )}
        {showAll && upcoming.length === 0 && due.length === 0 && (
          <div style={{ borderTop: '1px solid #E6E2DC', padding: '10px 12px', fontSize: 11, color: '#918B82', textAlign: 'center' }}>
            {isAr ? 'لا توجد تذكيرات' : 'No reminders yet'}
          </div>
        )}
      </div>
    </div>
  )
}
