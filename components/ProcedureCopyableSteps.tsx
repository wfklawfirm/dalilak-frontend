'use client'

/**
 * ProcedureCopyableSteps — one-click copy of all procedure steps.
 *
 * Copies numbered steps as plain text to clipboard.
 * WhatsApp share option included.
 *
 * Props: { steps: string[]; titleAr: string; titleEn?: string; isAr: boolean }
 */

import React, { useState } from 'react'

interface Props {
  steps: string[]
  titleAr: string
  titleEn?: string
  isAr: boolean
}

export default function ProcedureCopyableSteps({ steps, titleAr, titleEn, isAr }: Props) {
  const [copied, setCopied]   = useState(false)
  const [shared, setShared]   = useState(false)

  if (steps.length === 0) return null

  function buildText(): string {
    const title = isAr ? titleAr : (titleEn || titleAr)
    const lines = [
      `📋 ${title}`,
      isAr ? `📌 خطوات المعاملة (${steps.length}):` : `📌 Procedure steps (${steps.length}):`,
      '',
      ...steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      isAr ? '🔗 عبر دليلك: dalilak.vercel.app' : '🔗 Via Dalilak: dalilak.vercel.app',
    ]
    return lines.join('\n')
  }

  function copy() {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = buildText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function shareWA() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, '_blank', 'noopener,noreferrer')
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
    >
      {/* Copy button */}
      <button
        type="button"
        onClick={copy}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 16,
          background: copied ? '#ECFDF5' : '#F5F3EE',
          border: `1.5px solid ${copied ? '#A7F3D0' : '#E5E0D8'}`,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 700,
          color: copied ? '#065F46' : '#5C534A',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => !copied && (e.currentTarget.style.background = '#EDE9E3')}
        onMouseLeave={e => !copied && (e.currentTarget.style.background = '#F5F3EE')}
      >
        {copied ? (
          <><span>✅</span>{isAr ? 'تم النسخ!' : 'Copied!'}</>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {isAr ? 'نسخ الخطوات' : 'Copy steps'}
          </>
        )}
      </button>

      {/* WhatsApp share */}
      <button
        type="button"
        onClick={shareWA}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 16,
          background: shared ? '#DCFCE7' : '#F0FDF4',
          border: `1.5px solid ${shared ? '#86EFAC' : '#BBF7D0'}`,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 10, fontWeight: 700,
          color: shared ? '#166534' : '#15803D',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => !shared && (e.currentTarget.style.background = '#DCFCE7')}
        onMouseLeave={e => !shared && (e.currentTarget.style.background = '#F0FDF4')}
      >
        {shared ? (
          <><span>✅</span>{isAr ? 'شُورك!' : 'Shared!'}</>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            {isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
          </>
        )}
      </button>
    </div>
  )
}
