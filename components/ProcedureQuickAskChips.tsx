'use client'

/**
 * ProcedureQuickAskChips — 4 context-aware quick question chips
 * shown at the bottom of an expanded enriched procedure card.
 *
 * Tapping a chip calls onAsk(question) to fire the question into chat.
 * Questions are bilingual and include the procedure title for clarity.
 */

import React from 'react'

interface Chip {
  icon: string
  labelAr: string
  labelEn: string
  questionAr: string
  questionEn: string
}

interface Props {
  code: string
  titleAr: string
  titleEn?: string
  isAr: boolean
  onAsk: (q: string) => void
}

export default function ProcedureQuickAskChips({ titleAr, titleEn, isAr, onAsk }: Props) {
  const chips: Chip[] = [
    {
      icon: '💰',
      labelAr: 'الرسوم',
      labelEn: 'Fees',
      questionAr: `كم تكلف معاملة "${titleAr}"؟ وضّح كل الرسوم المطلوبة.`,
      questionEn: `What are the fees for "${titleEn || titleAr}"? List all costs.`,
    },
    {
      icon: '📍',
      labelAr: 'مكان التقديم',
      labelEn: 'Where to apply',
      questionAr: `أين يمكنني تقديم طلب "${titleAr}"؟ ما المكاتب أو المراكز المختصة؟`,
      questionEn: `Where can I apply for "${titleEn || titleAr}"? Which offices handle this?`,
    },
    {
      icon: '⏱️',
      labelAr: 'المدة الزمنية',
      labelEn: 'Timeline',
      questionAr: `كم تستغرق معاملة "${titleAr}" من وقت؟ وما العوامل التي تؤثر في المدة؟`,
      questionEn: `How long does "${titleEn || titleAr}" take? What affects the processing time?`,
    },
    {
      icon: '📋',
      labelAr: 'الوثائق المطلوبة',
      labelEn: 'Documents',
      questionAr: `ما الوثائق المطلوبة لمعاملة "${titleAr}"؟ هل هناك وثائق اختيارية؟`,
      questionEn: `What documents do I need for "${titleEn || titleAr}"? Are any optional?`,
    },
  ]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}
    >
      <div style={{ width: '100%', fontSize: 9.5, fontWeight: 700, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
        {isAr ? 'اسأل دليلك عن هذه المعاملة' : 'Ask Dalilak about this procedure'}
      </div>
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onAsk(isAr ? chip.questionAr : chip.questionEn)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', borderRadius: 20,
            background: '#F8F8F6', border: '1.5px solid #E6E2DC',
            color: '#2D1B0E', fontSize: 10.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.12s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#F8EDEF'
            e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)'
            e.currentTarget.style.color = '#8F1D2C'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#F8F8F6'
            e.currentTarget.style.borderColor = '#E6E2DC'
            e.currentTarget.style.color = '#2D1B0E'
          }}
        >
          <span style={{ fontSize: 12 }}>{chip.icon}</span>
          {isAr ? chip.labelAr : chip.labelEn}
        </button>
      ))}
    </div>
  )
}
