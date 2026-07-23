'use client'

/**
 * ProcedureApprovalTracker — "أين وصل طلبي؟" stage tracker.
 *
 * Lets the user manually track where their application stands
 * in the government approval pipeline. Stages:
 *   0 = لم يُقدَّم بعد  / Not submitted yet
 *   1 = قُدِّم الطلب    / Submitted
 *   2 = قيد المراجعة   / Under review
 *   3 = اعتُمد          / Approved / Awaiting pickup
 *   4 = اكتملت المعاملة / Completed
 *
 * LS key: dalilak_approval_stage_{code} → number 0-4
 * Clicking a stage circle sets it as current.
 * A "reset" link resets back to stage 0.
 *
 * Dispatches dalilak_saved_change when stage changes.
 *
 * Props: { code: string; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  isAr: boolean
}

const STAGES_AR = [
  { label: 'لم يُقدَّم',    icon: '📋', subAr: 'جهّز أوراقك',          subEn: 'Prepare documents' },
  { label: 'قُدِّم',         icon: '📤', subAr: 'طلبك في الانتظار',     subEn: 'Application filed' },
  { label: 'قيد المراجعة',  icon: '🔍', subAr: 'الجهة تراجع ملفّك',    subEn: 'Under review'      },
  { label: 'بانتظار التسليم', icon: '✅', subAr: 'اعتُمد — توجّه للاستلام', subEn: 'Approved — collect it' },
  { label: 'اكتملت',        icon: '🎉', subAr: 'أُنجزت المعاملة',       subEn: 'All done!'         },
]

const STAGES_EN = [
  { label: 'Not started',  icon: '📋', subAr: 'جهّز أوراقك',          subEn: 'Prepare documents' },
  { label: 'Submitted',    icon: '📤', subAr: 'طلبك في الانتظار',     subEn: 'Application filed' },
  { label: 'Under review', icon: '🔍', subAr: 'الجهة تراجع ملفّك',    subEn: 'Under review'      },
  { label: 'Approved',     icon: '✅', subAr: 'اعتُمد — توجّه للاستلام', subEn: 'Approved — collect it' },
  { label: 'Completed',    icon: '🎉', subAr: 'أُنجزت المعاملة',       subEn: 'All done!'         },
]

function lsKey(code: string) { return `dalilak_approval_stage_${code}` }

export default function ProcedureApprovalTracker({ code, isAr }: Props) {
  const [stage, setStage]   = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = parseInt(localStorage.getItem(lsKey(code)) || '0', 10)
      setStage(isNaN(saved) ? 0 : Math.min(Math.max(saved, 0), 4))
    } catch {}
  }, [code])

  function setAndSave(s: number) {
    setStage(s)
    try {
      localStorage.setItem(lsKey(code), String(s))
      window.dispatchEvent(new Event('dalilak_saved_change'))
    } catch {}
  }

  if (!mounted) return null

  const stages = isAr ? STAGES_AR : STAGES_EN

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginTop: 14, marginBottom: 6 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#191713', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>📍</span>
          {isAr ? 'أين وصل طلبي؟' : 'Where is my application?'}
        </div>
        {stage > 0 && (
          <button
            type="button"
            onClick={() => setAndSave(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#C8C2BB', fontFamily: 'inherit', fontWeight: 600 }}
          >
            {isAr ? 'إعادة تعيين' : 'Reset'}
          </button>
        )}
      </div>

      {/* Stage pills — horizontal scroll on mobile */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {stages.map((s, i) => {
          const isActive   = i === stage
          const isPast     = i < stage
          const isNext     = i === stage + 1
          const isLast     = i === stages.length - 1

          const circleColor = isActive ? '#8F1D2C' : isPast ? '#10B981' : '#D1CBC4'
          const textColor   = isActive ? '#8F1D2C' : isPast ? '#047857' : '#918B82'

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
              {/* Stage item */}
              <button
                type="button"
                onClick={() => setAndSave(i)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  minWidth: 66, maxWidth: 76, padding: '6px 4px',
                  border: isActive ? '1.5px solid #8F1D2C' : isNext ? '1.5px dashed #D1CBC4' : 'none',
                  borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                  background: isActive ? 'rgba(143,29,44,0.04)' : 'transparent',
                  transition: 'border 0.15s, background 0.15s',
                }}
                aria-pressed={isActive}
                aria-label={`${isAr ? 'تعيين المرحلة' : 'Set stage'}: ${s.label}`}
              >
                {/* Circle with emoji */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive
                    ? '#8F1D2C'
                    : isPast ? '#D1FAE5' : '#F5F3EE',
                  border: `2px solid ${circleColor}`,
                  fontSize: 16, flexShrink: 0, transition: 'background 0.15s, border 0.15s',
                }}>
                  {isPast ? '✓' : s.icon}
                </div>
                {/* Label */}
                <div style={{ fontSize: 9.5, fontWeight: 700, color: textColor, textAlign: 'center', lineHeight: 1.3 }}>
                  {s.label}
                </div>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div style={{
                  width: 20, height: 2, flexShrink: 0, alignSelf: 'center', marginBottom: 16,
                  background: i < stage ? '#10B981' : '#E6E2DC',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Current stage sub-label */}
      <div style={{ marginTop: 8, fontSize: 10.5, color: '#8F1D2C', fontWeight: 600, fontStyle: 'italic' }}>
        {stage === 0 ? '' : `${stages[stage].icon}  ${isAr ? stages[stage].subAr : stages[stage].subEn}`}
      </div>
    </div>
  )
}
