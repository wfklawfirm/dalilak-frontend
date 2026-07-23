'use client'

/**
 * ProcedureDocumentShare — share the document checklist via WhatsApp.
 *
 * Reads checked state from dalilak_doc_{code}_{i} LS keys.
 * Builds a formatted WhatsApp message showing ✅ ready docs and ❌ missing docs.
 *
 * Props: { code: string; docs: string[]; titleAr: string; titleEn?: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  docs: string[]
  titleAr: string
  titleEn?: string
  isAr: boolean
}

function loadChecked(code: string, count: number): boolean[] {
  try {
    const result: boolean[] = []
    for (let i = 0; i < count; i++) {
      result.push(localStorage.getItem(`dalilak_doc_${code}_${i}`) === '1')
    }
    return result
  } catch {
    return Array(count).fill(false)
  }
}

export default function ProcedureDocumentShare({ code, docs, titleAr, titleEn, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [checked, setChecked] = useState<boolean[]>([])
  const [shared, setShared] = useState(false)

  useEffect(() => {
    setMounted(true)
    setChecked(loadChecked(code, docs.length))

    // Re-read on checklist changes
    function onUpdate() { setChecked(loadChecked(code, docs.length)) }
    window.addEventListener('dalilak_saved_change', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('dalilak_saved_change', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [code, docs.length])

  if (!mounted || docs.length === 0) return null

  const doneCount  = checked.filter(Boolean).length
  const missingCount = docs.length - doneCount

  function share() {
    const title = isAr ? titleAr : (titleEn || titleAr)
    const ready  = docs.filter((_, i) => checked[i])
    const missing = docs.filter((_, i) => !checked[i])

    const lines: string[] = [
      `📋 *${title}*`,
      isAr ? `📌 الوثائق المطلوبة (${docs.length})` : `📌 Required documents (${docs.length})`,
      '',
    ]

    if (ready.length > 0) {
      lines.push(isAr ? `✅ جاهزة (${ready.length}):` : `✅ Ready (${ready.length}):`)
      ready.forEach(d => lines.push(`  • ${d}`))
      lines.push('')
    }

    if (missing.length > 0) {
      lines.push(isAr ? `❌ ناقصة (${missing.length}):` : `❌ Missing (${missing.length}):`)
      missing.forEach(d => lines.push(`  • ${d}`))
      lines.push('')
    }

    lines.push(isAr ? '🔗 عبر دليلك: dalilak.vercel.app' : '🔗 Via Dalilak: dalilak.vercel.app')

    const text = lines.join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={share}
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 20,
        background: shared ? '#D1FAE5' : '#DCFCE7',
        border: `1.5px solid ${shared ? 'rgba(16,185,129,0.5)' : '#86EFAC'}`,
        cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 10, fontWeight: 700, color: shared ? '#059669' : '#166534',
        transition: 'background 0.2s, border 0.2s',
        marginBottom: 6,
      }}
      onMouseEnter={e => !shared && (e.currentTarget.style.background = '#BBF7D0')}
      onMouseLeave={e => !shared && (e.currentTarget.style.background = '#DCFCE7')}
    >
      {shared ? (
        <><span style={{ fontSize: 13 }}>✅</span>{isAr ? 'تمت المشاركة!' : 'Shared!'}</>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          {isAr
            ? `مشاركة (${doneCount}✅ / ${missingCount}❌)`
            : `Share checklist (${doneCount}✅ / ${missingCount}❌)`
          }
        </>
      )}
    </button>
  )
}
