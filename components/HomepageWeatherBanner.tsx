'use client'

/**
 * HomepageWeatherBanner — Beirut seasonal weather context chip.
 *
 * No API calls — uses seasonal lookup based on current month.
 * Shows a weather emoji + temp range + short advisory relevant
 * to visiting government offices (e.g., "weather hot — go early").
 *
 * Dismissible per day: LS key dalilak_weather_dismissed_{YYYY-MM-DD}
 * Very lightweight — pure presentational after mount.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface WeatherData {
  emoji: string
  labelAr: string
  labelEn: string
  tempAr: string
  tempEn: string
  tipAr: string
  tipEn: string
  bg: string
  border: string
  textColor: string
}

const SEASONAL: Record<number, WeatherData> = {
  // Dec, Jan, Feb — mild/rainy
  12: { emoji: '🌧️', labelAr: 'ماطر', labelEn: 'Rainy', tempAr: '٧–١٤°م', tempEn: '7–14°C', tipAr: 'احمل مظلة عند زيارة الدوائر الحكومية', tipEn: 'Bring an umbrella for office visits', bg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF' },
  1:  { emoji: '🌧️', labelAr: 'ماطر', labelEn: 'Rainy', tempAr: '٦–١٢°م', tempEn: '6–12°C', tipAr: 'احمل مظلة عند زيارة الدوائر الحكومية', tipEn: 'Bring an umbrella for office visits', bg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF' },
  2:  { emoji: '🌦️', labelAr: 'متقلّب', labelEn: 'Mixed', tempAr: '٧–١٤°م', tempEn: '7–14°C', tipAr: 'الطقس متقلّب — خطّط مسبقاً', tipEn: 'Changeable — plan ahead', bg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF' },
  // Mar, Apr — spring
  3:  { emoji: '🌤️', labelAr: 'ربيعي لطيف', labelEn: 'Mild spring', tempAr: '١٠–١٩°م', tempEn: '10–19°C', tipAr: 'طقس مثالي لإنجاز معاملاتك', tipEn: 'Perfect weather for errands', bg: '#F0FDF4', border: '#BBF7D0', textColor: '#065F46' },
  4:  { emoji: '⛅', labelAr: 'معتدل', labelEn: 'Mild', tempAr: '١٣–٢٣°م', tempEn: '13–23°C', tipAr: 'طقس جيد — أنجز معاملاتك اليوم', tipEn: 'Good day — get things done', bg: '#F0FDF4', border: '#BBF7D0', textColor: '#065F46' },
  // May, Jun — warming
  5:  { emoji: '☀️', labelAr: 'دافئ', labelEn: 'Warm', tempAr: '١٧–٢٨°م', tempEn: '17–28°C', tipAr: 'احجز موعدك في الصباح الباكر', tipEn: 'Book morning appointments', bg: '#FFFBEB', border: '#FDE68A', textColor: '#92400E' },
  6:  { emoji: '☀️', labelAr: 'حار', labelEn: 'Hot', tempAr: '٢١–٣٢°م', tempEn: '21–32°C', tipAr: 'اذهب مبكراً وتجنّب ساعات الذروة', tipEn: 'Go early, avoid peak hours', bg: '#FEF9C3', border: '#FDE047', textColor: '#713F12' },
  // Jul, Aug, Sep — peak summer
  7:  { emoji: '🌡️', labelAr: 'حار جداً', labelEn: 'Very hot', tempAr: '٢٦–٣٦°م', tempEn: '26–36°C', tipAr: 'أنجز معاملاتك صباحاً قبل الساعة ١١', tipEn: 'Finish errands before 11am', bg: '#FEF2F2', border: '#FECACA', textColor: '#991B1B' },
  8:  { emoji: '🌡️', labelAr: 'حار جداً', labelEn: 'Very hot', tempAr: '٢٦–٣٦°م', tempEn: '26–36°C', tipAr: 'أنجز معاملاتك صباحاً قبل الساعة ١١', tipEn: 'Finish errands before 11am', bg: '#FEF2F2', border: '#FECACA', textColor: '#991B1B' },
  9:  { emoji: '🌤️', labelAr: 'دافئ', labelEn: 'Warm', tempAr: '٢٢–٣٢°م', tempEn: '22–32°C', tipAr: 'ابدأ مبكراً للابتعاد عن الحر', tipEn: 'Start early to beat the heat', bg: '#FFFBEB', border: '#FDE68A', textColor: '#92400E' },
  // Oct, Nov — autumn
  10: { emoji: '⛅', labelAr: 'معتدل', labelEn: 'Mild', tempAr: '١٦–٢٦°م', tempEn: '16–26°C', tipAr: 'طقس مريح لإنجاز المعاملات', tipEn: 'Comfortable for office visits', bg: '#F0FDF4', border: '#BBF7D0', textColor: '#065F46' },
  11: { emoji: '🌥️', labelAr: 'بارد بعض الشيء', labelEn: 'Slightly cool', tempAr: '١١–٢٠°م', tempEn: '11–20°C', tipAr: 'ارتدِ طبقات دافئة', tipEn: 'Layer up for outdoor queues', bg: '#EFF6FF', border: '#BFDBFE', textColor: '#1E40AF' },
}

function getTodayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

export default function HomepageWeatherBanner() {
  const { isAr } = useLanguage()
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => {
    setMounted(true)
    const key = `dalilak_weather_dismissed_${getTodayKey()}`
    try { if (localStorage.getItem(key)) setDismissed(true) } catch {}
  }, [])

  function dismiss() {
    setDismissed(true)
    try { localStorage.setItem(`dalilak_weather_dismissed_${getTodayKey()}`, '1') } catch {}
  }

  if (!mounted || dismissed) return null

  const month = new Date().getMonth() + 1
  const w = SEASONAL[month] || SEASONAL[7]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: w.bg, border: `1.5px solid ${w.border}`, borderRadius: 11,
        padding: '8px 12px', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 9,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{w.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: w.textColor }}>
          {isAr
            ? `بيروت — ${w.labelAr} ${w.tempAr}`
            : `Beirut — ${w.labelEn} ${w.tempEn}`}
        </div>
        <div style={{ fontSize: 10, color: w.textColor, opacity: 0.8, marginTop: 1 }}>
          {isAr ? w.tipAr : w.tipEn}
        </div>
      </div>
      <button
        type="button" onClick={dismiss} aria-label="dismiss"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: w.textColor, opacity: 0.5, fontSize: 13, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  )
}
