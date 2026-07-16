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

const STATUS_STYLE: Record<TransactionStatus, React.CSSProperties> = {
  draft:        { background: '#EAE4D9', color: '#5C4A3A', border: '1px solid #D5CEC4' },
  in_progress:  { background: '#FEF2F2', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.2)' },
  ready:        { background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A' },
  needs_review: { background: '#FFFBEB', color: '#B8860B', border: '1px solid #FDE68A' },
  completed:    { background: 'rgba(107,39,55,0.08)', color: '#6b2737', border: '1px solid rgba(107,39,55,0.2)' },
  archived:     { background: '#EAE4D9', color: '#5C4A3A', border: '1px solid #D5CEC4' },
}

const RISK_LABEL: Record<RiskLevel, string> = {
  low:     'منخفض',
  medium:  'متوسط',
  high:    'عالٍ',
  critical:'حرج',
  unknown: 'غير محدد',
}

const RISK_DOT_COLOR: Record<RiskLevel, string> = {
  low:     '#B45309',
  medium:  '#B8860B',
  high:    '#B45309',
  critical:'#8B1A1A',
  unknown: '#9C8E80',
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

import React from 'react'

export default function TransactionFilePanel({ transaction: tx, onClose, compact = false }: Props) {
  const status = tx.status as TransactionStatus
  const riskLevel = (tx.risk_level || 'unknown') as RiskLevel
  const uploadedCount = tx.uploaded_doc_ids?.length ?? 0
  const requiredCount = tx.required_documents?.length ?? 0
  const missingCount = tx.missing_documents?.length ?? 0
  const sourcesCount = tx.sources?.length ?? 0
  const stepsCount = tx.steps?.length ?? 0
  const progressPct = requiredCount > 0 ? Math.min(100, Math.round((uploadedCount / requiredCount) * 100)) : 0

  return (
    <>
    <style>{`@keyframes tfpIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } } @keyframes tfpItem { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    <div dir="rtl" style={{
      background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
      overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Cairo','Inter',sans-serif",
      animation: 'tfpIn 0.32s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)',
        color: '#fff', padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 99, fontWeight: 700,
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', color: '#fff',
            }}>
              {STATUS_LABEL[status] || status}
            </span>
            {tx.procedure_slug && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{tx.procedure_slug}</span>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title}</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Summary */}
        {tx.summary && (
          <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', border: '1px solid #EAE4D9' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 4px' }}>الملخص</p>
            <p style={{ fontSize: 13, color: '#1A1208', lineHeight: 1.6, margin: 0 }}>{tx.summary}</p>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <StatCard label="الخطوات" value={stepsCount} />
          <StatCard label="الوثائق المطلوبة" value={requiredCount} />
          <StatCard label="الوثائق المرفوعة" value={uploadedCount} valueColor="#78350F" />
          <StatCard label="الناقص" value={missingCount} valueColor={missingCount > 0 ? '#8B1A1A' : '#1A1208'} />
        </div>

        {/* Progress bar */}
        {requiredCount > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9C8E80', marginBottom: 5 }}>
              <span>تقدم المستندات</span>
              <span style={{ fontWeight: 700, color: progressPct === 100 ? '#78350F' : '#8B1A1A' }}>{progressPct}%</span>
            </div>
            <div style={{ width: '100%', background: '#EAE4D9', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${progressPct}%`, height: 6, borderRadius: 99,
                background: progressPct === 100
                  ? 'linear-gradient(90deg, #78350F, #B45309)'
                  : 'linear-gradient(90deg, #8B1A1A, #6b2737)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Risk score */}
        {tx.risk_level && tx.risk_level !== 'unknown' ? (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 8px' }}>تقييم المخاطر</p>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: RISK_DOT_COLOR[riskLevel], flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#5C4A3A', margin: 0 }}>
              مستوى المخاطرة: <span style={{ fontWeight: 700, color: '#1A1208' }}>{RISK_LABEL[riskLevel]}</span>
            </p>
          </div>
        )}

        {/* Missing documents */}
        {missingCount > 0 && !compact && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 8px' }}>الوثائق الناقصة</p>
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
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 8px' }}>الخطوات</p>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {tx.steps.slice(0, 4).map((s, i) => {
                const visibleCount = Math.min(tx.steps.length, 4)
                const isLast = i === visibleCount - 1
                return (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch', paddingBottom: isLast ? 0 : 10, animation: 'tfpItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.07}s` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff',
                        fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(139,26,26,0.22)',
                      }}>
                        {(s.order ?? i) + 1}
                      </span>
                      {!isLast && (
                        <div style={{ width: 1.5, flex: 1, background: 'linear-gradient(to bottom, rgba(139,26,26,0.22), rgba(139,26,26,0.05))', marginTop: 4, borderRadius: 1 }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: '0 0 2px' }}>{s.title}</p>
                      {s.authority && (
                        <p style={{ fontSize: 11, color: '#9C8E80', margin: 0 }}>{s.authority}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
            {tx.steps.length > 4 && (
              <p style={{ fontSize: 11, color: '#9C8E80', marginTop: 6, textAlign: 'center' }}>
                +{tx.steps.length - 4} خطوات أخرى
              </p>
            )}
          </div>
        )}

        {/* Sources */}
        {sourcesCount > 0 && !compact && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 6px' }}>
              المستندات المرجعية ({sourcesCount})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tx.sources?.slice(0, 5).map((src, i) => (
                <span key={i} style={{ fontSize: 11, background: '#EAE4D9', color: '#5C4A3A', padding: '3px 10px', borderRadius: 99 }}>
                  {typeof src === 'string' ? src : JSON.stringify(src)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        {(tx.created_at || tx.updated_at) && (
          <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid #EAE4D9' }}>
            {tx.created_at && (
              <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>
                الإنشاء: <span style={{ color: '#5C4A3A' }}>{formatDate(tx.created_at)}</span>
              </p>
            )}
            {tx.updated_at && (
              <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>
                آخر تحديث: <span style={{ color: '#5C4A3A' }}>{formatDate(tx.updated_at)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

function StatCard({ label, value, valueColor = '#1A1208' }: { label: string; value: number; val