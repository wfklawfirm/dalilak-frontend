'use client'

import React from 'react'
import type { TransactionCompletionScore } from '@/lib/knowledgeGraph'

interface Props {
  score: TransactionCompletionScore
  isAr: boolean
  onAction?: () => void
}

export default function TransactionScoreWidget({ score, isAr, onAction }: Props) {
  const scoreColor = score.score >= 80 ? '#78350F' : score.score >= 50 ? '#B8860B' : '#8F1D2C'
  const scoreBg = score.score >= 80 ? '#FFFBEB' : score.score >= 50 ? '#FFFBEB' : '#F8EDEF'

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
    <>
    <style>{`@keyframes tswIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } } @keyframes tswItem { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    <div style={{
      background: '#fff',
      border: `2px solid ${scoreColor}30`,
      borderRadius: 16,
      padding: '16px',
      fontFamily: "'Cairo','Inter',sans-serif",
      animation: 'tswIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
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
          <p style={{ fontSize: 14, fontWeight: 800, color: '#191713', margin: '0 0 2px' }}>
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
      <div style={{ height: 6, background: '#E6E2DC', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%',
          width: `${score.score}%`,
          background: score.score >= 80
            ? 'linear-gradient(90deg, #78350F, #B45309)'
            : score.score >= 50
            ? 'linear-gradient(90deg, #B8860B, #CA8A04)'
            : 'linear-gradient(90deg, #741622, #8F1D2C)',
          borderRadius: 3,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 6px ${score.score >= 80 ? 'rgba(180,83,9,0.35)' : score.score >= 50 ? 'rgba(184,134,11,0.3)' : 'rgba(143,29,44,0.3)'}`,
        }} />
      </div>

      {/* Breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {breakdownItems.map((item, i) => (
          <div key={item.key} style={{ animation: 'tswItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.06}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, color: '#69645C', fontWeight: 600 }}>{item.key}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: item.value >= 70 ? '#78350F' : item.value >= 40 ? '#B8860B' : '#8F1D2C' }}>{item.value}%</span>
            </div>
            <div style={{ height: 4, background: '#E6E2DC', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${item.value}%`,
                background: item.value >= 70
                  ? 'linear-gradient(90deg, #78350F, #B45309)'
                  : item.value >= 40
                  ? 'linear-gradient(90deg, #B8860B, #CA8A04)'
                  : 'linear-gradient(90deg, #741622, #8F1D2C)',
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Blocking issues */}
      {score.blockingIssues.length > 0 && (
        <div style={{ background: '#F8EDEF', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#8F1D2C', margin: '0 0 6px' }}>
            {isAr ? 'مشاكل تعيق التقدم:' : 'Blocking Issues:'}
          </p>
          {score.blockingIssues.slice(0, 3).map((issue, i) => (
            <p key={i} style={{ fontSize: 11, color: '#8F1D2C', margin: '0 0 2px', display: 'flex', gap: 6, alignItems: 'flex-start', animation: 'tswItem 0.15s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.05}s` }}>
              <span style={{ display: 'flex', flexShrink: 0 }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></svg></span> {issue}
            </p>
          ))}
        </div>
      )}

      {/* Recommended action */}
      {score.recommendedNextAction && (
        <div style={{ fontSize: 11.5, color: '#69645C', background: '#FAFAF8', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 5 }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#69645C" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H
1M4.22 4.22l-.707.707M1.64 12H3m16.36 0h1.38M4.22 19.78l.707-.707M12 21v-1m6.364-1.636l-.707-.707"/></svg></span>
            {isAr ? score.recommendedNextAction : score.recommendedNextAction}
        </div>
      )}

      {/* Action button */}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={isAr ? 'اتخاذ إجراء' : 'Take action'}
          onTouchStart={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)' }}
          onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, #8F1D2C, #741622)',
            color: '#fff', border: 'none',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
            transition: 'opacity 0.12s, transform 0.12s',
          }}
        >
          {isAr ? 'اتخاذ إجراء' : 'Take Action'}
        </button>
      )}

    </div>
    </>
  )
}
