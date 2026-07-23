'use client'

/**
 * SavedCostSummary — total estimated fees for all saved enriched procedures.
 *
 * Reads saved items (type='enriched') from dalilak_saved_items,
 * cross-references with ENRICHED_PROCEDURES to get fee strings,
 * parses numeric values (LBP / USD), shows a total range.
 *
 * Collapses to a single chip by default; expands on click.
 * Updates live via storage event.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { loadSavedItems } from '@/lib/savedItems'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

// ── Fee parsing ───────────────────────────────────────────────────────────────

interface FeeEntry {
  code: string
  titleAr: string
  titleEn: string
  feesRaw: string
  isFree: boolean
  usdMin: number
  usdMax: number
}

/** Very rough fee extraction — handles common Lebanese fee string patterns */
function parseFeeUSD(raw: string): { min: number; max: number } {
  if (!raw) return { min: 0, max: 0 }
  const lower = raw.toLowerCase()

  // Detect free
  if (lower.includes('مجان') || lower.includes('free') || lower === '0') {
    return { min: 0, max: 0 }
  }

  // Extract all numbers from string
  const nums = Array.from(raw.matchAll(/[\d,]+/g))
    .map(m => parseInt(m[0].replace(/,/g, ''), 10))
    .filter(n => !isNaN(n) && n > 0)

  if (nums.length === 0) return { min: 0, max: 0 }

  // If values look like LBP (large numbers), convert at ~90,000 LBP/USD
  const likelyLBP = nums.some(n => n > 10000)
  const factor = likelyLBP ? 90000 : 1

  const converted = nums.map(n => Math.round(n / factor))
  return {
    min: Math.min(...converted),
    max: Math.max(...converted),
  }
}

function buildEntries(): FeeEntry[] {
  const saved = loadSavedItems().filter(i => i.type === 'enriched')
  const entries: FeeEntry[] = []

  for (const item of saved) {
    const code = item.id.replace(/^enr-/, '')
    const proc = ENRICHED_PROCEDURES.find(p => p.code === code)
    if (!proc) continue

    const feesRaw = proc.fees || ''
    const lower = feesRaw.toLowerCase()
    const isFree = !feesRaw || lower.includes('مجان') || lower.includes('free') || feesRaw === '0'
    const { min, max } = parseFeeUSD(feesRaw)

    entries.push({
      code,
      titleAr: proc.title,
      titleEn: proc.title_en || proc.title,
      feesRaw,
      isFree,
      usdMin: min,
      usdMax: max,
    })
  }

  return entries
}

export default function SavedCostSummary() {
  const { isAr } = useLanguage()
  const [entries, setEntries] = useState<FeeEntry[]>([])
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    setEntries(buildEntries())
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('dalilak_saved_change', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dalilak_saved_change', refresh)
    }
  }, [refresh])

  if (!mounted || entries.length === 0) return null

  const freeCount   = entries.filter(e => e.isFree).length
  const paidEntries = entries.filter(e => !e.isFree)
  const totalMin    = paidEntries.reduce((s, e) => s + e.usdMin, 0)
  const totalMax    = paidEntries.reduce((s, e) => s + e.usdMax, 0)
  const hasCost     = totalMax > 0

  const summaryLabel = hasCost
    ? (isAr
        ? `التكلفة التقديرية: $${totalMin}–$${totalMax} + ${freeCount} مجاني`
        : `Est. cost: $${totalMin}–$${totalMax} + ${freeCount} free`)
    : (isAr
        ? `${freeCount} معاملة — جميعها مجانية`
        : `${freeCount} saved — all free`)

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 10 }}>
      {/* Collapsed chip */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 12px', borderRadius: 20,
          background: hasCost ? '#FFF7ED' : '#F0FDF4',
          border: `1px solid ${hasCost ? '#FED7AA' : '#BBF7D0'}`,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, fontWeight: 700,
          color: hasCost ? '#92400E' : '#166534',
          width: '100%', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <span style={{ fontSize: 14 }}>{hasCost ? '💰' : '✅'}</span>
        <span style={{ flex: 1 }}>{summaryLabel}</span>
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded breakdown */}
      {open && (
        <div style={{
          marginTop: 6, padding: '10px 12px',
          background: '#FAFAF8', border: '1px solid #E6E2DC', borderRadius: 10,
          animation: 'slideDown 0.15s ease both',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {isAr ? 'تفاصيل التكاليف' : 'Cost Breakdown'}
          </div>
          {entries.map(e => (
            <div key={e.code} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 0', borderBottom: '1px solid #F0EDE8',
              fontSize: 11,
            }}>
              <span style={{ flex: 1, color: '#191713', fontWeight: 500 }}>
                {isAr ? e.titleAr : e.titleEn}
              </span>
              <span style={{
                fontWeight: 700,
                color: e.isFree ? '#10B981' : '#92400E',
                fontSize: 10.5, flexShrink: 0,
              }}>
                {e.isFree
                  ? (isAr ? 'مجاني' : 'Free')
                  : e.usdMin === e.usdMax
                    ? `$${e.usdMin}`
                    : `$${e.usdMin}–$${e.usdMax}`}
              </span>
            </div>
          ))}

          {hasCost && (
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 8, paddingTop: 6,
              borderTop: '2px solid #E6E2DC',
              fontSize: 11.5, fontWeight: 800, color: '#191713',
            }}>
              <span>{isAr ? 'المجموع التقديري' : 'Estimated Total'}</span>
              <span style={{ color: '#8F1D2C' }}>
                {totalMin === totalMax ? `$${totalMin}` : `$${totalMin}–$${totalMax}`}
              </span>
            </div>
          )}

          <p style={{ fontSize: 9.5, color: '#918B82', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
            {isAr
              ? '* تقديرات تقريبية. الأسعار الفعلية قد تختلف.'
              : '* Rough estimates. Actual fees may vary.'}
          </p>
        </div>
      )}
    </div>
  )
}
