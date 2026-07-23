'use client'

/**
 * RecentActivityFeed — compact vertical timeline of user's recent actions.
 * Reads from:
 *   - dalilak_saved_items (saved procedures)
 *   - dalilak_recently_viewed (recently viewed items)
 *   - dalilak_checklist_* (checklist updates)
 *   - dalilak_ratings_* (procedure ratings)
 *   - dalilak_appointments (added appointments)
 * Shows last 5 activities, relative timestamps.
 * Displayed on homepage empty state below other panels.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Activity {
  id: string
  type: 'saved' | 'viewed' | 'checklist' | 'rated' | 'appointment'
  icon: string
  titleAr: string
  titleEn: string
  ts: number           // Unix ms
  actionAr?: string
  actionEn?: string
  onAsk?: string       // pre-filled prompt for Ask button
}

const LS_SAVED   = 'dalilak_saved_items'
const LS_VIEWED  = 'dalilak_recently_viewed'
const LS_RATING_PREFIX = 'dalilak_ratings_'
const LS_CHECKLIST_PREFIX = 'dalilak_checklist_'
const LS_APPOINTMENTS = 'dalilak_appointments'

function loadActivities(): Activity[] {
  if (typeof window === 'undefined') return []
  const activities: Activity[] = []

  // Saved items
  try {
    const raw = localStorage.getItem(LS_SAVED)
    if (raw) {
      const items: Array<{
        id: string; icon?: string; titleAr?: string; titleEn?: string;
        aiPrompt?: string; savedAt: number
      }> = JSON.parse(raw)
      items.slice(0, 3).forEach(item => {
        activities.push({
          id: `saved-${item.id}-${item.savedAt}`,
          type: 'saved',
          icon: item.icon || '⭐',
          titleAr: item.titleAr || '',
          titleEn: item.titleEn || item.titleAr || '',
          ts: item.savedAt,
          actionAr: 'تم الحفظ في المفضّلة',
          actionEn: 'Saved to favorites',
          onAsk: item.aiPrompt,
        })
      })
    }
  } catch {}

  // Recently viewed
  try {
    const raw = localStorage.getItem(LS_VIEWED)
    if (raw) {
      const items: Array<{
        id: string; icon?: string; titleAr?: string; titleEn?: string;
        aiPrompt?: string; viewedAt: number
      }> = JSON.parse(raw)
      items.slice(0, 3).forEach(item => {
        activities.push({
          id: `viewed-${item.id}-${item.viewedAt}`,
          type: 'viewed',
          icon: item.icon || '👁️',
          titleAr: item.titleAr || '',
          titleEn: item.titleEn || item.titleAr || '',
          ts: item.viewedAt,
          actionAr: 'تمّت مشاهدته',
          actionEn: 'Viewed',
          onAsk: item.aiPrompt,
        })
      })
    }
  } catch {}

  // Checklist updates — scan all keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(LS_CHECKLIST_PREFIX)) continue
      const code = key.replace(LS_CHECKLIST_PREFIX, '')
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const checked: number[] = JSON.parse(raw)
      if (checked.length === 0) continue
      activities.push({
        id: `checklist-${code}`,
        type: 'checklist',
        icon: '📋',
        titleAr: code,    // will be replaced by title if available
        titleEn: code,
        ts: Date.now() - 60_000, // approximate — checklists don't store timestamps
        actionAr: `${checked.length} وثائق مكتملة`,
        actionEn: `${checked.length} docs checked`,
      })
    }
  } catch {}

  // Ratings
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(LS_RATING_PREFIX)) continue
      const code = key.replace(LS_RATING_PREFIX, '')
      const stars = localStorage.getItem(key) || '0'
      activities.push({
        id: `rated-${code}`,
        type: 'rated',
        icon: '⭐',
        titleAr: code,
        titleEn: code,
        ts: Date.now() - 120_000, // approximate
        actionAr: `قيّمت بـ ${stars} نجوم`,
        actionEn: `Rated ${stars} stars`,
      })
    }
  } catch {}

  // Appointments
  try {
    const raw = localStorage.getItem(LS_APPOINTMENTS)
    if (raw) {
      const apts: Array<{
        id: string; titleAr: string; titleEn?: string; createdAt: number; date: string
      }> = JSON.parse(raw)
      apts.slice(0, 2).forEach(apt => {
        activities.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          icon: '📅',
          titleAr: apt.titleAr,
          titleEn: apt.titleEn || apt.titleAr,
          ts: apt.createdAt,
          actionAr: `موعد: ${apt.date}`,
          actionEn: `Appointment: ${apt.date}`,
        })
      })
    }
  } catch {}

  // Sort by timestamp desc, take 5
  return activities
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5)
}

/** Relative time label in AR or EN */
function relativeTime(ts: number, isAr: boolean): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (isAr) {
    if (mins < 1) return 'الآن'
    if (mins < 60) return `منذ ${mins} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return `منذ ${Math.floor(days / 7)} أسبوع`
  } else {
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return `${Math.floor(days / 7)}w ago`
  }
}

const TYPE_COLOR: Record<Activity['type'], string> = {
  saved: '#f59e0b',
  viewed: '#3b82f6',
  checklist: '#8b5cf6',
  rated: '#f59e0b',
  appointment: '#8F1D2C',
}

interface Props {
  onAsk?: (q: string) => void
}

export default function RecentActivityFeed({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [collapsed, setCollapsed] = useState(true)

  const refresh = useCallback(() => {
    setActivities(loadActivities())
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('dalilak_recent_change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('dalilak_recent_change', refresh)
    }
  }, [refresh])

  if (activities.length === 0) return null

  const visibleActivities = collapsed ? activities.slice(0, 3) : activities

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🕐</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {isAr ? 'آخر نشاطاتي' : 'Recent Activity'}
          </span>
          <span style={{
            fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
            background: 'var(--surface-muted)', border: '1px solid var(--border)',
            color: 'var(--text-4)',
          }}>
            {activities.length}
          </span>
        </div>
        <span style={{
          fontSize: 10, color: 'var(--text-4)',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.18s', display: 'inline-block',
        }}>▾</span>
      </button>

      {/* Activity list */}
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {visibleActivities.map((act, idx) => {
            const color = TYPE_COLOR[act.type]
            const title = isAr ? act.titleAr : act.titleEn
            const actionLabel = isAr ? act.actionAr : act.actionEn
            const isLast = idx === visibleActivities.length - 1

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '9px 14px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `${color}18`, border: `1.5px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                  }}>
                    {act.icon}
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 1.5, flex: 1, minHeight: 16,
                      background: 'var(--border)', marginTop: 4,
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div style={{
                    fontSize: 11.5, fontWeight: 700, color: 'var(--text-1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 2,
                  }}>
                    {title}
                  </div>
                  {actionLabel && (
                    <div style={{ fontSize: 10.5, color, fontWeight: 600, marginBottom: 2 }}>
                      {actionLabel}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: 'var(--text-4)' }}>
                    {relativeTime(act.ts, isAr)}
                  </div>
                </div>

                {/* Ask button */}
                {onAsk && act.onAsk && (
                  <button
                    type="button"
                    onClick={() => onAsk(act.onAsk!)}
                    style={{
                      flexShrink: 0, padding: '4px 9px', borderRadius: 7,
                      background: `${color}18`, color,
                      border: `1px solid ${color}44`,
                      fontSize: 10.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      marginTop: 1,
                    }}
                  >
                    {isAr ? 'اسأل' : 'Ask'}
                  </button>
                )}
              </div>
            )
          })}

          {/* Show all toggle */}
          {activities.length > 3 && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              style={{
                width: '100%', padding: '8px 14px', background: 'none', border: 'none',
                borderTop: '1px solid var(--border)', cursor: 'pointer',
                fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)',
                fontFamily: 'inherit',
              }}
            >
              {isAr ? `عرض ${activities.length - 3} نشاطات إضافية` : `Show ${activities.length - 3} more`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
