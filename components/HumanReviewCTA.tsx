'use client'

import { useState } from 'react'
import { RiskLevel } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'

interface Props {
  riskLevel?: RiskLevel
  confidenceLevel?: 'high' | 'medium' | 'low' | 'unknown'
  context?: string
  transactionId?: string
  documentId?: string
  alwaysShow?: boolean
  onRequest?: (data: { type: string; summary: string; urgency: string }) => void
  lang?: 'ar' | 'en'
}

const RISK_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3, unknown: 0 }
const CONF_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1, unknown: 0 }

export default function HumanReviewCTA({
  riskLevel = 'unknown',
  confidenceLevel = 'unknown',
  context,
  alwaysShow = false,
  onRequest,
}: Props) {
  const { isAr } = useLanguage()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('legal')
  const [summary, setSummary] = useState(context || '')
  const [urgency, setUrgency] = useState('normal')
  const [submitted, setSubmitted] = useState(false)

  const shouldShow =
    alwaysShow ||
    RISK_ORDER[riskLevel] >= RISK_ORDER.high ||
    CONF_ORDER[confidenceLevel] <= CONF_ORDER.low

  if (!shouldShow) return null

  const handleSubmit = () => {
    if (!summary.trim()) return
    onRequest?.({ type, summary, urgency })
    setSubmitted(true)
    setOpen(false)
  }

  const isCritical = riskLevel === 'critical'

  if (submitted) {
    return (
      <div dir="rtl" style={{
        background: '#FFFBEB', border: '1.5px solid #FDE68A',
        borderRadius: 14, padding: '14px 16px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#78350F', margin: '0 0 3px' }}>{isAr ? 'تم إرسال طلب المراجعة' : 'Review Request Sent'}</p>
        <p style={{ fontSize: 11.5, color: '#78350F', margin: 0 }}>{isAr ? 'سيتواصل معك أحد المختصين قريباً' : 'A specialist will contact you shortly'}</p>
      </div>
    )
  }

  return (
    <div dir="rtl" style={{
      background: isCritical ? '#F8EDEF' : '#FAFAF8',
      border: `1.5px solid ${isCritical ? 'rgba(143,29,44,0.3)' : 'rgba(143,29,44,0.15)'}`,
      borderRadius: 14, padding: '14px 16px',
      fontFamily: "'Cairo','Inter',sans-serif",
      animation: 'fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
          background: isCritical ? '#8F1D2C' : 'rgba(143,29,44,0.1)',
          border: `1.5px solid ${isCritical ? 'transparent' : 'rgba(143,29,44,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isCritical ? '#fff' : '#8F1D2C'} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#191713', margin: '0 0 3px' }}>
            {isAr ? 'هل تحتاج مراجعة قانونية؟' : 'Do you need legal review?'}
          </p>
          <p style={{ fontSize: 11.5, color: '#69645C', margin: 0, lineHeight: 1.55 }}>
            {isCritical
              ? (isAr ? 'هذه المعاملة تنطوي على مخاطر حرجة — يُلزم مراجعة محامٍ أو مختص قبل المضي.' : 'This transaction carries critical risks — a lawyer or specialist review is required before proceeding.')
              : (isAr ? 'المعاملة تنطوي على تعقيدات — يُنصح بمراجعة محامٍ أو مختص لضمان صحة الإجراءات.' : 'The transaction involves complexities — consulting a lawyer or specialist is advised to ensure procedural correctness.')}
          </p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="review-form"
          onClick={() => setOpen(true)}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)',
            color: '#fff', border: 'none', borderRadius: 11,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 3px 10px rgba(143,29,44,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 16px rgba(143,29,44,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(143,29,44,0.25)' }}
        >
          {isAr ? 'اطلب مراجعة بشرية' : 'Request Human Review'}
        </button>
      ) : (
        <div id="review-form" style={{ borderTop: '1px solid #E6E2DC', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp 0.2s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div>
            <label htmlFor="review-type" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>{isAr ? 'نوع المراجعة' : 'Review Type'}</label>
            <select
              id="review-type"
              aria-label={isAr ? 'نوع المراجعة' : 'Review type'}
              value={type}
              onChange={e => setType(e.target.value)}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #E6E2DC',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', color: '#191713',
              }}
            >
              <option value="legal">{isAr ? 'استشارة قانونية' : 'Legal Consultation'}</option>
              <option value="administrative">{isAr ? 'مراجعة إدارية' : 'Administrative Review'}</option>
              <option value="urgent">{isAr ? 'طارئة — أحتاج مساعدة فورية' : 'Urgent — I need immediate help'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="review-summary" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>{isAr ? 'وصف الحالة' : 'Case Description'}</label>
            <textarea
              id="review-summary"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder={isAr ? 'اشرح بإيجاز ما تحتاج المساعدة فيه...' : 'Briefly describe what you need help with...'}
              rows={3}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #E6E2DC',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', resize: 'none', color: '#191713',
                lineHeight: 1.5, transition: 'border-color 0.18s, box-shadow 0.18s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(143,29,44,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label htmlFor="review-urgency" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>{isAr ? 'الأولوية' : 'Priority'}</label>
            <select
              id="review-urgency"
              aria-label={isAr ? 'الأولوية' : 'Priority'}
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #E6E2DC',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', color: '#191713',
              }}
            >
              <option value="normal">{isAr ? 'عادي' : 'Normal'}</option>
              <option value="urgent">{isAr ? 'عاجل' : 'Urgent'}</option>
              <option value="very_urgent">{isAr ? 'عاجل جداً' : 'Very Urgent'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!summary.trim()}
              style={{
                flex: 1, padding: '10px',
                background: !summary.trim() ? '#D4C5B0' : 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: summary.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              {isAr ? 'إرسال الطلب' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: '10px 16px',
                border: '1.5px solid #E6E2DC', background: '#fff',
                color: '#69645C', borderRadius: 10,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
