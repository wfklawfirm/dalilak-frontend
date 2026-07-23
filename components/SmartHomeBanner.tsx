'use client'

/**
 * SmartHomeBanner — Contextual announcement banner on the homepage.
 *
 * Shows a time-sensitive, civic-calendar-aware banner based on:
 *   - Tax filing season (March–April)
 *   - School enrollment season (June–September)
 *   - ID / passport validity reminders (always relevant)
 *   - Lebanese independence month (November)
 *   - New Year government office schedules (January)
 *   - Summer official slowdown (July–August)
 *
 * Dismissed per-banner in localStorage (dalilak_banner_dismissed_<id>).
 * Max one banner shown at a time (highest priority wins).
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_PREFIX = 'dalilak_banner_dismissed_'

interface BannerDef {
  id: string
  months: number[]       // 1-based months when this is shown
  priority: number       // higher = shown first when multiple apply
  icon: string
  titleAr: string
  titleEn: string
  bodyAr: string
  bodyEn: string
  ctaAr?: string
  ctaEn?: string
  ctaAction?: string     // 'ask' | link href
  color: string
  bgColor: string
  borderColor: string
}

const BANNERS: BannerDef[] = [
  {
    id: 'tax-season',
    months: [3, 4],
    priority: 10,
    icon: '💼',
    titleAr: 'موسم التصريح الضريبي',
    titleEn: 'Tax Filing Season',
    bodyAr: 'الموعد النهائي لتقديم التصريح الضريبي السنوي يقترب. تأكد من جهوزية سجلاتك قبل نهاية أبريل.',
    bodyEn: 'Annual tax declaration deadline is approaching. Ensure your records are ready before end of April.',
    ctaAr: 'اعرف المتطلبات',
    ctaEn: 'Learn requirements',
    ctaAction: 'ask:ما هي متطلبات التصريح الضريبي السنوي في لبنان؟',
    color: '#92400e',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    id: 'school-enrollment',
    months: [6, 7, 8, 9],
    priority: 8,
    icon: '🎒',
    titleAr: 'موسم التسجيل المدرسي',
    titleEn: 'School Enrollment Season',
    bodyAr: 'حان وقت تسجيل الأبناء للعام الدراسي الجديد. تعرّف على وثائق التسجيل المطلوبة.',
    bodyEn: 'Time to register children for the new academic year. Learn what documents are required.',
    ctaAr: 'وثائق التسجيل',
    ctaEn: 'Enrollment docs',
    ctaAction: 'ask:ما هي وثائق تسجيل الأبناء في المدرسة اللبنانية؟',
    color: '#1e40af',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    id: 'independence-month',
    months: [11],
    priority: 5,
    icon: '🇱🇧',
    titleAr: 'شهر الاستقلال — دوائر رسمية بدوام مخفّض',
    titleEn: 'Independence Month — Reduced Government Hours',
    bodyAr: 'في شهر نوفمبر، بعض الدوائر الحكومية تعمل بدوام مخفّض خلال أسبوع عيد الاستقلال (22 نوفمبر).',
    bodyEn: 'In November, some government offices operate on reduced hours during Independence Day week (Nov 22).',
    ctaAr: 'تحقق من المواعيد',
    ctaEn: 'Check schedules',
    ctaAction: '/services',
    color: '#065F46',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  {
    id: 'new-year-gov',
    months: [1],
    priority: 6,
    icon: '📅',
    titleAr: 'بداية السنة — تحديث الوثائق',
    titleEn: 'New Year — Document Renewal Time',
    bodyAr: 'مطلع السنة هو الوقت المثالي للتحقق من انتهاء صلاحية جواز السفر، الهوية، ورخصة القيادة.',
    bodyEn: 'The start of the year is ideal to check if your passport, ID, or driver\'s license needs renewal.',
    ctaAr: 'تحقق من وثائقي',
    ctaEn: 'Check my docs',
    ctaAction: 'ask:هل يمكنك مساعدتي في التحقق من مواعيد انتهاء وثائقي الرسمية؟',
    color: '#4B3B3B',
    bgColor: '#F8F5F2',
    borderColor: '#E6E2DC',
  },
  {
    id: 'summer-slowdown',
    months: [7, 8],
    priority: 4,
    icon: '☀️',
    titleAr: 'تباطؤ صيفي في الدوائر الحكومية',
    titleEn: 'Summer Slowdown — Government Offices',
    bodyAr: 'خلال يوليو وأغسطس، قد تشهد بعض الدوائر الحكومية تأخيراً في معالجة المعاملات بسبب العطل الصيفية.',
    bodyEn: 'During July and August, some government offices experience processing delays due to summer vacations.',
    ctaAr: 'المعاملات المتاحة',
    ctaEn: 'Available procedures',
    ctaAction: '/procedures',
    color: '#92400e',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
]

interface Props {
  onAsk?: (q: string) => void
}

export default function SmartHomeBanner({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [banner, setBanner] = useState<BannerDef | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const month = new Date().getMonth() + 1 // 1-based

    // Find the highest-priority banner for this month that hasn't been dismissed
    const eligible = BANNERS
      .filter(b => b.months.includes(month))
      .filter(b => {
        try { return !localStorage.getItem(LS_PREFIX + b.id) } catch { return true }
      })
      .sort((a, b) => b.priority - a.priority)

    setBanner(eligible[0] ?? null)
  }, [])

  if (!mounted || !banner || dismissed) return null

  function handleDismiss() {
    if (!banner) return
    try { localStorage.setItem(LS_PREFIX + banner.id, '1') } catch {}
    setDismissed(true)
  }

  function handleCta() {
    if (!banner?.ctaAction) return
    if (banner.ctaAction.startsWith('ask:')) {
      onAsk?.(banner.ctaAction.slice(4))
    } else {
      window.location.href = banner.ctaAction
    }
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '11px 14px',
        background: banner.bgColor,
        border: `1px solid ${banner.borderColor}`,
        borderRadius: 14,
        marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.3 }}>{banner.icon}</span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: banner.color, marginBottom: 3 }}>
          {isAr ? banner.titleAr : banner.titleEn}
        </div>
        <div style={{ fontSize: 11.5, color: '#4B3B3B', lineHeight: 1.5 }}>
          {isAr ? banner.bodyAr : banner.bodyEn}
        </div>

        {/* CTA */}
        {banner.ctaAction && (
          <button
            type="button"
            onClick={handleCta}
            style={{
              marginTop: 7, padding: '4px 10px',
              background: banner.color, color: '#fff',
              border: 'none', borderRadius: 7,
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isAr ? banner.ctaAr : banner.ctaEn} →
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label={isAr ? 'إغلاق' : 'Dismiss'}
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: banner.color, opacity: 0.6, fontSize: 16, lineHeight: 1,
          padding: 2, flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
