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
  high:     { label: 'عالٍ',     bg: '#FFF7ED', text: '#ea580c', border: '#FED7AA', barColor: '#ea580c', iconBg: '#ea580c' },
  critical: { label: 'حرج',      bg: '#FEF2F2', text: '#8B1A1A', border: '#FECACA', barColor: '#8B1A1A', iconBg: '#8B1A1A' },
  unknown:  { label: 'غير محدد', bg: '#EAE4D9', text: '#5C4A3A', border: '#D5CEC4', barColor: '#9C8E80', iconBg: '#9C8E80' },
}

const ACTION_COLORS: Record<string, string> = {
  continue:      '#78350F',
  verify:        '#B8860B',
  lawyer_review: '#ea580c',
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
            background: cfg.barColor,
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
            }}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Action button */}
      {action && ACTION_LABELS[action] && (
        <button
          onClick={onRequestReview}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12,
            border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${ACTION_COLORS[action] || '#8B1A1A'} 0%, ${action === 'admin_review' || action === 'human_support' ? '#6b2737' : ACTION_COLORS[action]} 100%)`,
            color: '#fff', fontSize: 13, fontWeight: 700,
            fontFamily: 'inherit',
            boxShadow: `0 3px 10px ${ACTION_COLORS[action] || '#8B1A1A'}40`,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {ACTION_LABELS[action]}
        </button>
      )}

      {/* Disclaimer */}
      <p style={{ fontSize: 10.5, color: '#9C8E80', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
        تقييم أولي — لا يُعدّ استشارة قانونية
      </p>
    </div>
  )
}
