'use client'

import { RiskLevel, RecommendedAction } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'

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

const LEVEL_CONFIG_AR: Record<string, string> = {
  low:     'منخفض',
  medium:  'متوسط',
  high:    'عالٍ',
  critical:'حرج',
  unknown: 'غير محدد',
}

const LEVEL_CONFIG_EN: Record<string, string> = {
  low:     'Low',
  medium:  'Medium',
  high:    'High',
  critical:'Critical',
  unknown: 'Unknown',
}

const LEVEL_CONFIG: Record<string, {
  bg: string
  text: string
  border: string
  barColor: string
  iconBg: string
}> = {
  low:      { bg: '#FFFBEB', text: '#78350F', border: '#FDE68A', barColor: '#B45309', iconBg: '#B45309' },
  medium:   { bg: '#FFFBEB', text: '#B8860B', border: '#FDE68A', barColor: '#B8860B', iconBg: '#B8860B' },
  high:     { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', barColor: '#B45309', iconBg: '#B45309' },
  critical: { bg: '#FEF2F2', text: '#8B1A1A', border: '#FECACA', barColor: '#8B1A1A', iconBg: '#8B1A1A' },
  unknown:  { bg: '#EAE4D9', text: '#5C4A3A', border: '#D5CEC4', barColor: '#9C8E80', iconBg: '#9C8E80' },
}

const ACTION_COLORS: Record<string, string> = {
  continue:      '#78350F',
  verify:        '#B8860B',
  lawyer_review: '#B45309',
  admin_review:  '#8B1A1A',
  human_support: '#8B1A1A',
}
const ACTION_LABELS_AR: Record<string, string> = {
  continue:      'استمر في المعاملة',
  verify:        'تحقق من المعلومات',
  lawyer_review: 'راجع محامياً',
  admin_review:  'راجع المشرف',
  human_support: 'اطلب دعم بشري',
}
const ACTION_LABELS_EN: Record<string, string> = {
  continue:      'Continue Transaction',
  verify:        'Verify Information',
  lawyer_review: 'Consult a Lawyer',
  admin_review:  'Consult Supervisor',
  human_support: 'Request Human Support',
}

export default function RiskScoreCard({ risk, onRequestReview, compact = false }: RiskProps) {
  const { isAr } = useLanguage()
  const level = risk.level || 'unknown'
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown
  const levelLabel = isAr ? (LEVEL_CONFIG_AR[level] || level) : (LEVEL_CONFIG_EN[level] || level)
  const action = risk.recommendedAction as string | undefined
  const actionLabel = action ? (isAr ? ACTION_LABELS_AR[action] : ACTION_LABELS_EN[action]) : undefined
  const score = risk.score ?? null
  const reasons = risk.reasons || []

  const icon = level === 'low'
    ? <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    : level === 'medium'
    ? <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01"/></svg>
    : level === 'critical'
    ? <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
    : <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>

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
            <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0, lineHeight: 1 }}>{isAr ? 'مستوى المخاطرة' : 'Risk Level'}</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: cfg.text, margin: '2px 0 0' }}>{levelLabel}</p>
          </div>
        </div>
        {score !== null && (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>{isAr ? 'النقاط' : 'Score'}</p>
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
      {action && actionLabel && (
        <button
          type="button"
          onClick={onRequestReview}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12,
            background: ACTION_COLORS[action] ? `linear-gradient(135deg, ${ACTION_COLORS[action]}, ${cfg.text})` : 'linear-gradient(135deg, #8B1A1A, #6b2737)',
            color: '#fff', border: 'none',
            fontSize: 12.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: `0 2px 8px ${cfg.iconBg}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'opacity 0.12s, transform 0.12s',
          }}
          aria-label={actionLabel}
          onTouchStart={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)' }}
          onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
    </>
  )
}
