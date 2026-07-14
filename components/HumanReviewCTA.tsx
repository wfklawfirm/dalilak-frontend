'use client'

import { useState } from 'react'
import { RiskLevel } from '@/lib/types'

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
        background: '#F0FDF4', border: '1.5px solid #BBF7D0',
        borderRadius: 14, padding: '14px 16px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D', margin: '0 0 3px' }}>تم إرسال طلب المراجعة</p>
        <p style={{ fontSize: 11.5, color: '#16A34A', margin: 0 }}>سيتواصل معك أحد المختصين قريباً</p>
      </div>
    )
  }

  return (
    <div dir="rtl" style={{
      background: isCritical ? '#FEF2F2' : '#FFFBF9',
      border: `1.5px solid ${isCritical ? 'rgba(139,26,26,0.3)' : 'rgba(139,26,26,0.15)'}`,
      borderRadius: 14, padding: '14px 16px',
      fontFamily: "'Cairo','Inter',sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
          background: isCritical ? '#8B1A1A' : 'rgba(139,26,26,0.1)',
          border: `1.5px solid ${isCritical ? 'transparent' : 'rgba(139,26,26,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isCritical ? '#fff' : '#8B1A1A'} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 3px' }}>
            هل تحتاج مراجعة قانونية؟
          </p>
          <p style={{ fontSize: 11.5, color: '#5C4A3A', margin: 0, lineHeight: 1.55 }}>
            {isCritical
              ? 'هذه المعاملة تنطوي على مخاطر حرجة — يُلزم مراجعة محامٍ أو مختص قبل المضي.'
              : 'المعاملة تنطوي على تعقيدات — يُنصح بمراجعة محامٍ أو مختص لضمان صحة الإجراءات.'}
          </p>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%)',
            color: '#fff', border: 'none', borderRadius: 11,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 3px 10px rgba(139,26,26,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 16px rgba(139,26,26,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(139,26,26,0.25)' }}
        >
          اطلب مراجعة بشرية
        </button>
      ) : (
        <div style={{ borderTop: '1px solid #EAE4D9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>نوع المراجعة</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #EAE4D9',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', color: '#1A1208',
              }}
            >
              <option value="legal">استشارة قانونية</option>
              <option value="administrative">مراجعة إدارية</option>
              <option value="urgent">طارئة — أحتاج مساعدة فورية</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>وصف الحالة</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="اشرح بإيجاز ما تحتاج المساعدة فيه..."
              rows={3}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #EAE4D9',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', resize: 'none', color: '#1A1208',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>الأولوية</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              style={{
                width: '100%', fontSize: 13, border: '1.5px solid #EAE4D9',
                borderRadius: 10, padding: '9px 12px', background: '#FAFAF8',
                outline: 'none', fontFamily: 'inherit', color: '#1A1208',
              }}
            >
              <option value="normal">عادي</option>
              <option value="urgent">عاجل</option>
              <option value="very_urgent">عاجل جداً</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={!summary.trim()}
              style={{
                flex: 1, padding: '10px',
                background: !summary.trim() ? '#D4C5B0' : 'linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: summary.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              إرسال الطلب
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '10px 16px',
                border: '1.5px solid #EAE4D9', background: '#fff',
                color: '#5C4A3A', borderRadius: 10,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
