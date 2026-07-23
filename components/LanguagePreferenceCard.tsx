'use client'

/**
 * LanguagePreferenceCard — compact inline language prompt.
 * Shows on the homepage empty state for users who haven't explicitly
 * confirmed their language preference (dalilak_lang_confirmed not set).
 * Skipped entirely if the user completed the full UserOnboarding wizard
 * (dalilak_onboarded is set — onboarding already asked for language).
 *
 * localStorage keys:
 *   dalilak_lang_confirmed  — set to 'ar' | 'en' after confirmation
 *   dalilak_onboarded       — if present, skip this card entirely
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_CONFIRMED = 'dalilak_lang_confirmed'
const LS_ONBOARDED = 'dalilak_onboarded'

export default function LanguagePreferenceCard() {
  const { isAr, toggleLang } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      // Don't show if user already completed onboarding wizard (it asked for lang)
      if (localStorage.getItem(LS_ONBOARDED)) return
      // Don't show if language already confirmed
      if (localStorage.getItem(LS_CONFIRMED)) return
      setVisible(true)
    } catch {}
  }, [])

  const confirm = (wantAr: boolean) => {
    if (isAr !== wantAr) toggleLang()
    try { localStorage.setItem(LS_CONFIRMED, wantAr ? 'ar' : 'en') } catch {}
    setVisible(false)
  }

  const dismiss = () => {
    // Confirm current lang on dismiss
    try { localStorage.setItem(LS_CONFIRMED, isAr ? 'ar' : 'en') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '13px 16px',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Icon + text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🌐</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.4 }}>
          {isAr
            ? 'ما لغتك المفضّلة؟'
            : 'What\'s your preferred language?'}
        </span>
      </div>

      {/* Language buttons */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => confirm(true)}
          style={{
            padding: '6px 13px',
            borderRadius: 8,
            border: `1.5px solid ${isAr ? 'var(--brand)' : 'var(--border)'}`,
            background: isAr ? 'rgba(143,29,44,0.06)' : 'transparent',
            color: isAr ? 'var(--brand)' : 'var(--text-2)',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.13s ease',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          🇱🇧 العربية
          {isAr && <span style={{ fontSize: 11 }}>✓</span>}
        </button>

        <button
          type="button"
          onClick={() => confirm(false)}
          style={{
            padding: '6px 13px',
            borderRadius: 8,
            border: `1.5px solid ${!isAr ? 'var(--brand)' : 'var(--border)'}`,
            background: !isAr ? 'rgba(143,29,44,0.06)' : 'transparent',
            color: !isAr ? 'var(--brand)' : 'var(--text-2)',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.13s ease',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          🇬🇧 English
          {!isAr && <span style={{ fontSize: 11 }}>✓</span>}
        </button>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-4)', fontSize: 16, padding: '2px 4px',
          flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
