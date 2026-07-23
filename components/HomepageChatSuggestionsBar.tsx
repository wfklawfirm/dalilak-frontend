'use client'

/**
 * HomepageChatSuggestionsBar — horizontally scrollable quick-prompt chips.
 *
 * Shows 6 contextual suggestions (time-of-day + day-of-week aware).
 * Morning → procedures, afternoon → documents, evening → reminders, etc.
 * Clicking a chip fires onAsk(prompt).
 *
 * Hidden until mounted (SSR-safe). Hides itself after first use per session.
 *
 * Props: { onAsk: (prompt: string) => void; isAr: boolean; messageCount: number }
 */

import React, { useState, useEffect, useMemo } from 'react'

interface Props {
  onAsk: (prompt: string) => void
  isAr: boolean
  messageCount: number
}

interface Chip {
  icon: string
  labelAr: string
  labelEn: string
  promptAr: string
  promptEn: string
}

function getTimeSlot(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const ALWAYS: Chip[] = [
  {
    icon: '📋',
    labelAr: 'معاملة جديدة',
    labelEn: 'New procedure',
    promptAr: 'أريد البدء بمعاملة حكومية جديدة — أرشدني',
    promptEn: 'I want to start a new government procedure — guide me',
  },
  {
    icon: '📁',
    labelAr: 'وثائق مطلوبة',
    labelEn: 'Required docs',
    promptAr: 'ما هي الوثائق المطلوبة الأكثر شيوعاً في لبنان؟',
    promptEn: 'What are the most commonly required documents in Lebanon?',
  },
  {
    icon: '💰',
    labelAr: 'الرسوم الحكومية',
    labelEn: 'Gov fees',
    promptAr: 'كم تبلغ رسوم المعاملات الحكومية الشائعة في لبنان؟',
    promptEn: 'How much are common government fees in Lebanon?',
  },
  {
    icon: '🏛️',
    labelAr: 'اتصل بوزارة',
    labelEn: 'Contact ministry',
    promptAr: 'كيف أتواصل مع الوزارة المعنية لمعاملتي؟',
    promptEn: 'How do I contact the relevant ministry for my procedure?',
  },
  {
    icon: '⏱️',
    labelAr: 'مدة الإنجاز',
    labelEn: 'Processing time',
    promptAr: 'كم من الوقت تستغرق المعاملات الحكومية اللبنانية عادةً؟',
    promptEn: 'How long do Lebanese government procedures usually take?',
  },
  {
    icon: '📅',
    labelAr: 'مواعيد العمل',
    labelEn: 'Office hours',
    promptAr: 'ما هي مواعيد عمل الدوائر الحكومية اللبنانية؟',
    promptEn: 'What are the working hours of Lebanese government offices?',
  },
]

const MORNING: Chip[] = [
  {
    icon: '☀️',
    labelAr: 'صباح الخير',
    labelEn: 'Good morning',
    promptAr: 'صباح الخير! ما أبرز معاملة حكومية يمكنني إنجازها صباحاً؟',
    promptEn: 'Good morning! What government procedure is best handled in the morning?',
  },
  {
    icon: '🚀',
    labelAr: 'ابدأ اليوم',
    labelEn: 'Start the day',
    promptAr: 'أريد إنجاز معاملة حكومية اليوم — من أين أبدأ؟',
    promptEn: "I want to complete a government procedure today — where do I start?",
  },
]

const AFTERNOON: Chip[] = [
  {
    icon: '🔄',
    labelAr: 'متابعة ملف',
    labelEn: 'Follow up',
    promptAr: 'كيف أتابع ملفاً قدّمته لدى إحدى الوزارات اللبنانية؟',
    promptEn: 'How do I follow up on a file I submitted to a Lebanese ministry?',
  },
  {
    icon: '📞',
    labelAr: 'أرقام مهمة',
    labelEn: 'Key numbers',
    promptAr: 'أعطني أرقام هواتف أهم الدوائر الحكومية في لبنان',
    promptEn: 'Give me phone numbers for the most important government offices in Lebanon',
  },
]

const EVENING: Chip[] = [
  {
    icon: '🔔',
    labelAr: 'تذكيرات',
    labelEn: 'Reminders',
    promptAr: 'ذكّرني بمواعيد التجديد والمعاملات القادمة التي يجب إنجازها',
    promptEn: 'Remind me of upcoming renewals and pending procedures',
  },
  {
    icon: '📝',
    labelAr: 'جهّز غداً',
    labelEn: 'Plan tomorrow',
    promptAr: 'أريد التخطيط لإنجاز معاملة حكومية غداً — ماذا أحضّر؟',
    promptEn: "I want to plan for a government procedure tomorrow — what should I prepare?",
  },
]

const NIGHT: Chip[] = [
  {
    icon: '🌙',
    labelAr: 'معلومة مفيدة',
    labelEn: 'Useful tip',
    promptAr: 'اعطني نصيحة مهمة لتسريع المعاملات الحكومية في لبنان',
    promptEn: 'Give me an important tip to speed up government procedures in Lebanon',
  },
  {
    icon: '❓',
    labelAr: 'سؤال شائع',
    labelEn: 'Common Q',
    promptAr: 'ما أكثر الأسئلة التي يسألها المواطنون عن المعاملات اللبنانية؟',
    promptEn: 'What are the most common questions citizens ask about Lebanese procedures?',
  },
]

const SLOT_EXTRAS: Record<string, Chip[]> = {
  morning: MORNING, afternoon: AFTERNOON, evening: EVENING, night: NIGHT,
}

export default function HomepageChatSuggestionsBar({ onAsk, isAr, messageCount }: Props) {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const chips = useMemo(() => {
    const slot = getTimeSlot()
    const extras = SLOT_EXTRAS[slot] || []
    // Replace last 2 of ALWAYS with time-specific ones
    return [...ALWAYS.slice(0, 4), ...extras]
  }, [])

  // Hide after first message is sent
  if (!mounted || dismissed || messageCount > 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginBottom: 8 }}
    >
      {/* Section label */}
      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{isAr ? '💡 اقتراحات سريعة' : '💡 Quick suggestions'}</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C5BEB6', fontSize: 11, lineHeight: 1, padding: '1px 2px' }}
        >✕</button>
      </div>

      {/* Scrollable chip row */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 3,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {chips.map((chip, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setDismissed(true)
              onAsk(isAr ? chip.promptAr : chip.promptEn)
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 20, flexShrink: 0,
              background: '#FDFCFA', border: '1.5px solid #E6E2DC',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 700, color: '#3A3028',
              whiteSpace: 'nowrap',
              transition: 'background 0.12s, border-color 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FFF5F6'
              e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#FDFCFA'
              e.currentTarget.style.borderColor = '#E6E2DC'
            }}
          >
            <span style={{ fontSize: 13 }}>{chip.icon}</span>
            {isAr ? chip.labelAr : chip.labelEn}
          </button>
        ))}
      </div>
    </div>
  )
}
