'use client'

import React, { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocConflict {
  type: 'name_mismatch' | 'date_mismatch' | 'number_mismatch' | 'missing_signature' | 'missing_stamp' | 'expired' | 'amount_mismatch' | 'missing_page' | 'other'
  severity: 'warning' | 'critical'
  messageAr: string
  messageEn?: string
  affectedDocs: string[]
  suggestion?: string
}

export interface MultiDocConsistency {
  transactionId?: string
  documentCount: number
  checkedAt?: string
  conflicts: DocConflict[]
  missingDocs: Array<{ titleAr: string; priority: 'low' | 'medium' | 'high' | 'critical' }>
  completionScore: number   // 0-100
  readinessStatus: 'not_ready' | 'partially_ready' | 'ready_for_review' | 'ready_to_submit'
  summaryAr: string
}

interface Props {
  data: MultiDocConsistency
  isAr?: boolean
  onRequestReview?: () => void
}

const CONFLICT_ICONS: Record<string, string> = {
  name_mismatch: '👤',
  date_mismatch: '📅',
  number_mismatch: '🔢',
  missing_signature: '✍️',
  missing_stamp: '🏛️',
  expired: '⏰',
  amount_mismatch: '💰',
  missing_page: '📄',
  other: '⚠️',
}

const STATUS_CONFIG = {
  not_ready:        { ar: 'غير جاهز',          color: '#ef4444', bg: '#fef2f2' },
  partially_ready:  { ar: 'جاهز جزئياً',       color: '#f59e0b', bg: '#fffbeb' },
  ready_for_review: { ar: 'جاهز للمراجعة',     color: '#3b82f6', bg: '#eff6ff' },
  ready_to_submit:  { ar: 'جاهز للتقديم',      color: '#22c55e', bg: '#f0fdf4' },
}

export default function MultiDocumentConsistencyPanel({ data, isAr = true, onRequestReview }: Props) {
  const [showAll, setShowAll] = useState(false)
  const statusCfg = STATUS_CONFIG[data.readinessStatus]
  const criticalConflicts = data.conflicts.filter(c => c.severity === 'critical')
  const warningConflicts  = data.conflicts.filter(c => c.severity === 'warning')
  const visibleConflicts  = showAll ? data.conflicts : data.conflicts.slice(0, 3)

  // ── Completion arc (CSS) ───────────────────────────────────────────────────
  const score = Math.min(100, Math.max(0, data.completionScore))
  const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      overflow: 'hidden', fontFamily: 'Cairo, Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f8f4f0 0%, #faf8f5 100%)',
        padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>
            {isAr ? '🔍 تحليل تناسق الملف' : '🔍 File Consistency Analysis'}
          </div>
          <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
            {isAr ? `${data.documentCount} مستندات مُحللة` : `${data.documentCount} documents analyzed`}
          </div>
        </div>
        {/* Score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</div>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 4,
            background: statusCfg.bg, color: statusCfg.color,
          }}>
            {isAr ? statusCfg.ar : data.readinessStatus.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Summary */}
        {data.summaryAr && (
          <p style={{ fontSize: 12.5, color: '#374151', margin: '0 0 14px', lineHeight: 1.7, direction: isAr ? 'rtl' : 'ltr' }}>
            {data.summaryAr}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
            <span>{isAr ? 'جاهزية الملف' : 'File Readiness'}</span>
            <span>{score}%</span>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${score}%`, height: '100%', background: scoreColor,
              borderRadius: 99, transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Conflict counts */}
        {data.conflicts.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {criticalConflicts.length > 0 && (
              <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>{criticalConflicts.length}</div>
                <div style={{ fontSize: 10, color: '#991b1b', fontWeight: 600 }}>{isAr ? 'تعارض حرج' : 'Critical'}</div>
              </div>
            )}
            {warningConflicts.length > 0 && (
              <div style={{ flex: 1, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>{warningConflicts.length}</div>
                <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600 }}>{isAr ? 'تحذير' : 'Warning'}</div>
              </div>
            )}
            {data.missingDocs.length > 0 && (
              <div style={{ flex: 1, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>{data.missingDocs.length}</div>
                <div style={{ fontSize: 10, color: '#4c1d95', fontWeight: 600 }}>{isAr ? 'ناقص' : 'Missing'}</div>
              </div>
            )}
          </div>
        )}

        {/* Conflict list */}
        {data.conflicts.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              {isAr ? '📋 التعارضات المكتشفة' : '📋 Detected Conflicts'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visibleConflicts.map((c, i) => (
                <div key={i} style={{
                  background: c.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${c.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
                  borderRadius: 10, padding: '10px 12px', direction: isAr ? 'rtl' : 'ltr',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{CONFLICT_ICONS[c.type] || '⚠️'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.severity === 'critical' ? '#991b1b' : '#92400e' }}>
                        {c.messageAr}
                      </div>
                      {c.affectedDocs.length > 0 && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                          {isAr ? 'المستندات: ' : 'Docs: '}{c.affectedDocs.join(' · ')}
                        </div>
                      )}
                      {c.suggestion && (
                        <div style={{ fontSize: 11, color: '#374151', marginTop: 4, padding: '4px 8px', background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>
                          💡 {c.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {data.conflicts.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} style={{
                marginTop: 8, fontSize: 11.5, color: '#6b7280', background: 'none',
                border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
              }}>
                {showAll ? (isAr ? 'عرض أقل' : 'Show less') : (isAr ? `+ ${data.conflicts.length - 3} تعارض آخر` : `+ ${data.conflicts.length - 3} more`)}
              </button>
            )}
          </div>
        )}

        {/* Missing docs */}
        {data.missingDocs.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              {isAr ? '📎 مستندات ناقصة' : '📎 Missing Documents'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.missingDocs.slice(0, 4).map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 12px', background: '#f9fafb', borderRadius: 8,
                  direction: isAr ? 'rtl' : 'ltr',
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                    background: d.priority === 'critical' ? '#fef2f2' : d.priority === 'high' ? '#fffbeb' : '#f5f3ff',
                    color: d.priority === 'critical' ? '#ef4444' : d.priority === 'high' ? '#f59e0b' : '#7c3aed',
                  }}>
                    {d.priority === 'critical' ? (isAr ? 'إلزامي' : 'Required') : (isAr ? 'مهم' : 'Important')}
                  </span>
                  <span style={{ fontSize: 12.5, color: '#374151', flex: 1 }}>{d.titleAr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No issues state */}
        {data.conflicts.length === 0 && data.missingDocs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#22c55e' }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
              {isAr ? 'الملف متناسق — لا تعارضات' : 'File is consistent — no conflicts'}
            </div>
          </div>
        )}

        {/* CTA */}
        {(criticalConflicts.length > 0 || data.readinessStatus !== 'ready_to_submit') && onRequestReview && (
          <button onClick={onRequestReview} style={{
            width: '100%', padding: '11px 16px', marginTop: 4,
            background: 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            👨‍⚖️ {isAr ? 'اطلب مراجعة بشرية' : 'Request Human Review'}
          </button>
        )}
      </div>
    </div>
  )
}
