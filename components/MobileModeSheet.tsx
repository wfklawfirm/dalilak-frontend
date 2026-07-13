'use client'

import React from 'react'

type ResponseMode = 'quick' | 'detailed' | 'research'

interface ModeOption {
  id: ResponseMode
  icon: string
  label_ar: string
  label_en: string
  hint_ar: string
  hint_en: string
}

const MODES: ModeOption[] = [
  {
    id: 'quick',
    icon: '⚡',
    label_ar: 'سريع',
    label_en: 'Quick',
    hint_ar: 'جواب مختصر وواضح في ثوانٍ',
    hint_en: 'Short clear answer in seconds',
  },
  {
    id: 'detailed',
    icon: '📋',
    label_ar: 'مفصّل',
    label_en: 'Detailed',
    hint_ar: 'المستندات + الخطوات + الجهة + الرسوم',
    hint_en: 'Documents + Steps + Authority + Fees',
  },
  {
    id: 'research',
    icon: '🔍',
    label_ar: 'بحث وافٍ',
    label_en: 'Research',
    hint_ar: 'تقرير شامل مع مصادر وتحليل أعمق',
    hint_en: 'Full report with sources and deep analysis',
  },
]

interface MobileModeSheetProps {
  isOpen: boolean
  onClose: () => void
  mode: ResponseMode
  onSelect: (m: ResponseMode) => void
  isAr: boolean
}

/** Bottom sheet that slides up on mobile to select response mode */
export function MobileModeSheet({ isOpen, onClose, mode, onSelect, isAr }: MobileModeSheetProps) {
  if (!isOpen) return null
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 200,
        backdropFilter: 'blur(1px)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 201,
        background: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -6px 32px rgba(0,0,0,0.15)',
        padding: '0 0 32px',
        animation: 'sheetUp 0.22s cubic-bezier(0.34,1.1,0.64,1)',
      }}>
        <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Title */}
        <div style={{ padding: '4px 20px 14px', borderBottom: '1px solid #F0EBE0' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: 0 }}>
            {isAr ? 'اختر وضع الجواب' : 'Choose Response Mode'}
          </h3>
        </div>

        {/* Options */}
        <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODES.map(m => {
            const active = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => { onSelect(m.id); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 14,
                  border: `1.5px solid ${active ? '#8B1A1A' : '#EAE4D9'}`,
                  background: active ? '#FEF2F2' : '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: isAr ? 'right' : 'left',
                  transition: 'all 0.15s',
                }}
                onTouchStart={e => { if (!active) e.currentTarget.style.background = '#FAFAF8' }}
                onTouchEnd={e => { if (!active) e.currentTarget.style.background = '#fff' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: active ? 'rgba(139,26,26,0.1)' : '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#8B1A1A' : '#1A1208' }}>
                    {isAr ? m.label_ar : m.label_en}
                  </div>
                  <div style={{ fontSize: 11, color: '#9C8E80', marginTop: 2 }}>
                    {isAr ? m.hint_ar : m.hint_en}
                  </div>
                </div>
                {active && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

/** Inline pill selector — for desktop */
export function DesktopModeSelector({
  mode, onSelect, isAr,
}: {
  mode: ResponseMode
  onSelect: (m: ResponseMode) => void
  isAr: boolean
}) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: '#F3F4F6', borderRadius: 999, padding: '3px', gap: 2,
    }}>
      {MODES.map(m => {
        const active = mode === m.id
        return (
          <button key={m.id} type="button"
            onClick={() => onSelect(m.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 16px', borderRadius: 999, fontSize: 12,
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: active ? '#fff' : 'transparent',
              color: active ? '#8B1A1A' : '#9ca3af',
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              fontFamily: 'inherit', transition: 'all 0.18s ease',
            }}>
            <span style={{ fontSize: 13 }}>{m.icon}</span>
            <span>{isAr ? m.label_ar : m.label_en}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Smart selector — shows button on mobile, pills on desktop */
export default function ModeSelector({
  mode, onSelect, isAr,
}: {
  mode: ResponseMode
  onSelect: (m: ResponseMode) => void
  isAr: boolean
}) {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const current = MODES.find(m => m.id === mode)!

  return (
    <>
      {/* Mobile: single button */}
      <div className="mode-mobile">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 20,
            background: '#F3F4F6', border: '1.5px solid #E5E7EB',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 600, color: '#8B1A1A',
          }}
        >
          <span>{current.icon}</span>
          <span>{isAr ? current.label_ar : current.label_en}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {/* Desktop: pill row */}
      <div className="mode-desktop">
        <DesktopModeSelector mode={mode} onSelect={onSelect} isAr={isAr} />
      </div>

      {/* Sheet */}
      <MobileModeSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mode={mode}
        onSelect={onSelect}
        isAr={isAr}
      />
    </>
  )
}
