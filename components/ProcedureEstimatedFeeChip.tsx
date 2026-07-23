'use client'

/**
 * ProcedureEstimatedFeeChip — compact fee badge for procedure cards.
 *
 * Parses the raw fees string to extract a quick estimate:
 *   "مجاني" / "Free" → green
 *   < 100,000 LBP → light blue
 *   100k–999k LBP → amber
 *   >= 1,000,000 LBP → red
 *   Stamp-only → gray
 *   Unknown/varies → gray
 *
 * Shows: 💰 أقل من 100,000 LBP | مجاني | طابع فقط | يتفاوت
 *
 * Props: { fees: string; fees_en?: string; isAr: boolean }
 */

import React from 'react'

interface Props {
  fees: string
  fees_en?: string
  isAr: boolean
}

type FeeCategory = 'free' | 'stamp' | 'low' | 'mid' | 'high' | 'varies'

interface ParseResult {
  cat: FeeCategory
  maxAmount: number | null
}

function parseFeesAr(fees: string): ParseResult {
  const f = fees.toLowerCase()

  if (f.includes('مجاني') || f.includes('مجانا') || f.includes('بدون رسوم') || f.includes('دون رسوم')) {
    return { cat: 'free', maxAmount: null }
  }
  if ((f.includes('طابع') || f.includes('stamp')) && !f.match(/\d{5,}/)) {
    return { cat: 'stamp', maxAmount: 1000 }
  }

  // Extract all numeric values
  const nums = (f.match(/[\d,]+/g) || [])
    .map(m => parseInt(m.replace(/,/g, ''), 10))
    .filter(n => !isNaN(n) && n > 100)

  if (nums.length === 0) return { cat: 'varies', maxAmount: null }

  const max = Math.max(...nums)
  if (max >= 1_000_000) return { cat: 'high', maxAmount: max }
  if (max >= 100_000)   return { cat: 'mid',  maxAmount: max }
  return { cat: 'low', maxAmount: max }
}

const CONFIGS: Record<FeeCategory, {
  bg: string; border: string; color: string;
  labelAr: string; labelEn: string; icon: string
}> = {
  free:   { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', labelAr: 'مجاني',       labelEn: 'Free',         icon: '🆓' },
  stamp:  { bg: '#F5F3FF', border: '#DDD6FE', color: '#4C1D95', labelAr: 'طابع فقط',    labelEn: 'Stamp only',   icon: '📮' },
  low:    { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8', labelAr: 'رسوم منخفضة', labelEn: 'Low fee',      icon: '💙' },
  mid:    { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', labelAr: 'رسوم متوسطة', labelEn: 'Mid fee',      icon: '💛' },
  high:   { bg: '#FEF2F2', border: '#FECACA', color: '#991B1B', labelAr: 'رسوم مرتفعة', labelEn: 'High fee',     icon: '🔴' },
  varies: { bg: '#F5F3EE', border: '#D1CBC4', color: '#6B5A4A', labelAr: 'رسوم متغيرة', labelEn: 'Varies',       icon: '📊' },
}

function formatAmount(n: number, isAr: boolean): string {
  const formatted = isAr
    ? n.toLocaleString('ar-EG')
    : n.toLocaleString('en-US')
  return isAr ? `${formatted} ل.ل.` : `${formatted} LBP`
}

export default function ProcedureEstimatedFeeChip({ fees, fees_en, isAr }: Props) {
  if (!fees) return null

  const { cat, maxAmount } = parseFeesAr(fees)
  const conf = CONFIGS[cat]

  const label = isAr ? conf.labelAr : conf.labelEn
  const sub = maxAmount && cat !== 'stamp' && cat !== 'free'
    ? (isAr ? `حتى ${formatAmount(maxAmount, true)}` : `Up to ${formatAmount(maxAmount, false)}`)
    : null

  return (
    <span
      title={isAr ? fees : (fees_en || fees)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '2px 8px', borderRadius: 20,
        background: conf.bg, border: `1px solid ${conf.border}`,
        verticalAlign: 'middle',
      }}
      aria-label={`${isAr ? 'الرسوم' : 'Fees'}: ${label}${sub ? ' — ' + sub : ''}`}
    >
      <span style={{ fontSize: 10, lineHeight: 1 }}>{conf.icon}</span>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: conf.color, lineHeight: 1 }}>
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: 8.5, color: conf.color, opacity: 0.7, lineHeight: 1 }}>
          {sub}
        </span>
      )}
    </span>
  )
}
