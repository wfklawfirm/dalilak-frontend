'use client'

/**
 * HomepageMotivationalQuote — a daily rotating motivational card.
 *
 * Seeded by day-of-year so it changes daily and is consistent per day.
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Quote {
  ar: string
  en: string
  authorAr: string
  authorEn: string
}

const QUOTES: Quote[] = [
  { ar: 'كل رحلة تبدأ بخطوة واحدة.', en: 'Every journey begins with a single step.', authorAr: 'لاوتزي', authorEn: 'Lao Tzu' },
  { ar: 'الانضباط هو الجسر بين الأهداف والإنجاز.', en: 'Discipline is the bridge between goals and accomplishment.', authorAr: 'جيم رون', authorEn: 'Jim Rohn' },
  { ar: 'أفضل وقت لزرع شجرة كان قبل عشرين عامًا؛ الوقت الثاني الأفضل هو الآن.', en: 'The best time to plant a tree was 20 years ago. The second best time is now.', authorAr: 'مثل صيني', authorEn: 'Chinese proverb' },
  { ar: 'الإنجاز يتطلب أكثر من مجرد التمني؛ يتطلب العمل.', en: 'Achievement requires more than wishing — it requires work.', authorAr: 'دليلك', authorEn: 'Dalilak' },
  { ar: 'الصبر مفتاح الفرج.', en: 'Patience is the key to relief.', authorAr: 'حكمة عربية', authorEn: 'Arab proverb' },
  { ar: 'من جدّ وجد.', en: 'Who strives, finds.', authorAr: 'حكمة عربية', authorEn: 'Arab proverb' },
  { ar: 'لا تؤجل عمل اليوم إلى الغد.', en: "Don't put off today's work until tomorrow.", authorAr: 'حكمة شعبية', authorEn: 'Folk wisdom' },
  { ar: 'المثابرة تهزم العقبات.', en: 'Perseverance defeats obstacles.', authorAr: 'دليلك', authorEn: 'Dalilak' },
  { ar: 'كل معاملة أنجزتها اليوم هي راحة بال غدًا.', en: 'Every procedure you complete today is peace of mind tomorrow.', authorAr: 'دليلك', authorEn: 'Dalilak' },
  { ar: 'الترتيب المسبق يوفّر الوقت والجهد.', en: 'Advance preparation saves time and effort.', authorAr: 'دليلك', authorEn: 'Dalilak' },
]

function dayOfYear(): number {
  const now  = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

export default function HomepageMotivationalQuote({ isAr }: { isAr: boolean }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const q = QUOTES[dayOfYear() % QUOTES.length]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
        border: '1px solid #FDE68A',
        borderRadius: 14,
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoration */}
      <span style={{ position: 'absolute', top: 8, [isAr ? 'left' : 'right']: 12, fontSize: 28, opacity: 0.15 }}>
        💬
      </span>

      <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', lineHeight: 1.5, marginBottom: 6 }}>
        {isAr ? `"${q.ar}"` : `"${q.en}"`}
      </div>
      <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600 }}>
        — {isAr ? q.authorAr : q.authorEn}
      </div>
    </div>
  )
}
