'use client'

/**
 * PrintProcedureModal — shows a clean print-optimized procedure summary.
 * Opens as a full-screen modal with @media print styles.
 * Renders: title, authority, fees, processing time, required docs, steps, where to apply.
 * Bilingual (AR/EN).
 */

import React, { useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import type { EnrichedProcedure } from '@/lib/enrichedProcedures'

interface Props {
  procedure: EnrichedProcedure
  onClose: () => void
}

export default function PrintProcedureModal({ procedure: proc, onClose }: Props) {
  const { isAr } = useLanguage()

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Localized content
  const title    = isAr ? proc.title : (proc.title_en || proc.title)
  const ministry = isAr ? proc.ministry : (proc.ministry_en || proc.ministry)
  const docs     = isAr
    ? (proc.requiredDocuments || [])
    : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments || [])
  const steps    = isAr
    ? (proc.steps || [])
    : (proc.steps_en?.length ? proc.steps_en : proc.steps || [])
  const fees     = isAr ? proc.fees : (proc.fees_en || proc.fees)
  const time     = isAr ? proc.processingTime : (proc.processingTime_en || proc.processingTime)
  const where    = isAr ? proc.whereToApply : (proc.whereToApply_en || proc.whereToApply)

  const handlePrint = () => window.print()

  const printDate = new Date().toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Beirut',
  })

  return (
    <>
      {/* Print-only styles — hide everything except the print frame */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #dalilak-print-frame, #dalilak-print-frame * { visibility: visible !important; }
          #dalilak-print-frame {
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important;
            z-index: 99999 !important;
            background: #fff !important;
            padding: 28px 40px !important;
            overflow: visible !important;
          }
          .print-no { display: none !important; }
          .print-page-break { page-break-before: always; }
        }
        @media screen {
          #dalilak-print-frame { all: unset; }
        }
      `}</style>

      {/* Modal backdrop */}
      <div
        role="presentation"
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? `طباعة: ${title}` : `Print: ${title}`}
          dir={isAr ? 'rtl' : 'ltr'}
          style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 660,
            maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
            animation: 'fadeUp 0.2s ease both',
          }}
        >
          {/* Modal toolbar */}
          <div
            className="print-no"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderBottom: '1px solid #e6e2dc', flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🖨️</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                {isAr ? 'معاينة الطباعة' : 'Print Preview'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  padding: '7px 16px', borderRadius: 9, background: '#8F1D2C',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                🖨️ {isAr ? 'طباعة' : 'Print'}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: '1px solid #e6e2dc',
                  background: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          </div>

          {/* Scrollable preview */}
          <div style={{ overflow: 'auto', flex: 1, padding: '24px 28px' }}>
            {/* The actual printable frame */}
            <div id="dalilak-print-frame" dir={isAr ? 'rtl' : 'ltr'}>

              {/* Print header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '2px solid #8F1D2C', paddingBottom: 12, marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 10, color: '#8F1D2C', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>
                    {isAr ? 'دليلك — دليلك للمعاملات الحكومية اللبنانية' : 'DALILAK — Lebanese Government Procedures Guide'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    {isAr ? `تاريخ الطباعة: ${printDate}` : `Printed: ${printDate}`}
                  </div>
                </div>
                <div style={{ fontSize: 22, color: '#8F1D2C', fontWeight: 900 }}>دليلك</div>
              </div>

              {/* Procedure title */}
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
                {title}
              </h1>
              {proc.code && (
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 16, fontFamily: 'monospace' }}>
                  {isAr ? `رمز المعاملة: ${proc.code}` : `Procedure code: ${proc.code}`}
                </div>
              )}

              {/* Meta strip */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10,
                background: '#f8f7f5', borderRadius: 12, padding: 14, marginBottom: 22,
              }}>
                {ministry && (
                  <MetaCell icon="🏛️" labelAr="الجهة المختصة" labelEn="Authority" value={ministry} isAr={isAr} />
                )}
                {fees && (
                  <MetaCell icon="💰" labelAr="الرسوم" labelEn="Fees" value={fees} isAr={isAr} />
                )}
                {time && (
                  <MetaCell icon="⏱️" labelAr="مدة المعالجة" labelEn="Processing Time" value={time} isAr={isAr} />
                )}
                {where && (
                  <MetaCell icon="📍" labelAr="مكان التقديم" labelEn="Where to Apply" value={where} isAr={isAr} />
                )}
              </div>

              {/* Required documents */}
              {docs.length > 0 && (
                <Section
                  icon="📋"
                  titleAr="المستندات المطلوبة"
                  titleEn="Required Documents"
                  color="#1a56db"
                  isAr={isAr}
                >
                  <ol style={{ margin: 0, paddingInlineStart: 22, lineHeight: 1.8 }}>
                    {docs.map((d, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                        {d}
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* Steps */}
              {steps.length > 0 && (
                <Section
                  icon="👣"
                  titleAr="خطوات تنفيذ المعاملة"
                  titleEn="Procedure Steps"
                  color="#059669"
                  isAr={isAr}
                >
                  <ol style={{ margin: 0, paddingInlineStart: 22, lineHeight: 1.9 }}>
                    {steps.map((s, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
                        {s}
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {/* Print footer */}
              <div style={{
                marginTop: 32, paddingTop: 12, borderTop: '1px solid #e5e7eb',
                fontSize: 9, color: '#9ca3af', textAlign: isAr ? 'right' : 'left',
              }}>
                {isAr
                  ? 'هذه المعلومات مقدّمة من دليلك للأغراض الإرشادية. يُرجى التحقق من الجهات الرسمية للحصول على أحدث المعلومات.'
                  : 'This information is provided by Dalilak for guidance purposes. Please verify with official authorities for the most up-to-date information.'}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaCell({ icon, labelAr, labelEn, value, isAr }: {
  icon: string; labelAr: string; labelEn: string; value: string; isAr: boolean
}) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', marginBottom: 3 }}>
        {icon} {isAr ? labelAr : labelEn}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  )
}

function Section({ icon, titleAr, titleEn, color, isAr, children }: {
  icon: string; titleAr: string; titleEn: string; color: string; isAr: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
        borderBottom: `2px solid ${color}22`, paddingBottom: 6,
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>
          {isAr ? titleAr : titleEn}
        </span>
      </div>
      {children}
    </div>
  )
}
