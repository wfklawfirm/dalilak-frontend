'use client'

import React from 'react'
import type { TransactionCompletionScore } from '@/lib/knowledgeGraph'

interface Props {
  score: TransactionCompletionScore
  isAr: boolean
  onAction?: () => void
}

export default function TransactionScoreWidget({ score, isAr, onAction }: Props) {
  const scoreColor = score.score >= 80 ? '#16a34a' : score.score >= 50 ? '#B8860B' : '#DC2626'
  const scoreBg = score.score >= 80 ? '#F0FDF4' : score.score >= 50 ? '#FFFBEB' : '#FEF2F2'

  const statusLabel = score.status === 'ready_for_review'
    ? (isAr ? 'جاهز للمراجعة' : 'Ready for Review')
    : score.status === 'partially_ready'
    ? (isAr ? 'جاهز جزئياً' : 'Partially Ready')
    : (isAr ? 'غير جاهز' : 'Not Ready')

  const breakdownItems = [
    { key: isAr ? 'المستندات' : 'Documents', value: score.breakdown.documentsScore },
    { key: isAr ? 'البيانات' : 'Data', value: score.breakdown.dataScore },
    { key: isAr ? 'الاتساق' : 'Consistency', value: score.breakdown.consistencyScore },
    { key: isAr ? 'المخاطر' : 'Risks', value: score.breakdown.riskScore },
  ]

  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${scoreColor}30`,
      borderRadius: 16,
      padding: '16px',
      fontFamily: "'Cairo','Inter',sans-serif",
    }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: scoreBg,
          border: `3px solid ${scoreColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score.score}</span>
          <span style={{ fontSize: 8, color: scoreColor, fontWeight: 700 }}>/ 100</span>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: '0 0 2px' }}>
            {isAr ? 'نقاط الجاهزية' : 'Readiness Score'}
          </p>
          <span style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: scoreColor,
            background: scoreBg,
            borderRadius: 20,
            padding: '2px 10px',
          }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%',
          width: `${score.score}%`,
          background: scoreColor,
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {breakdownItems.map(item => (
          <div key={item.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>{item.key}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: item.value >= 70 ? '#16a34a' : item.value >= 40 ? '#B8860B' : '#DC2626' }}>{item.value}%</span>
            </div>
            <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${item.value}%`,
                background: item.value >= 70 ? '#16a34a' : item.value >= 40 ? '#B8860B' : '#DC2626',
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Blocking issues */}
      {score.blockingIssues.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#DC2626', margin: '0 0 6px' }}>
            {isAr ? 'مشاكل تعيق التقدم:' : 'Blocking Issues:'}
          </p>
          {score.blockingIssues.slice(0, 3).map((issue, i) => (
            <p key={i} style={{ fontSize: 11, color: '#B91C1C', margin: '0 0 2px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span>⛔</span> {issue}
            </p>
          ))}
        </div>
      )}

      {/* Recommended action */}
      {score.recommendedNextAction && (
        <div style={{ fontSize: 11.5, color: '#6B7280', background: '#F9FAFB', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
          💡 {score.recommendedNextAction}
        </div>
      )}

      {/* CTA */}
      {onAction && (
        <button
          onClick={onAction}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #8B1A1A, #6B1313)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isAr ? 'الخطوة التالية ←' : 'Next Step →'}
        </button>
      )}
    </div>
  )
}
