'use client'

/**
 * ProcedureShareButton — WhatsApp + copy-link share button for a single procedure.
 *
 * Composes a WhatsApp message with:
 *   - Procedure title (bilingual)
 *   - Ministry
 *   - Required documents count
 *   - Fee (if available)
 *   - Processing time (if available)
 *   - Link to /procedures#proc-CODE
 *
 * Shows copy-link fallback when Web Share API not available.
 * Displays "Copied!" / "Shared!" feedback for 1.5s.
 */

import React, { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import type { EnrichedProcedure } from '@/lib/enrichedProcedures'

interface Props {
  procedure: EnrichedProcedure
  /** Base URL for the link (defaults to window.location.origin) */
  baseUrl?: string
  /** icon-only mode — no label text */
  compact?: boolean
}

export default function ProcedureShareButton({ procedure, baseUrl, compact = false }: Props) {
  const { isAr } = useLanguage()
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const title     = isAr ? procedure.title     : (procedure.title_en     || procedure.title)
  const ministry  = isAr ? procedure.ministry  : (procedure.ministry_en  || procedure.ministry)
  const fees      = isAr ? procedure.fees      : (procedure.fees_en      || procedure.fees)
  const procTime  = isAr ? procedure.processingTime : (procedure.processingTime_en || procedure.processingTime)
  const docCount  = (isAr ? procedure.requiredDocuments : (procedure.requiredDocuments_en?.length ? procedure.requiredDocuments_en : procedure.requiredDocuments))?.length ?? 0

  function buildMessage(): string {
    const origin = (baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : 'https://dalilak.com'))
    const url = `${origin}/procedures#proc-${procedure.code}`
    const lines: string[] = [
      isAr ? `📋 *${title}*` : `📋 *${title}*`,
      isAr ? `🏛️ ${ministry}` : `🏛️ ${ministry}`,
    ]
    if (docCount > 0) lines.push(isAr ? `📄 ${docCount} وثيقة مطلوبة` : `📄 ${docCount} required documents`)
    if (fees)    lines.push(isAr ? `💰 الرسوم: ${fees.slice(0, 60)}` : `💰 Fee: ${fees.slice(0, 60)}`)
    if (procTime) lines.push(isAr ? `⏱ المدة: ${procTime}` : `⏱ Time: ${procTime}`)
    lines.push('')
    lines.push(isAr ? `🔗 عرض التفاصيل على دليلك:\n${url}` : `🔗 View details on Dalilak:\n${url}`)
    return lines.join('\n')
  }

  function buildUrl(): string {
    return `https://wa.me/?text=${encodeURIComponent(buildMessage())}`
  }

  function handleCopyLink() {
    try {
      const origin = (typeof window !== 'undefined' ? window.location.origin : 'https://dalilak.com')
      const url = `${origin}/procedures#proc-${procedure.code}`
      navigator.clipboard.writeText(url)
    } catch {}
    setStatus('copied')
    setTimeout(() => setStatus('idle'), 1500)
  }

  const waUrl = buildUrl()

  const buttonBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: compact ? '4px 8px' : '6px 12px',
    borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer',
    fontSize: compact ? 11 : 12, fontWeight: 700,
    border: '1px solid', transition: 'opacity 0.15s',
    textDecoration: 'none',
  }

  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {/* WhatsApp share */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...buttonBase,
          background: '#D1FAE5',
          borderColor: '#A7F3D0',
          color: '#065F46',
        }}
        title={isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.974-1.418A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
        {!compact && (isAr ? 'واتساب' : 'WhatsApp')}
      </a>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          ...buttonBase,
          background: status === 'copied' ? '#D1FAE5' : 'var(--surface)',
          borderColor: status === 'copied' ? '#A7F3D0' : 'var(--border)',
          color: status === 'copied' ? '#065F46' : 'var(--text-2)',
        }}
        title={isAr ? 'نسخ الرابط' : 'Copy link'}
      >
        {status === 'copied' ? '✓' : '🔗'}
        {!compact && (
          <span>
            {status === 'copied'
              ? (isAr ? 'تم النسخ' : 'Copied!')
              : (isAr ? 'نسخ الرابط' : 'Copy link')
            }
          </span>
        )}
      </button>
    </div>
  )
}
