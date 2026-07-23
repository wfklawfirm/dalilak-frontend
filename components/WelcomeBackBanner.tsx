'use client'

/**
 * WelcomeBackBanner — personalized time-of-day greeting on homepage.
 * Shows only when the user has visited before (dalilak_onboarded or dalilak_lang_confirmed set),
 * dismissable per session via sessionStorage.
 * Reads user's first name from auth localStorage.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { getUser } from '@/lib/auth'

const SS_KEY = 'dalilak_welcome_dismissed'

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  try {
    const hour = parseInt(
      new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Beirut' }),
      10
    )
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  } catch {
    return 'morning'
  }
}

const GREETINGS: Record<string, { ar: string; en: string; emoji: string }> = {
  morning:   { ar: 'صباح الخير',    en: 'Good morning',   emoji: '🌅' },
  afternoon: { ar: 'مساء النهار',   en: 'Good afternoon', emoji: '☀️' },
  evening:   { ar: 'مساء الخير',    en: 'Good evening',   emoji: '🌆' },
  night:     { ar: 'تصبح على خير',  en: 'Good night',     emoji: '🌙' },
}

interface Props {
  /** Pass the current user object if available (avoids re-reading auth) */
  userName?: string
}

export default function WelcomeBackBanner({ userName }: Props) {
  const { isAr } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [tod, setTod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning')

  useEffect(() => {
    try {
      // Only show if user has been here before
      const hasVisited =
        localStorage.getItem('dalilak_onboarded') ||
        localStorage.getItem('dalilak_lang_confirmed')
      if (!hasVisited) return
      // Dismiss once per session
      if (sessionStorage.getItem(SS_KEY)) return

      // Get first name
      const name = userName || getUser()?.full_name || ''
      const first = name.split(/\s+/)[0] || ''
      setFirstName(first)
      setTod(getTimeOfDay())
      setVisible(true)
    } catch {}
  }, [userName])

  const dismiss = () => {
    try { sessionStorage.setItem(SS_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  const g = GREETINGS[tod]
  const greeting = firstName
    ? (isAr ? `${g.ar}، ${firstName}!` : `${g.en}, ${firstName}!`)
    : (isAr ? `${g.ar}!` : `${g.en}!`)

  const subtitle = isAr
    ? 'بماذا يمكنني مساعدتك اليوم؟'
    : 'How can I help you today?'

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, rgba(143,29,44,0.05) 0%, rgba(192,57,43,0.04) 100%)',
        border: '1px solid rgba(143,29,44,0.15)',
        borderRadius: 14,
        padding: '13px 16px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      <span style={{ fontSize: 26, flexShrink: 0 }}>{g.emoji}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3 }}>
          {greeting}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          {subtitle}
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-4)', fontSize: 18, padding: '2px 4px',
          flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
