'use client'

/**
 * DailyTip — rotating daily tip card for the Dalilak homepage.
 * The tip rotates each day based on Date.now() seeded index.
 * Dismissable per session (sessionStorage).
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Tip {
  icon: string
  titleAr: string
  titleEn: string
  bodyAr: string
  bodyEn: string
  promptAr?: string
  promptEn?: string
  color: string
}

const TIPS: Tip[] = [
  {
    icon: '🕗', color: '#4F46E5',
    titleAr: 'أفضل وقت للمراجعة', titleEn: 'Best Time to Visit',
    bodyAr: 'الفترة المثالية لزيارة الدوائر الحكومية اللبنانية هي بين 8:00 و9:30 صباحاً — قبل ازدحام الفترة الصباحية.',
    bodyEn: 'The best window for Lebanese government offices is 8:00–9:30 AM — before the morning rush.',
  },
  {
    icon: '📂', color: '#059669',
    titleAr: 'نسخ إضافية دائماً', titleEn: 'Always Bring Extra Copies',
    bodyAr: 'احرص على إحضار 3 نسخ من كل وثيقة عند زيارة أي دائرة حكومية — الموظفون قد يطلبون نسخة إضافية غير متوقعة.',
    bodyEn: 'Always bring 3 copies of every document to government offices — clerks often request unexpected extras.',
    promptAr: 'ما هي الوثائق التي أحتاج نسخاً إضافية منها عند مراجعة الدوائر الحكومية اللبنانية؟',
    promptEn: 'What documents should I bring extra copies of for Lebanese government offices?',
  },
  {
    icon: '💳', color: '#D97706',
    titleAr: 'ادفع بالكاش أو الطابع المالي', titleEn: 'Bring Cash or Fiscal Stamps',
    bodyAr: 'معظم الدوائر الحكومية في لبنان لا تقبل البطاقات — احضر كاشاً أو طوابع مالية (متوفرة في المكتبات القريبة).',
    bodyEn: 'Most Lebanese government offices don\'t accept cards — bring cash or fiscal stamps (sold at nearby stationeries).',
  },
  {
    icon: '📱', color: '#7C3AED',
    titleAr: 'صوِّر وثائقك', titleEn: 'Photograph Your Documents',
    bodyAr: 'صوِّر كل وثائقك الرسمية وخزّنها في مجلد سحابي آمن قبل كل معاملة — للطوارئ ولتسهيل الوصول.',
    bodyEn: 'Photograph all your official documents and store them in a secure cloud folder before any transaction — for emergencies and easy access.',
    promptAr: 'كيف أنظّم وأحفظ وثائقي الرسمية رقمياً بشكل آمن؟',
    promptEn: 'How do I organize and securely store my official documents digitally?',
  },
  {
    icon: '🤝', color: '#DC2626',
    titleAr: 'خدمة المواطنين المغتربين', titleEn: 'Expat Services Tip',
    bodyAr: 'إذا كنت مغترباً، يمكنك إتمام كثير من المعاملات اللبنانية عبر السفارات والقنصليات دون الحاجة للسفر إلى لبنان.',
    bodyEn: 'As an expat, you can complete many Lebanese transactions through embassies and consulates without traveling to Lebanon.',
    promptAr: 'ما هي المعاملات اللبنانية التي يمكن للمغتربين إتمامها من السفارة؟',
    promptEn: 'What Lebanese transactions can expats complete at the embassy?',
  },
  {
    icon: '⏱️', color: '#0891B2',
    titleAr: 'المعاملة الاستعجالية', titleEn: 'Urgent Processing',
    bodyAr: 'كثير من الوثائق الرسمية (جوازات السفر، الإقامات) تتوفر بمعالجة استعجالية برسوم إضافية — مفيد عند الضرورة.',
    bodyEn: 'Many official documents (passports, residencies) have urgent processing options at extra cost — useful in time-sensitive situations.',
    promptAr: 'ما هي خيارات الاستعجال المتاحة للمعاملات الحكومية في لبنان وكم تكلف؟',
    promptEn: 'What urgent processing options are available for Lebanese government transactions and how much do they cost?',
  },
  {
    icon: '🏡', color: '#065F46',
    titleAr: 'وكالة قانونية للغائبين', titleEn: 'Power of Attorney',
    bodyAr: 'إذا لم تتمكن من الحضور شخصياً، يمكنك تفويض شخص موثوق بوكالة قانونية من كاتب العدل لإتمام المعاملات نيابة عنك.',
    bodyEn: 'If you can\'t appear in person, you can authorize a trusted person with a notarized power of attorney to complete transactions on your behalf.',
    promptAr: 'كيف أستخرج وكالة قانونية من كاتب العدل في لبنان وما هي الشروط؟',
    promptEn: 'How do I get a notarized power of attorney in Lebanon and what are the requirements?',
  },
  {
    icon: '🔄', color: '#92400E',
    titleAr: 'راجع صلاحية وثائقك', titleEn: 'Check Document Validity',
    bodyAr: 'تذكّر مراجعة تواريخ انتهاء جوازات سفرك وبطاقات الهوية وإذن العمل والإقامة — يُفضَّل التجديد قبل 3 أشهر من الانتهاء.',
    bodyEn: 'Remember to check expiry dates on passports, IDs, work permits, and residencies — ideally renew 3 months before expiry.',
    promptAr: 'كيف أتتبع تواريخ انتهاء صلاحية وثائقي الرسمية وأجدّدها في الوقت المناسب؟',
    promptEn: 'How do I track and renew my official documents before they expire?',
  },
  {
    icon: '💰', color: '#6366F1',
    titleAr: 'رسوم الطابع المالي', titleEn: 'Fiscal Stamp Fees',
    bodyAr: 'الطوابع المالية مطلوبة في معظم المعاملات الرسمية في لبنان — يمكن شراؤها من المكتبات ومحلات القرطاسية المجاورة للدوائر.',
    bodyEn: 'Fiscal stamps are required in most official Lebanese transactions — buy them at stationery shops near government offices.',
  },
  {
    icon: '📋', color: '#4F46E5',
    titleAr: 'احفظ رقم المرجع', titleEn: 'Save Your Reference Number',
    bodyAr: 'عند تقديم أي معاملة، احرص على الاحتفاظ برقم المرجع أو الإيصال — يسهّل عملية المتابعة ويوفر الوقت.',
    bodyEn: 'When submitting any transaction, always keep your reference number or receipt — it saves time when following up.',
  },
]

const SS_KEY = 'dalilak_daily_tip_dismissed'

interface Props {
  onAsk?: (q: string) => void
}

export default function DailyTip({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [tip, setTip] = useState<Tip | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if dismissed this session
    if (sessionStorage.getItem(SS_KEY)) { setDismissed(true); return }
    // Pick tip by day-of-year
    const now = new Date()
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
    setTip(TIPS[dayOfYear % TIPS.length])
  }, [])

  if (!tip || dismissed) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 14px',
        maxWidth: 'var(--container-md)',
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${tip.color}28`,
        background: `${tip.color}0A`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        animation: 'fadeUp 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <span style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: 10,
        background: `${tip.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {tip.icon}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: tip.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isAr ? '💡 نصيحة اليوم' : '💡 Tip of the Day'}
          </span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
          {isAr ? tip.titleAr : tip.titleEn}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
          {isAr ? tip.bodyAr : tip.bodyEn}
        </div>
        {(tip.promptAr || tip.promptEn) && onAsk && (
          <button
            type="button"
            onClick={() => onAsk(isAr ? (tip.promptAr || '') : (tip.promptEn || ''))}
            style={{
              marginTop: 8, fontSize: 11, fontWeight: 700,
              color: tip.color, background: `${tip.color}12`,
              border: `1px solid ${tip.color}28`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
            </svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => { sessionStorage.setItem(SS_KEY, '1'); setDismissed(true) }}
        aria-label={isAr ? 'إخفاء' : 'Dismiss'}
        style={{
          position: 'absolute', top: 8, [isAr ? 'left' : 'right']: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-4)', fontSize: 15, lineHeight: 1, padding: 4,
        }}
      >
        ×
      </button>
    </div>
  )
}
