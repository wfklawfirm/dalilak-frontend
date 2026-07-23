'use client'

/**
 * ProcedureDocReadinessBar — visual readiness bar for required documents.
 *
 * Each doc is a checkable chip. Checked state in LS:
 *   dalilak_doc_ready_{code}_{index} = '1'
 *
 * Shows:
 *   - Colored progress bar (0% red → 50% amber → 100% green)
 *   - Tappable doc chips (tap to toggle)
 *   - "جاهز X/N وثائق" label
 *
 * Props: { code: string; docs: string[]; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  code: string
  docs: string[]
  isAr: boolean
}

function getKey(code: string, idx: number) { return `dalilak_doc_ready_${code}_${idx}` }

function loadReady(code: string, total: number): boolean[] {
  try { return Array.from({ length: total }, (_, i) => !!localStorage.getItem(getKey(code, i))) }
  catch { return new Array(total).fill(false) }
}

function barColor(pct: number): string {
  if (pct >= 100) return '#10B981'
  if (pct >= 50) return '#F59E0B'
  return '#EF4444'
}

export default function ProcedureDocReadinessBar({ code, docs, isAr }: Props) {
  const [ready, setReady]     = useState<boolean[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setReady(loadReady(code, docs.length))
  }, [code, docs.length])

  const toggle = useCallback((idx: number) => {
    setReady(prev => {
      const next = [...prev]
      next[idx] = !next[idx]
      try {
        if (next[idx]) localStorage.setItem(getKey(code, idx), '1')
        else localStorage.removeItem(getKey(code, idx))
        window.dispatchEvent(new Event('dalilak_saved_change'))
      } catch {}
      return next
    })
  }, [code])

  const reset = useCallback(() => {
    docs.forEach((_, i) => { try { localStorage.removeItem(getKey(code, i)) } catch {} })
    setReady(new Array(docs.length).fill(false))
    try { window.dispatchEvent(new Event('dalilak_saved_change')) } catch {}
  }, [code, docs])

  if (!mounted || docs.length === 0) return null

  const doneCount = ready.filter(Boolean).length
  const pct = (doneCount / docs.length) * 100
  const color = barColor(pct)
  const allReady = doneCount === docs.length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 13,
        overflow: 'hidden', marginBottom: 10,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '9px 13px 6px', borderBottom: '1px solid #F0EDE8',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>📄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: '#191713' }}>
            {isAr ? 'جاهزية الوثائق' : 'Document Readiness'}
          </div>
          <div style={{ fontSize: 10, color: '#918B82', marginTop: 1 }}>
            {isAr
              ? `${doneCount} من ${docs.length} وثيقة جاهزة${allReady ? ' — ✅ مكتمل!' : ''}`
              : `${doneCount} of ${docs.length} ready${allReady ? ' — ✅ All set!' : ''}`}
          </div>
        </div>
        {doneCount > 0 && (
          <button type="button" onClick={reset}
            style={{ fontSize: 10, color: '#C8C2BB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            {isAr ? 'إعادة' : 'Reset'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: '#F5F3F0' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, transition: 'width 0.35s ease, background 0.35s ease',
          borderRadius: '0 4px 4px 0',
        }} />
      </div>

      {/* Doc chips */}
      <div style={{ padding: '8px 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {docs.map((doc, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
              fontSize: 10.5, fontWeight: 600, fontFamily: 'inherit',
              background: ready[i] ? '#ECFDF5' : '#F5F3F0',
              border: `1.5px solid ${ready[i] ? '#A7F3D0' : '#E6E2DC'}`,
              color: ready[i] ? '#065F46' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            {ready[i]
              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1CBC2" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
            }
            {doc}
          </button>
        ))}
      </div>

      {allReady && (
        <div style={{
          background: 'linear-gradient(90deg, #ECFDF5, #F0FDF4)',
          borderTop: '1px solid #A7F3D0', padding: '7px 13px',
          fontSize: 11, fontWeight: 800, color: '#065F46', textAlign: 'center',
        }}>
          ✅ {isAr ? 'جميع وثائقك جاهزة!' : 'All documents ready!'}
        </div>
      )}
    </div>
  )
}
