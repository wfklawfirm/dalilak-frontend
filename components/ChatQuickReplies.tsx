'use client'

/**
 * ChatQuickReplies — contextual quick-reply chips shown after an AI response.
 *
 * Analyzes the last AI message and suggests 3-4 follow-up questions.
 * Chips are context-aware:
 *   - Procedure answer → "أين أتقدم؟", "ما الرسوم؟", "كيف أحجز موعد؟"
 *   - Document answer  → "كيف أحصل عليها؟", "هل يمكن تصديقها أونلاين؟"
 *   - Default          → common helpful follow-ups
 *
 * Disappears when user types or sends a new message.
 * Hidden if no messages, or last message is from user.
 *
 * Props:
 *   lastMessage  — the last message object { role, content }
 *   onSelect     — called with the selected suggestion text
 *   isAr         — current language is Arabic
 */

import React, { useMemo } from 'react'

interface QuickReply {
  ar: string
  en: string
}

// ── Keyword triggers ──────────────────────────────────────────────────────────
const PROCEDURE_KEYWORDS_AR = ['معاملة', 'إجراء', 'استخراج', 'تجديد', 'تسجيل', 'ترخيص', 'شهادة', 'جواز', 'هوية', 'رخصة']
const FEES_KEYWORDS_AR      = ['رسوم', 'تكلفة', 'دفع', 'مبلغ', 'ليرة', 'دولار', 'طوابع']
const DOCS_KEYWORDS_AR      = ['وثيقة', 'مستند', 'صورة', 'نسخة', 'توثيق', 'وثائق', 'مطلوب']
const APPOINTMENT_KEYWORDS  = ['موعد', 'appointment', 'دور', 'queue', 'حجز']
const LOCATION_KEYWORDS_AR  = ['مكان', 'عنوان', 'دائرة', 'وزارة', 'مديرية', 'بناء']

const QUICK_REPLIES: { trigger: string[]; replies: QuickReply[] }[] = [
  {
    trigger: [...PROCEDURE_KEYWORDS_AR, 'procedure', 'passport', 'license', 'registration'],
    replies: [
      { ar: 'ما هي الوثائق المطلوبة؟',          en: 'What documents are required?' },
      { ar: 'ما هي الرسوم؟',                      en: 'What are the fees?' },
      { ar: 'كم تستغرق هذه المعاملة؟',            en: 'How long does it take?' },
      { ar: 'أين أتقدم بهذه المعاملة؟',           en: 'Where do I apply?' },
    ],
  },
  {
    trigger: FEES_KEYWORDS_AR,
    replies: [
      { ar: 'كيف يمكنني الدفع؟',                  en: 'How can I pay?' },
      { ar: 'هل هناك إعفاء من الرسوم؟',           en: 'Are there fee exemptions?' },
      { ar: 'ما قيمة الطوابع المالية المطلوبة؟',  en: 'What fiscal stamps are needed?' },
    ],
  },
  {
    trigger: DOCS_KEYWORDS_AR,
    replies: [
      { ar: 'أين أحصل على هذه الوثيقة؟',          en: 'Where do I get this document?' },
      { ar: 'هل يمكن التصديق عليها إلكترونياً؟',  en: 'Can it be certified online?' },
      { ar: 'كم صورة مطلوبة؟',                    en: 'How many copies are needed?' },
    ],
  },
  {
    trigger: APPOINTMENT_KEYWORDS,
    replies: [
      { ar: 'كيف أحجز موعد عبر الإنترنت؟',        en: 'How do I book online?' },
      { ar: 'ما ساعات عمل الدائرة؟',              en: 'What are the office hours?' },
      { ar: 'هل يمكن إلغاء الموعد؟',              en: 'Can I cancel the appointment?' },
    ],
  },
  {
    trigger: LOCATION_KEYWORDS_AR,
    replies: [
      { ar: 'ما العنوان الدقيق؟',                  en: 'What is the exact address?' },
      { ar: 'هل هناك فروع في المحافظات؟',          en: 'Are there regional branches?' },
      { ar: 'ما ساعات العمل؟',                     en: 'What are the working hours?' },
    ],
  },
]

const DEFAULT_REPLIES: QuickReply[] = [
  { ar: 'اشرح لي أكثر',                           en: 'Can you explain more?' },
  { ar: 'ما الخطوة التالية؟',                      en: 'What is the next step?' },
  { ar: 'هل هناك طريقة أسرع؟',                    en: 'Is there a faster way?' },
  { ar: 'ما الوثائق المطلوبة بشكل عام؟',           en: 'What documents are usually needed?' },
]

function detectReplies(content: string): QuickReply[] {
  const lower = content.toLowerCase()
  for (const group of QUICK_REPLIES) {
    const hit = group.trigger.some(kw => lower.includes(kw.toLowerCase()))
    if (hit) return group.replies
  }
  return DEFAULT_REPLIES
}

interface Props {
  lastMessageContent: string
  lastMessageRole: 'user' | 'assistant'
  onSelect: (text: string) => void
  isAr: boolean
}

export default function ChatQuickReplies({ lastMessageContent, lastMessageRole, onSelect, isAr }: Props) {
  const replies = useMemo(() => {
    if (lastMessageRole !== 'assistant') return []
    return detectReplies(lastMessageContent).slice(0, 4)
  }, [lastMessageContent, lastMessageRole])

  if (replies.length === 0) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto',
        padding: '6px 14px 4px',
        animation: 'fadeUp 0.15s ease both',
        scrollbarWidth: 'none',
      }}
      aria-label={isAr ? 'اقتراحات سريعة' : 'Quick suggestions'}
    >
      {replies.map((r, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(isAr ? r.ar : r.en)}
          style={{
            padding: '5px 12px',
            borderRadius: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            fontSize: 11.5,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.12s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(143,29,44,0.06)'
            e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)'
            e.currentTarget.style.color = '#8F1D2C'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-2)'
          }}
        >
          {isAr ? r.ar : r.en}
        </button>
      ))}
    </div>
  )
}
