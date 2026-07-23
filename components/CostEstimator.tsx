'use client'

/**
 * CostEstimator — حاسبة تكاليف المعاملة الحكومية
 *
 * Given a procedure's raw fees string, parses and enriches it with
 * user-specific factors (expat, urgent, agent, translation needs)
 * to produce a personalised cost breakdown.
 *
 * All amounts in USD (Lebanon's de-facto currency for gov fees post-2019).
 */

import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface CostLine {
  labelAr: string
  labelEn: string
  amount: number     // USD
  note?: string
  conditional?: boolean  // only applies when certain options selected
}

interface CostEstimatorProps {
  /** Raw fees string from the procedure data */
  feesRaw: string
  /** Number of required documents */
  docCount?: number
  /** Called to open AI for a follow-up question */
  onAsk?: (q: string) => void
  /** Procedure title (for the AI prompt) */
  titleAr?: string
  titleEn?: string
}

// ── Parse a fees string into a USD number ────────────────────────────────────
function parseFeesUSD(raw: string): number | null {
  if (!raw) return null
  // Handle "مجاني / Free"
  if (/مجاني|free|gratis/i.test(raw)) return 0

  // Try to find a USD amount: $X or X USD or X دولار
  const usdMatch = raw.match(/\$\s*([\d,]+(?:\.\d+)?)/i)
    || raw.match(/([\d,]+(?:\.\d+)?)\s*(?:USD|دولار|usd)/i)
  if (usdMatch) return parseFloat(usdMatch[1].replace(',', ''))

  // Try LBP: X,XXX,XXX ل.ل
  const lbpMatch = raw.match(/([\d,]+)\s*(?:ل\.ل|L\.L|LBP|ليرة)/i)
  if (lbpMatch) {
    const lbp = parseFloat(lbpMatch[1].replace(/,/g, ''))
    // Post-crisis rate ~89,500 LBP/USD (approximate)
    return Math.round(lbp / 89_500)
  }

  // Try to find any number in the string as a fallback
  const numMatch = raw.match(/([\d,]+(?:\.\d+)?)/)
  if (numMatch) {
    const n = parseFloat(numMatch[1].replace(',', ''))
    if (n > 10_000) return Math.round(n / 89_500) // assume LBP
    if (n < 500) return n // assume USD
    return Math.round(n / 1500) // old rate fallback
  }

  return null
}

export default function CostEstimator({
  feesRaw, docCount = 3, onAsk, titleAr, titleEn,
}: CostEstimatorProps) {
  const { isAr } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [isExpat, setIsExpat]   = useState(false)
  const [urgent,  setUrgent]    = useState(false)
  const [agent,   setAgent]     = useState(false)
  const [translate, setTranslate] = useState(false)

  const baseFee = useMemo(() => parseFeesUSD(feesRaw) ?? 20, [feesRaw])

  const lines = useMemo((): CostLine[] => {
    const result: CostLine[] = []

    // Official gov fee
    result.push({
      labelAr: 'الرسوم الرسمية',
      labelEn: 'Official Government Fee',
      amount: baseFee,
    })

    // Expat surcharge (some procedures charge more for non-residents)
    if (isExpat) {
      result.push({
        labelAr: 'رسوم إضافية للمغترب',
        labelEn: 'Expat Surcharge',
        amount: Math.round(baseFee * 0.25),
        conditional: true,
        note: isAr ? 'قد تختلف حسب الجهة' : 'May vary by authority',
      })
    }

    // Urgency premium
    if (urgent) {
      result.push({
        labelAr: 'رسوم الاستعجال',
        labelEn: 'Express / Priority Fee',
        amount: Math.max(20, Math.round(baseFee * 0.5)),
        conditional: true,
      })
    }

    // Translation (per document)
    if (translate && docCount > 0) {
      result.push({
        labelAr: `ترجمة وثائق (${docCount} × $15)`,
        labelEn: `Document Translation (${docCount} × $15)`,
        amount: docCount * 15,
        conditional: true,
        note: isAr ? 'ترجمة معتمدة تقريباً' : 'Certified translation estimate',
      })
    }

    // Notary / authentication
    if (docCount > 0) {
      result.push({
        labelAr: `كاتب العدل / التوثيق (${docCount} وثيقة × $5)`,
        labelEn: `Notary / Authentication (${docCount} docs × $5)`,
        amount: docCount * 5,
      })
    }

    // Agent / service office
    if (agent) {
      result.push({
        labelAr: 'أتعاب مكتب الخدمات',
        labelEn: 'Service Office / Agent Fee',
        amount: Math.max(30, Math.round(baseFee * 0.6)),
        conditional: true,
        note: isAr ? 'تتفاوت حسب الوقت والتعقيد' : 'Varies by complexity',
      })
    }

    // Transport estimate
    result.push({
      labelAr: 'تنقل (تقدير)',
      labelEn: 'Transportation (estimate)',
      amount: 10,
      note: isAr ? 'تكلفة الذهاب والإياب' : 'Round trip estimate',
    })

    return result
  }, [baseFee, isExpat, urgent, agent, translate, docCount, isAr])

  const total = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines])

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 12px', borderRadius: 9,
          border: '1px solid var(--border)',
          background: 'var(--surface-muted)',
          color: 'var(--text-2)', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 0.12s, color 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
      >
        <span style={{ fontSize: 14 }}>💰</span>
        {isAr ? `احسب التكلفة (≈ $${total})` : `Estimate cost (≈ $${total})`}
      </button>
    )
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface-muted)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        animation: 'fadeUp 0.15s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15 }}>💰</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
            {isAr ? 'حاسبة التكلفة' : 'Cost Estimator'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 500 }}>
            {isAr ? '(تقريبي)' : '(estimate)'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          style={{
            width: 22, height: 22, borderRadius: 5,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-3)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Options */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
      }}>
        {([
          { key: 'isExpat',   stateVal: isExpat,   setter: setIsExpat,   ar: 'مغترب', en: 'Expat' },
          { key: 'urgent',    stateVal: urgent,     setter: setUrgent,    ar: 'مستعجل', en: 'Urgent' },
          { key: 'agent',     stateVal: agent,      setter: setAgent,     ar: 'عبر وكيل', en: 'Via Agent' },
          { key: 'translate', stateVal: translate,  setter: setTranslate, ar: 'ترجمة وثائق', en: 'Need Translation' },
        ] as const).map(({ key, stateVal, setter, ar, en }) => (
          <button
            key={key}
            type="button"
            onClick={() => setter((v: boolean) => !v)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: `1px solid ${stateVal ? 'var(--brand)' : 'var(--border)'}`,
              background: stateVal ? 'var(--brand-soft)' : 'var(--surface)',
              color: stateVal ? 'var(--brand)' : 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}
          >
            {stateVal ? '✓ ' : ''}{isAr ? ar : en}
          </button>
        ))}
      </div>

      {/* Cost breakdown */}
      <div style={{ padding: '8px 0' }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '6px 14px', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: line.conditional ? 'var(--accent)' : 'var(--text-1)', fontWeight: 600 }}>
                {isAr ? line.labelAr : line.labelEn}
              </div>
              {line.note && (
                <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>{line.note}</div>
              )}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', flexShrink: 0 }}>
              ${line.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderTop: '2px solid var(--brand)',
        background: 'var(--brand-soft)',
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--brand)' }}>
          {isAr ? 'التقدير الإجمالي' : 'Total Estimate'}
        </span>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--brand)' }}>
          ${total}
        </span>
      </div>

      {/* Disclaimer + Ask CTA */}
      <div style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 10, color: 'var(--text-4)', margin: '0 0 8px', lineHeight: 1.6 }}>
          {isAr
            ? '⚠️ هذه تقديرات استرشادية. تتفاوت التكاليف الفعلية حسب الجهة والوقت وعوامل أخرى. تأكد دائماً من الجهة الرسمية.'
            : '⚠️ These are rough estimates. Actual costs vary by authority, timing, and other factors. Always verify with the official authority.'}
        </p>
        {onAsk && (
          <button
            type="button"
            onClick={() => onAsk(isAr
              ? `ما هي التكاليف الدقيقة والرسوم الرسمية لـ«${titleAr || 'هذا الإجراء'}»؟ وهل هناك رسوم إضافية للمغتربين؟`
              : `What are the exact fees and costs for "${titleEn || 'this procedure'}"? Are there extra fees for expats?`)}
            style={{
              width: '100%', padding: '8px 14px', borderRadius: 8,
              border: 'none', background: 'var(--brand)',
              color: '#fff', fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isAr ? 'اسأل دليلك عن التكاليف الدقيقة' : 'Ask Dalilak for exact costs'}
          </button>
        )}
      </div>
    </div>
  )
}
