'use client'

/**
 * ChatSummaryCard — "What we covered" summary strip shown after 5+ messages.
 * Extracts topic keywords from assistant messages client-side.
 * No AI calls — purely regex + keyword matching.
 */

import React, { useMemo, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  messages: Message[]
  /** Called when user clicks "Ask about topic" */
  onAsk?: (q: string) => void
}

// ── Keyword topic extractor ─────────────────────────────────────────────────

const AR_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /جواز\s*سفر/g,         label: '🛂 جواز السفر' },
  { regex: /بطاقة\s*هوية|هوية\s*شخصية/g, label: '🪪 بطاقة الهوية' },
  { regex: /رخصة\s*قيادة|رخصة\s*السير/g, label: '🚗 رخصة القيادة' },
  { regex: /تسجيل\s*شركة|شركة/g,  label: '🏢 تسجيل الشركة' },
  { regex: /ضريبة|إقرار\s*ضريبي/g, label: '💰 الضرائب' },
  { regex: /ضمان\s*اجتماعي|الضمان/g, label: '🏥 الضمان الاجتماعي' },
  { regex: /عقار|ملكية|تسجيل\s*عقار/g, label: '🏠 العقارات' },
  { regex: /إقامة|تصريح\s*إقامة/g, label: '🌍 الإقامة' },
  { regex: /توكيل|وكالة\s*رسمية/g,  label: '📋 التوكيل' },
  { regex: /سجل\s*مدني|شهادة\s*ميلاد|قيد\s*عائلي/g, label: '📄 السجل المدني' },
  { regex: /رخصة\s*تجارية|ترخيص/g, label: '📜 الرخصة التجارية' },
  { regex: /تصريح\s*عمل|عمل|عقد\s*عمل/g, label: '👷 تصريح العمل' },
  { regex: /مستشفى|صحة|طبي/g,     label: '🏥 الصحة' },
  { regex: /بناء|رخصة\s*بناء/g,   label: '🏗️ رخصة البناء' },
  { regex: /أمن\s*عام|الأمن\s*العام/g, label: '🔵 الأمن العام' },
  { regex: /وزارة\s*\S+/g,         label: '🏛️ وزارة' },
  { regex: /ميراث|تركة/g,          label: '📜 الميراث' },
  { regex: /سيارة|تسجيل\s*سيارة/g, label: '🚘 السيارات' },
  { regex: /رسوم|تكلفة|أجور/g,     label: '💵 الرسوم' },
]

const EN_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /passport/gi,           label: '🛂 Passport' },
  { regex: /national\s*id|identity\s*card/gi, label: '🪪 National ID' },
  { regex: /driver.?s?\s*licens/gi, label: '🚗 Driver\'s License' },
  { regex: /company\s*registr|register\s*a\s*company/gi, label: '🏢 Company Registration' },
  { regex: /tax\s*return|income\s*tax/gi, label: '💰 Taxes' },
  { regex: /social\s*security/gi,  label: '🏥 Social Security' },
  { regex: /real\s*estate|property/gi, label: '🏠 Property' },
  { regex: /residency|residence\s*permit/gi, label: '🌍 Residency' },
  { regex: /power\s*of\s*attorney/gi, label: '📋 Power of Attorney' },
  { regex: /civil\s*registry|birth\s*certificate/gi, label: '📄 Civil Registry' },
  { regex: /commercial\s*licens|trade\s*licens/gi, label: '📜 Commercial License' },
  { regex: /work\s*permit/gi,      label: '👷 Work Permit' },
  { regex: /building\s*permit/gi,  label: '🏗️ Building Permit' },
  { regex: /general\s*security/gi, label: '🔵 General Security' },
  { regex: /ministry\s*of\s*\w+/gi, label: '🏛️ Ministry' },
  { regex: /inheritance/gi,        label: '📜 Inheritance' },
  { regex: /vehicle\s*registr|car\s*registr/gi, label: '🚘 Vehicle Registration' },
  { regex: /fees?|costs?|charges?/gi, label: '💵 Fees' },
]

function extractTopics(messages: Message[], isAr: boolean): string[] {
  const assistantText = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join(' ')

  const found = new Set<string>()
  const patterns = isAr ? AR_PATTERNS : EN_PATTERNS

  for (const { regex, label } of patterns) {
    regex.lastIndex = 0
    if (regex.test(assistantText)) {
      found.add(label)
      if (found.size >= 6) break
    }
  }

  return Array.from(found)
}

// ── Component ───────────────────────────────────────────────────────────────

const MIN_MESSAGES = 5

export default function ChatSummaryCard({ messages, onAsk }: Props) {
  const { isAr } = useLanguage()
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const topics = useMemo(
    () => extractTopics(messages, isAr),
    [messages, isAr]
  )

  if (dismissed) return null
  if (messages.length < MIN_MESSAGES) return null
  if (topics.length === 0) return null

  const msgCount = messages.filter(m => m.role === 'user').length
  const assistantCount = messages.filter(m => m.role === 'assistant').length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '12px 0',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>
              {isAr ? 'ملخص المحادثة' : 'Conversation Summary'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 1 }}>
              {isAr
                ? `${msgCount} سؤال • ${assistantCount} إجابة • ${topics.length} موضوع`
                : `${msgCount} question${msgCount !== 1 ? 's' : ''} • ${assistantCount} answer${assistantCount !== 1 ? 's' : ''} • ${topics.length} topic${topics.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setDismissed(true) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-4)', fontSize: 16, padding: '2px 4px',
            }}
          >×</button>
          <span style={{
            fontSize: 10, color: 'var(--text-4)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s', display: 'inline-block',
          }}>▾</span>
        </div>
      </div>

      {/* Topic pills — always visible */}
      <div style={{
        padding: '0 14px 12px',
        display: 'flex', flexWrap: 'wrap', gap: 7,
      }}>
        {topics.map((topic, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAsk && onAsk(
              isAr
                ? `أخبرني أكثر عن: ${topic.replace(/^[^\s]+\s/, '')}`
                : `Tell me more about: ${topic.replace(/^[^\s]+\s/, '')}`
            )}
            style={{
              fontSize: 11.5, fontWeight: 600,
              color: 'var(--text-2)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 99, padding: '4px 11px',
              cursor: 'pointer',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand)'
              e.currentTarget.style.color = 'var(--brand)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-2)'
            }}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 14px',
          display: 'flex', gap: 16, flexWrap: 'wrap',
        }}>
          {[
            { labelAr: 'أسئلة', labelEn: 'Questions', value: msgCount, icon: '❓' },
            { labelAr: 'ردود', labelEn: 'Answers', value: assistantCount, icon: '💬' },
            { labelAr: 'مواضيع', labelEn: 'Topics', value: topics.length, icon: '📌' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-4)' }}>
                  {isAr ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
