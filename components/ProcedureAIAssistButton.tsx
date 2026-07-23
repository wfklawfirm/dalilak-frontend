'use client'

/**
 * ProcedureAIAssistButton — "اسأل الذكاء الاصطناعي" sticky button on procedure detail.
 *
 * Shows a floating button at the bottom of the expanded procedure card.
 * Clicking it navigates the user to the homepage with a pre-built question
 * about the procedure via URL param ?q=, which the homepage chat picks up.
 *
 * Also offers 3 quick question presets the user can pick from.
 *
 * Props: { title: string; title_en?: string; code: string; isAr: boolean }
 */

import React, { useState } from 'react'

interface Props {
  title: string
  title_en?: string
  code: string
  isAr: boolean
  onAsk: (q: string) => void
}

export default function ProcedureAIAssistButton({ title, title_en, code, isAr, onAsk }: Props) {
  const [open, setOpen] = useState(false)

  const displayTitle = isAr ? title : (title_en || title)

  const PRESETS = isAr
    ? [
        { label: '📋 ما هي خطوات هذه المعاملة؟', q: `ما هي الخطوات التفصيلية لإتمام معاملة "${title}"؟` },
        { label: '📁 ما الوثائق المطلوبة؟',       q: `ما هي المستندات المطلوبة لمعاملة "${title}"؟` },
        { label: '💰 كم تكلّف هذه المعاملة؟',    q: `ما هي رسوم معاملة "${title}" وكيف تُدفع؟` },
        { label: '⏱ كم تستغرق من وقت؟',          q: `ما هي المدة المتوقعة لإنجاز معاملة "${title}"؟` },
      ]
    : [
        { label: '📋 What are the steps?',           q: `What are the detailed steps to complete "${displayTitle}"?` },
        { label: '📁 What documents are needed?',    q: `What documents are required for "${displayTitle}"?` },
        { label: '💰 How much does it cost?',        q: `What are the fees for "${displayTitle}" and how are they paid?` },
        { label: '⏱ How long does it take?',         q: `How long does "${displayTitle}" typically take?` },
      ]

  function navigate(q: string) {
    onAsk(q)
    setOpen(false)
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginTop: 10, marginBottom: 4, position: 'relative' }}
    >
      {/* Quick presets dropdown */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)',
          [isAr ? 'right' : 'left']: 0,
          background: '#fff', border: '1.5px solid rgba(143,29,44,0.2)',
          borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          padding: 6, zIndex: 50, minWidth: 230,
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px 4px' }}>
            {isAr ? 'اختر سؤالاً سريعاً' : 'Pick a quick question'}
          </div>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setOpen(false); navigate(p.q) }}
              style={{
                textAlign: 'start', padding: '6px 9px', borderRadius: 7,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, color: '#191713',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {p.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #F0EBE5', marginTop: 2, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => navigate(isAr ? `أخبرني عن معاملة "${title}"` : `Tell me about "${displayTitle}"`)}
              style={{
                width: '100%', textAlign: 'start', padding: '6px 9px', borderRadius: 7,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 10.5, fontWeight: 600, color: '#8F1D2C',
              }}
            >
              🤖 {isAr ? 'سؤال حر…' : 'Open-ended question…'}
            </button>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 9,
          background: open ? '#7A1827' : '#8F1D2C',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 11.5, fontWeight: 800, letterSpacing: '0.02em',
          transition: 'background 0.15s',
          boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#7A1827')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? '#7A1827' : '#8F1D2C')}
      >
        <span style={{ fontSize: 15 }}>🤖</span>
        {isAr ? 'اسأل الذكاء الاصطناعي عن هذه المعاملة' : 'Ask AI about this procedure'}
        <span style={{ fontSize: 12, opacity: 0.75, marginInlineStart: 2 }}>{open ? '▲' : '▼'}</span>
      </button>
    </div>
  )
}
