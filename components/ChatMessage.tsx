'use client'

import React, { useState, useCallback } from 'react'
import AgentResponseRenderer from './AgentResponseRenderer'
import UniversalDocumentAnalysisView from './DocumentIntelligenceView'
import type { AgentSource, ConfidenceLevel } from '@/lib/types'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  /** Sources from SSE meta event */
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  /** Universal document analysis result */
  documentAnalysis?: import('@/lib/documentIntelligence').UniversalDocumentAnalysis
}

// ── Share action bar ─────────────────────────────────────────────────────────
function ShareBar({ content, isAr }: { content: string; isAr: boolean }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const plainText = content
    .replace(/\*\*(.+?)\*\*/g, '$1')   // strip bold
    .replace(/#{1,6}\s/g, '')           // strip headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links
    .trim()

  const shareText = `${plainText.slice(0, 480)}${plainText.length > 480 ? '…' : ''}\n\n— دليلك AI | dalilak.vercel.app`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = plainText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }, [plainText])

  const handleWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer')
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }, [shareText])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isAr ? 'معلومة من دليلك' : 'Info from Dalilak',
          text: shareText,
          url: 'https://dalilak.vercel.app',
        })
      } catch { /* user cancelled */ }
    } else {
      handleWhatsApp()
    }
  }, [shareText, isAr, handleWhatsApp])

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4,
    height: 26, padding: '0 8px', borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-4)', fontSize: 10.5, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'color 0.12s, border-color 0.12s, background 0.12s',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      marginTop: 8, justifyContent: isAr ? 'flex-start' : 'flex-start',
    }}>
      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={isAr ? 'نسخ الرد' : 'Copy response'}
        title={isAr ? 'نسخ' : 'Copy'}
        style={{ ...btnBase, color: copied ? 'var(--success)' : 'var(--text-4)', borderColor: copied ? 'var(--success-border)' : 'var(--border)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
        onMouseLeave={e => { e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--text-4)'; e.currentTarget.style.borderColor = copied ? 'var(--success-border)' : 'var(--border)' }}
      >
        {copied ? (
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        )}
        {isAr ? (copied ? 'تم النسخ' : 'نسخ') : (copied ? 'Copied!' : 'Copy')}
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        aria-label={isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
        title="WhatsApp"
        style={{ ...btnBase, color: shared ? '#25D366' : 'var(--text-4)', borderColor: shared ? '#25D36644' : 'var(--border)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#25D366'; e.currentTarget.style.borderColor = '#25D36644'; e.currentTarget.style.background = '#25D36610' }}
        onMouseLeave={e => { e.currentTarget.style.color = shared ? '#25D366' : 'var(--text-4)'; e.currentTarget.style.borderColor = shared ? '#25D36644' : 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
      >
        {/* WhatsApp icon */}
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {isAr ? 'واتساب' : 'WhatsApp'}
      </button>

      {/* Native share (mobile) — only if supported */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label={isAr ? 'مشاركة' : 'Share'}
          title={isAr ? 'مشاركة' : 'Share'}
          style={btnBase}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          {isAr ? 'شارك' : 'Share'}
        </button>
      )}
    </div>
  )
}

// ── Feedback bar (👍 / 👎) ───────────────────────────────────────────────────
function FeedbackBar({ msgId, isAr }: { msgId: string; isAr: boolean }) {
  const lsKey = `dalilak_fb_${msgId}`
  const [vote, setVote] = useState<'up' | 'down' | null>(() => {
    if (typeof window === 'undefined') return null
    return (localStorage.getItem(lsKey) as 'up' | 'down' | null)
  })
  const [thanks, setThanks] = useState(false)

  const handleVote = (v: 'up' | 'down') => {
    const next = vote === v ? null : v    // toggle off if clicking same
    setVote(next)
    if (next) {
      try { localStorage.setItem(lsKey, next) } catch { /* ignore */ }
      setThanks(true)
      setTimeout(() => setThanks(false), 1500)
    } else {
      try { localStorage.removeItem(lsKey) } catch { /* ignore */ }
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 6,
    border: '1px solid var(--border)', background: 'transparent',
    cursor: 'pointer', fontSize: 13, transition: 'border-color 0.12s, background 0.12s',
  }

  if (thanks) {
    return (
      <span style={{ fontSize: 10.5, color: 'var(--success)', fontWeight: 600, marginInlineStart: 4 }}>
        {isAr ? '✓ شكراً على تقييمك' : '✓ Thanks for your feedback'}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginInlineStart: 2 }}>
      <button
        type="button"
        aria-label={isAr ? 'جيد' : 'Good response'}
        title={isAr ? 'رد جيد' : 'Good response'}
        onClick={() => handleVote('up')}
        style={{
          ...btnBase,
          borderColor: vote === 'up' ? 'var(--success)' : 'var(--border)',
          background: vote === 'up' ? 'var(--success-bg)' : 'transparent',
        }}
        onMouseEnter={e => { if (vote !== 'up') { e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.background = 'var(--success-bg)' } }}
        onMouseLeave={e => { if (vote !== 'up') { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' } }}
      >
        👍
      </button>
      <button
        type="button"
        aria-label={isAr ? 'سيئ' : 'Poor response'}
        title={isAr ? 'رد سيئ' : 'Poor response'}
        onClick={() => handleVote('down')}
        style={{
          ...btnBase,
          borderColor: vote === 'down' ? '#FECACA' : 'var(--border)',
          background: vote === 'down' ? '#FEF2F2' : 'transparent',
        }}
        onMouseEnter={e => { if (vote !== 'down') { e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.background = '#FEF2F2' } }}
        onMouseLeave={e => { if (vote !== 'down') { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' } }}
      >
        👎
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatMessage({
  msg, isAr, onFollowUp, onSendMessage, onUploadFile, onStartFlow, question, index,
}: {
  msg: Message
  isAr?: boolean
  onFollowUp?: (q: string) => void
  onSendMessage?: (q: string) => void
  onUploadFile?: () => void
  onStartFlow?: (slug: string) => void
  question?: string
  /** Message index used for stable feedback storage key */
  index?: number
}) {
  const isUser = msg.role === 'user'
  const ar = isAr !== false

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      {isUser ? (
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #C9982A 0%, #B8860B 100%)',
          boxShadow: '0 2px 6px rgba(201,152,42,0.3)',
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
      ) : (
        <div style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid rgba(143,29,44,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(143,29,44,0.15)',
          overflow: 'hidden',
        }}>
          <img src="/logo-icon.png" alt="دليلك" style={{ width: 22, height: 22, objectFit: 'contain' }} />
        </div>
      )}

      {isUser ? (
        <div style={{ maxWidth: '86%', minWidth: 60 }}>
          <div style={{
            padding: '11px 15px', borderRadius: 16,
            borderTopRightRadius: ar ? 4 : 16, borderTopLeftRadius: ar ? 16 : 4,
            background: 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)',
            color: '#fff', fontSize: 13.5, lineHeight: 1.75,
            boxShadow: '0 2px 10px rgba(143,29,44,0.2)',
          }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {msg.content.replace(/^\[.*?\]\n?/, '')}
            </p>
          </div>
        </div>
      ) : msg.documentAnalysis ? (
        /* ── Document Intelligence View ── */
        <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
          <UniversalDocumentAnalysisView
            analysis={msg.documentAnalysis}
            isAr={ar}
            onSend={onSendMessage ?? onFollowUp ?? (() => {})}
          />
        </div>
      ) : (
        /* ── AI response card ── */
        <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
          <div style={{
            background: '#fff',
            borderRadius: 18, borderTopLeftRadius: ar ? 4 : 18, borderTopRightRadius: ar ? 18 : 4,
            border: '1px solid rgba(210,195,178,0.5)',
            boxShadow: '0 1px 8px rgba(100,60,20,0.06), 0 0.5px 1px rgba(0,0,0,0.04)',
            padding: '13px 15px 10px',
          }}>
            <AgentResponseRenderer
              content={msg.content}
              isAr={ar}
              streaming={msg.streaming}
              sources={msg.sources}
              confidence={msg.confidence}
              onFollowUp={onFollowUp}
              question={question}
            />
          </div>
          {/* Share bar + feedback — only once message is complete */}
          {!msg.streaming && msg.content && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <ShareBar content={msg.content} isAr={ar} />
              {index !== undefined && (
                <FeedbackBar msgId={`msg_${index}`} isAr={ar} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
