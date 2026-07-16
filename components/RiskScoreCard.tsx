'use client'

import { RiskLevel, RecommendedAction } from '@/lib/types'

interface RiskProps {
  risk: {
    level: RiskLevel
    score?: number
    reasons?: string[]
    recommendedAction?: RecommendedAction | string
  }
  onRequestReview?: () => void
  compact?: boolean
  lang?: 'ar' | 'en'
}

const LEVEL_CONFIG: Record<string, {
  label: string
  bg: string
  text: string
  border: string
  barColor: string
  iconBg: string
}> = {
  low:      { label: 'منخفض',    bg: '#FFFBEB', text: '#78350F', border: '#FDE68A', barColor: '#B45309', iconBg: '#B45309' },
  medium:   { label: 'متوسط',    bg: '#FFFBEB', text: '#B8860B', border: '#FDE68A', barColor: '#B8860B', iconBg: '#B8860B' },
  high:     { label: 'عالٍ',     bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', barColor: '#B45309', iconBg: '#B45309' },
  critical: { label: 'حرج',      bg: '#FEF2F2', text: '#8B1A1A', border: '#FECACA', barColor: '#8B1A1A', iconBg: '#8B1A1A' },
  unknown:  { label: 'غير محدد', bg: '#EAE4D9', text: '#5C4A3A', border: '#D5CEC4', barColor: '#9C8E80', iconBg: '#9C8E80' },
}

const ACTION_COLORS: Record<string, string> = {
  continue:      '#78350F',
  verify:        '#B8860B',
  lawyer_review: '#B45309',
  admin_review:  '#8B1A1A',
  human_support: '#8B1A1A',
}
const ACTION_LABELS: Record<string, string> = {
  continue:      'استمر في المعاملة',
  verify:        'تحقق من المعلومات',
  lawyer_review: 'راجع محامياً',
  admin_review:  'راجع المشرف',
  human_support: 'اطلب دعم بشري',
}

export default function RiskScoreCard({ risk, onRequestReview, compact = false }: RiskProps) {
  const level = risk.level || 'unknown'
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown
  const action = risk.recommendedAction as string | undefined
  const score = risk.score ?? null
  const reasons = risk.reasons || []

  const icon = level === 'low'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    : level === 'medium'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01"/></svg>
    : level === 'critical'
    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>

  return (
    <>
    <style>{`@keyframes rscIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } } @keyframes rscItem { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }`}</style>
    <div
      dir="rtl"
      style={{
        borderRadius: 16,
        border: `1.5px solid ${cfg.border}`,
        background: cfg.bg,
        padding: compact ? 12 : 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: "'Cairo','Inter',sans-serif",
        animation: 'rscIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: '50%',
            background: cfg.iconBg, flexShrink: 0,
          }}>
            {icon}
          </span>
          <div>
            <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0, lineHeight: 1 }}>مستوى المخاطرة</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: cfg.text, margin: '2px 0 0' }}>{cfg.label}</p>
          </div>
        </div>
        {score !== null && (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>النقاط</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: cfg.text, margin: '2px 0 0' }}>{score}</p>
          </div>
        )}
      </div>

      {/* Score bar */}
      {score !== null && !compact && (
        <div style={{ width: '100%', background: '#EAE4D9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, score)}%`,
            background: level === 'critical'
              ? 'linear-gradient(90deg, #6b2737, #8B1A1A)'
              : level === 'high'
              ? 'linear-gradient(90deg, #92400E, #B45309)'
              : level === 'medium'
              ? 'linear-gradient(90deg, #B8860B, #CA8A04)'
              : 'linear-gradient(90deg, #78350F, #B45309)',
            boxShadow: level === 'critical'
              ? '0 0 6px rgba(139,26,26,0.35)'
              : level === 'high'
              ? '0 0 6px rgba(234,88,12,0.35)'
              : '0 0 6px rgba(184,134,11,0.3)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      )}

      {/* Reasons */}
      {reasons.length > 0 && !compact && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {reasons.map((r, i) => (
            <span key={i} style={{
              fontSize: 10.5, padding: '2px 9px', borderRadius: 20,
              border: `1px solid ${cfg.border}`, color: cfg.text,
              background: 'rgba(255,255,255,0.7)',
              animation: 'rscItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 8) * 0.05}s`,
            }}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Action button */}
      {action && ACTION_LABELS[action] && (
        <button
          type="button"
          onClick={onRequestReview}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12,
            