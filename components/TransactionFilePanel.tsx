'use client'

import { TransactionFile, TransactionStatus, RiskLevel } from '@/lib/types'
import RiskScoreCard from './RiskScoreCard'
import MissingDocumentsChecklist from './MissingDocumentsChecklist'

interface Props {
  transaction: TransactionFile
  onUpdate?: (tx: TransactionFile) => void
  onClose?: () => void
  lang?: 'ar' | 'en'
  compact?: boolean
}

const STATUS_LABEL: Record<TransactionStatus, string> = {
  draft:        'مسودة',
  in_progress:  'قيد التنفيذ',
  ready:        'جاهزة',
  needs_review: 'تحتاج مراجعة',
  completed:    'مكتملة',
  archived:     'محفوظة',
}

const STATUS_COLOR: Record<TransactionStatus, string> = {
  draft:        'bg-gray-100 text-gray-600 border-gray-200',
  in_progress:  'bg-blue-100 text-blue-700 border-blue-200',
  ready:        'bg-green-100 text-green-700 border-green-200',
  needs_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed:    'bg-[#6b2737]/10 text-[#6b2737] border-[#6b2737]/20',
  archived:     'bg-gray-100 text-gray-500 border-gray-200',
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low:     'منخفض',
  medium:  'متوسط',
  high:    'عالٍ',
  critical:'حرج',
  unknown: 'غير محدد',
}

const RISK_DOT: Record<RiskLevel, string> = {
  low:     'bg-green-500',
  medium:  'bg-yellow-500',
  high:    'bg-orange-500',
  critical:'bg-red-600',
  unknown: 'bg-gray-400',
}

function formatDate(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('ar-LB', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function TransactionFilePanel({ transaction: tx, onClose, compact = false }: Props) {
  const status = tx.status as TransactionStatus
  const riskLevel = (tx.risk_level || 'unknown') as RiskLevel
  const uploadedCount = tx.uploaded_doc_ids?.length ?? 0
  const requiredCount = tx.required_documents?.length ?? 0
  const missingCount = tx.missing_documents?.length ?? 0
  const sourcesCount = tx.sources?.length ?? 0
  const stepsCount = tx.steps?.length ?? 0

  return (
    <div dir="rtl" className="bg-white rounded-2xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="bg-[#6b2737] text-white px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium bg-white/20 border-white/30 text-white`}
            >
              {STATUS_LABEL[status] || status}
            </span>
            {tx.procedure_slug && (
              <span className="text-xs text-white/60">{tx.procedure_slug}</span>
            )}
          </div>
          <h2 className="font-bold text-lg leading-tight truncate">{tx.title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            aria-label="إغلاق"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Summary */}
        {tx.summary && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">الملخص</p>
            <p className="text-sm text-gray-800 leading-relaxed">{tx.summary}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="الخطوات" value={stepsCount} />
          <StatCard label="الوثائق المطلوبة" value={requiredCount} />
          <StatCard label="الوثائق المرفوعة" value={uploadedCount} color="text-green-600" />
          <StatCard label="الناقص" value={missingCount} color={missingCount > 0 ? 'text-red-600' : 'text-gray-700'} />
        </div>

        {/* Progress bar */}
        {requiredCount > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>تقدم المستندات</span>
              <span>{Math.round((uploadedCount / requiredCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-[#6b2737] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((uploadedCount / requiredCount) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Risk score */}
        {tx.risk_level && tx.risk_level !== 'unknown' ? (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">تقييم المخاطر</p>
            <RiskScoreCard
              risk={{
                level: riskLevel,
                score: tx.risk_score ?? undefined,
                reasons: tx.risk_reasons || [],
                recommendedAction: 'verify',
              }}
              compact={compact}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <span className={`w-2.5 h-2.5 rounded-full ${RISK_DOT[riskLevel]}`} />
            <p className="text-sm text-gray-600">
              مستوى المخاطرة: <span className="font-medium">{RISK_LABEL[riskLevel]}</span>
            </p>
          </div>
        )}

        {/* Missing documents */}
        {missingCount > 0 && !compact && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">الوثائق الناقصة</p>
            <MissingDocumentsChecklist
              missingDocs={tx.missing_documents}
              requiredDocs={tx.required_documents}
              uploadedDocIds={tx.uploaded_doc_ids}
            />
          </div>
        )}

        {/* Steps preview */}
        {tx.steps && tx.steps.length > 0 && !compact && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">الخطوات</p>
            <ol className="space-y-2">
              {tx.steps.slice(0, 4).map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6b2737]/10 text-[#6b2737] text-xs font-bold flex items-center justify-center mt-0.5">
                    {(s.order ?? i) + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    {s.authority && (
                      <p className="text-xs text-gray-500">{s.authority}</p>
                    )}
                  </div>
                </li>
              ))}
              {tx.steps.length > 4 && (
                <li className="text-xs text-gray-400 pr-9">... و{tx.steps.length - 4} خطوات أخرى</li>
              )}
            </ol>
          </div>
        )}

        {/* Sources */}
        {sourcesCount > 0 && !compact && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              المصادر ({sourcesCount})
            </p>
            <div className="space-y-1">
              {tx.sources.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                  {s.ministry && <span className="text-gray-400">— {s.ministry}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {tx.notes && !compact && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-yellow-700 mb-1">ملاحظات</p>
            <p className="text-xs text-yellow-800 leading-relaxed">{tx.notes}</p>
          </div>
        )}

        {/* Dates */}
        <div className="flex gap-4 text-xs text-gray-400 pt-1">
          {tx.created_at && <span>أُنشئ: {formatDate(tx.created_at)}</span>}
          {tx.updated_at && <span>آخر تحديث: {formatDate(tx.updated_at)}</span>}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'text-gray-800' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
