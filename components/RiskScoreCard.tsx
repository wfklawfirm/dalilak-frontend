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

const LEVEL_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; barColor: string }> = {
  low:      { label: 'منخفض',    bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200', barColor: 'bg-green-500' },
  medium:   { label: 'متوسط',    bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', barColor: 'bg-yellow-500' },
  high:     { label: 'عالٍ',     bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', barColor: 'bg-orange-500' },
  critical: { label: 'حرج',      bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200',    barColor: 'bg-red-500' },
  unknown:  { label: 'غير محدد', bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   barColor: 'bg-gray-400' },
}

const ACTION_CONFIG: Record<string, { label: string; btnClass: string }> = {
  continue:       { label: 'استمر في المعاملة',    btnClass: 'bg-green-600 hover:bg-green-700 text-white' },
  verify:         { label: 'تحقق من المعلومات',    btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  lawyer_review:  { label: 'راجع محامياً',          btnClass: 'bg-orange-600 hover:bg-orange-700 text-white' },
  admin_review:   { label: 'راجع المشرف',           btnClass: 'bg-blue-600 hover:bg-blue-700 text-white' },
  human_support:  { label: 'اطلب دعم بشري',        btnClass: 'bg-red-600 hover:bg-red-700 text-white' },
}

export default function RiskScoreCard({ risk, onRequestReview, compact = false }: RiskProps) {
  const level = risk.level || 'unknown'
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown
  const action = risk.recommendedAction as string | undefined
  const actionCfg = action ? ACTION_CONFIG[action] : null
  const score = risk.score ?? null
  const reasons = risk.reasons || []

  const icon = level === 'low' ? '✓' : level === 'medium' ? '!' : level === 'critical' ? '✕' : '⚠'

  return (
    <div
      dir="rtl"
      className={`rounded-xl border ${cfg.border} ${cfg.bg} ${compact ? 'p-3' : 'p-4'} space-y-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm
              ${level === 'low' ? 'bg-green-600 text-white'
                : level === 'medium' ? 'bg-yellow-500 text-white'
                : level === 'critical' ? 'bg-red-600 text-white'
                : 'bg-orange-600 text-white'}`}
          >
            {icon}
          </span>
          <div>
            <p className="text-xs text-gray-500 leading-none">مستوى المخاطرة</p>
            <p className={`font-bold text-base ${cfg.text}`}>{cfg.label}</p>
          </div>
        </div>
        {score !== null && (
          <div className="text-left">
            <p className="text-xs text-gray-400">النقاط</p>
            <p className={`font-bold text-lg ${cfg.text}`}>{score}</p>
          </div>
        )}
      </div>

      {/* Score bar */}
      {score !== null && !compact && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${cfg.barColor}`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      )}

      {/* Reasons */}
      {reasons.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} bg-white/60`}
            >
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Action button */}
      {actionCfg && (
        <button
          onClick={onRequestReview}
          className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${actionCfg.btnClass}`}
        >
          {actionCfg.label}
        </button>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        تقييم أولي — لا يُعدّ استشارة قانونية
      </p>
    </div>
  )
}
