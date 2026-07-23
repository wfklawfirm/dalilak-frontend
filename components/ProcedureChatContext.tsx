'use client'

/**
 * ProcedureChatContext — sticky context chip at the top of the chat
 * showing which procedure the user navigated from.
 *
 * Reads URL param: ?proc={code} or ?proc={title}
 * If present, shows a dismissible chip: "تتحدث عن: {title}"
 *
 * The chip helps the user remember the context of their question
 * and automatically pre-fills relevant suggestions.
 *
 * Also checks for sessionStorage key: dalilak_chat_proc_context
 * so context persists across page reloads within the same tab.
 *
 * Props: { isAr: boolean; onAsk: (q: string) => void }
 */

import React, { useState, useEffect } from 'react'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

interface Props {
  isAr: boolean
  onAsk: (q: string) => void
}

interface ProcContext {
  code: string
  titleAr: string
  titleEn: string
  ministry?: string
}

function findProc(param: string): ProcContext | null {
  // Try by code first
  let p = ENRICHED_PROCEDURES.find(p => p.code === param)
  if (!p) p = ENRICHED_PROCEDURES.find(p => p.title === param || p.title_en === param)
  if (!p) return null
  return { code: p.code, titleAr: p.title, titleEn: p.title_en || p.title, ministry: p.ministry }
}

export default function ProcedureChatContext({ isAr, onAsk }: Props) {
  const [context, setContext] = useState<ProcContext | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check URL params
    const params = new URLSearchParams(window.location.search)
    const procParam = params.get('proc')

    // Also check sessionStorage
    let ctx: ProcContext | null = null
    if (procParam) {
      ctx = findProc(procParam)
      if (ctx) {
        try { sessionStorage.setItem('dalilak_chat_proc_context', JSON.stringify(ctx)) } catch {}
      }
    } else {
      try {
        const stored = sessionStorage.getItem('dalilak_chat_proc_context')
        if (stored) ctx = JSON.parse(stored)
      } catch {}
    }
    setContext(ctx)
  }, [])

  function dismiss() {
    setDismissed(true)
    try { sessionStorage.removeItem('dalilak_chat_proc_context') } catch {}
  }

  if (!mounted || !context || dismissed) return null

  const title = isAr ? context.titleAr : context.titleEn
  const questions = isAr
    ? [
        `ما هي الوثائق المطلوبة لـ ${context.titleAr}؟`,
        `كم تستغرق معاملة ${context.titleAr}؟`,
        `ما هي رسوم ${context.titleAr}؟`,
      ]
    : [
        `What documents are needed for ${context.titleEn}?`,
        `How long does ${context.titleEn} take?`,
        `What are the fees for ${context.titleEn}?`,
      ]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'linear-gradient(135deg, #F8EDEF, #FEF2F2)',
        border: '1.5px solid rgba(143,29,44,0.18)', borderRadius: 11,
        padding: '8px 12px', marginBottom: 10,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 14 }}>📌</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#8F1D2C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isAr ? 'سياق المحادثة' : 'Chat context'}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#191713', marginTop: 1, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
        </div>
        <button
          type="button" onClick={dismiss} aria-label="clear context"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8C2BB', fontSize: 13, flexShrink: 0 }}
        >✕</button>
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAsk(q)}
            style={{
              fontSize: 10, fontWeight: 600, color: '#8F1D2C',
              background: 'rgba(143,29,44,0.07)', border: '1px solid rgba(143,29,44,0.18)',
              borderRadius: 20, padding: '3px 9px', cursor: 'pointer', fontFamily: 'inherit',
              lineHeight: 1.4, transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(143,29,44,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(143,29,44,0.07)')}
          >
            {q.length > 40 ? q.slice(0, 40) + '…' : q}
          </button>
        ))}
      </div>
    </div>
  )
}
