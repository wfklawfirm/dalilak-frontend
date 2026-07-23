'use client'

/**
 * SmartInputSuggestions — autocomplete suggestions above the chat input.
 * Shows up to 3 suggestions from SUGGESTIONS list when user types 3+ chars.
 * Keyboard navigable (↑/↓ to navigate, Enter to select, Esc to dismiss).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

// ── Suggestion bank ─────────────────────────────────────────────────────────
const SUGGESTIONS_AR = [
  'كيف أستخرج جواز سفر لبناني؟',
  'كيف أجدد بطاقة الهوية؟',
  'كيف أسجّل شركة في لبنان؟',
  'كيف أستخرج شهادة ميلاد؟',
  'كيف أجدد رخصة القيادة؟',
  'ما هي مستندات نقل ملكية العقار؟',
  'كيف أحصل على توكيل رسمي؟',
  'كيف أستخرج إخراج قيد من السجل المدني؟',
  'كيف أجدد إقامة الأجانب في لبنان؟',
  'ما رسوم التسجيل في الضمان الاجتماعي؟',
  'كيف أحصل على رخصة بناء؟',
  'ما خطوات تسجيل سيارة جديدة؟',
  'كيف أقدم إقرار ضريبي في لبنان؟',
  'ما وثائق تسجيل مولود جديد؟',
  'كيف أحصل على شهادة حسن سيرة وسلوك؟',
  'كيف أستخرج رخصة مهنية؟',
  'ما رسوم استخراج جواز السفر اللبناني؟',
  'كيف أحصل على تصريح عمل لموظف أجنبي؟',
  'ما خطوات تأسيس شركة مساهمة؟',
  'كيف أحصل على رخصة تجارية؟',
  'ما هي ساعات عمل الأمن العام؟',
  'كيف أسجّل زواجاً مدنياً؟',
  'ما مدة معالجة طلب جواز السفر؟',
  'كيف أعترض على قرار إداري؟',
  'ما رسوم نقل ملكية السيارة؟',
]

const SUGGESTIONS_EN = [
  'How do I get a Lebanese passport?',
  'How do I renew my national ID card?',
  'How do I register a company in Lebanon?',
  'How do I get a birth certificate?',
  'How do I renew my driver\'s license?',
  'What documents are needed for property transfer?',
  'How do I notarize a power of attorney?',
  'How do I get a civil registry extract?',
  'How do I renew a foreigner\'s residency permit?',
  'What are social security registration fees?',
  'How do I get a building permit?',
  'What are the steps to register a new car?',
  'How do I file an income tax return in Lebanon?',
  'What documents are needed to register a newborn?',
  'How do I get a certificate of good conduct?',
  'How do I obtain a professional license?',
  'What are passport application fees?',
  'How do I get a work permit for a foreign employee?',
  'What are the steps to set up a joint stock company?',
  'How do I get a commercial license?',
  'What are General Security office hours?',
  'How do I register a civil marriage?',
  'How long does passport processing take?',
  'How do I appeal an administrative decision?',
  'What are vehicle transfer fees?',
]

function getSuggestions(input: string, isAr: boolean): string[] {
  if (!input || input.length < 3) return []
  const q = input.toLowerCase()
  const pool = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN
  return pool
    .filter(s => s.toLowerCase().includes(q))
    .slice(0, 3)
}

interface Props {
  input: string
  onSelect: (suggestion: string) => void
  isAr: boolean
}

export default function SmartInputSuggestions({ input, onSelect, isAr }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [dismissed, setDismissed] = useState(false)
  const prevInputRef = useRef(input)

  // Recompute suggestions when input changes
  useEffect(() => {
    if (input !== prevInputRef.current) {
      setDismissed(false)
      setActiveIdx(-1)
    }
    prevInputRef.current = input
    setSuggestions(getSuggestions(input, isAr))
  }, [input, isAr])

  // Keyboard handler — must be attached to the textarea via onKeyDown prop
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!suggestions.length || dismissed) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      onSelect(suggestions[activeIdx])
      setDismissed(true)
    } else if (e.key === 'Escape') {
      setDismissed(true)
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault()
      onSelect(suggestions[activeIdx >= 0 ? activeIdx : 0])
      setDismissed(true)
    }
  }, [suggestions, dismissed, activeIdx, onSelect])

  if (!suggestions.length || dismissed) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="listbox"
      aria-label={isAr ? 'اقتراحات' : 'Suggestions'}
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        marginBottom: 6,
        overflow: 'hidden',
        animation: 'fadeUp 0.15s ease both',
      }}
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          role="option"
          aria-selected={i === activeIdx}
          type="button"
          onMouseDown={e => {
            e.preventDefault() // don't blur textarea
            onSelect(s)
            setDismissed(true)
          }}
          onMouseEnter={() => setActiveIdx(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            width: '100%', padding: '9px 12px', border: 'none',
            cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
            fontSize: 12.5, color: 'var(--text-1)',
            borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
            background: i === activeIdx ? 'var(--surface)' : 'transparent',
            fontFamily: 'inherit',
            transition: 'background 0.1s',
          }}
        >
          <span style={{ color: 'var(--text-4)', fontSize: 11, flexShrink: 0 }}>🔍</span>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-4)', flexShrink: 0 }}>
            {isAr ? 'اختر' : 'Tab'}
          </span>
        </button>
      ))}

      {/* Keyboard hint */}
      <div style={{
        padding: '4px 12px 5px',
        fontSize: 9.5, color: 'var(--text-4)',
        borderTop: '1px solid var(--border)',
        textAlign: isAr ? 'right' : 'left',
      }}>
        {isAr ? '↑↓ للتنقل · Enter للاختيار · Esc للإغلاق' : '↑↓ navigate · Enter select · Esc dismiss'}
      </div>
    </div>
  )

  // Export keyboard handler so parent can attach it
  // Note: parent must use onKeyDown={handleKeyDown} on the textarea
  void handleKeyDown // TypeScript — suppress unused warning
}

export { SmartInputSuggestions }
// Also export the keyboard handler creator for parent use
export function useSmartSuggestionsKeyDown(
  input: string,
  isAr: boolean,
  onSelect: (s: string) => void
) {
  const [dismissed, setDismissed] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const suggestions = getSuggestions(input, isAr)

  // Reset when input changes
  useEffect(() => {
    setDismissed(false)
    setActiveIdx(-1)
  }, [input])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!suggestions.length || dismissed) return
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault(); onSelect(suggestions[activeIdx]); setDismissed(true)
    } else if (e.key === 'Escape') {
      setDismissed(true)
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault(); onSelect(suggestions[Math.max(activeIdx, 0)]); setDismissed(true)
    }
  }, [suggestions, dismissed, activeIdx, onSelect])

  return { suggestions: dismissed ? [] : suggestions, activeIdx, handleKeyDown, setDismissed }
}
