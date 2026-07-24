'use client'

/**
 * ProcedureFilterDrawer — advanced filter panel for /procedures page.
 *
 * Appears as a bottom sheet on mobile, side panel on desktop.
 * Filters:
 *   - Has form: yes / no / any
 *   - Fee type: free / paid / any
 *   - Processing time: fast (<1 week) / normal (1-4 weeks) / slow (>4 weeks) / any
 *   - Has checklist started: yes (user has localStorage data) / any
 *
 * Props:
 *   filters  — current filter state
 *   onChange — called with updated filter state
 *   onClose  — called to close drawer
 *   totalResults — number of matching procedures (for showing "X results")
 */

import React, { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export interface ProcFilters {
  hasForm:  'any' | 'yes' | 'no'
  feeType:  'any' | 'free' | 'paid'
  speed:    'any' | 'fast' | 'normal' | 'slow'
  started:  'any' | 'yes'
}

export const DEFAULT_FILTERS: ProcFilters = {
  hasForm: 'any',
  feeType: 'any',
  speed:   'any',
  started: 'any',
}

export function hasActiveFilters(f: ProcFilters): boolean {
  return f.hasForm !== 'any' || f.feeType !== 'any' || f.speed !== 'any' || f.started !== 'any'
}

interface Props {
  filters: ProcFilters
  onChange: (f: ProcFilters) => void
  onClose: () => void
  totalResults: number
}

interface ChipGroupProps<T extends string> {
  labelAr: string
  labelEn: string
  options: { value: T; labelAr: string; labelEn: string }[]
  value: T
  onChange: (v: T) => void
  isAr: boolean
}

function ChipGroup<T extends string>({ labelAr, labelEn, options, value, onChange, isAr }: ChipGroupProps<T>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isAr ? labelAr : labelEn}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: '5px 12px', borderRadius: 8,
                background: active ? '#8F1D2C' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-2)',
                border: `1px solid ${active ? '#8F1D2C' : 'var(--border)'}`,
                fontSize: 11.5, fontWeight: active ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}
            >
              {isAr ? opt.labelAr : opt.labelEn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ProcedureFilterDrawer({ filters, onChange, onClose, totalResults }: Props) {
  const { isAr } = useLanguage()
  const [local, setLocal] = useState<ProcFilters>(filters)

  function update<K extends keyof ProcFilters>(key: K, value: ProcFilters[K]) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function apply() {
    onChange(local)
    onClose()
  }

  function reset() {
    setLocal(DEFAULT_FILTERS)
    onChange(DEFAULT_FILTERS)
  }

  const activeCount = Object.values(local).filter(v => v !== 'any').length

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'خيارات الفلترة المتقدمة' : 'Advanced filter options'}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 640,
          maxHeight: '80vh', overflow: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}
        onKeyDown={e => { if (e.key === 'Escape') onClose() }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 14px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
              {isAr ? 'فلترة متقدمة' : 'Advanced Filters'}
            </div>
            {activeCount > 0 && (
              <div style={{ fontSize: 10.5, color: '#8F1D2C', fontWeight: 600, marginTop: 2 }}>
                {isAr ? `${activeCount} فلاتر نشطة` : `${activeCount} active filters`}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isAr ? 'إغلاق الفلاتر' : 'Close filters'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-3)', padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Filter groups */}
        <div style={{ padding: '18px 18px 8px' }}>
          <ChipGroup<'any' | 'yes' | 'no'>
            labelAr="النموذج الرسمي"
            labelEn="Official Form"
            value={local.hasForm}
            onChange={v => update('hasForm', v)}
            isAr={isAr}
            options={[
              { value: 'any', labelAr: 'الكل', labelEn: 'Any' },
              { value: 'yes', labelAr: 'متوفر نموذج', labelEn: 'Has form' },
              { value: 'no',  labelAr: 'بدون نموذج',  labelEn: 'No form' },
            ]}
          />

          <ChipGroup<'any' | 'free' | 'paid'>
            labelAr="الرسوم"
            labelEn="Fees"
            value={local.feeType}
            onChange={v => update('feeType', v)}
            isAr={isAr}
            options={[
              { value: 'any',  labelAr: 'الكل',   labelEn: 'Any' },
              { value: 'free', labelAr: 'مجاني',  labelEn: 'Free' },
              { value: 'paid', labelAr: 'برسوم',  labelEn: 'Paid' },
            ]}
          />

          <ChipGroup<'any' | 'fast' | 'normal' | 'slow'>
            labelAr="سرعة الإنجاز"
            labelEn="Processing Speed"
            value={local.speed}
            onChange={v => update('speed', v)}
            isAr={isAr}
            options={[
              { value: 'any',    labelAr: 'الكل',        labelEn: 'Any' },
              { value: 'fast',   labelAr: 'سريع (<أسبوع)', labelEn: 'Fast (<1 week)' },
              { value: 'normal', labelAr: 'عادي (1-4 أسابيع)', labelEn: 'Normal (1-4 wks)' },
              { value: 'slow',   labelAr: 'طويل (>شهر)',  labelEn: 'Long (>1 month)' },
            ]}
          />

          <ChipGroup<'any' | 'yes'>
            labelAr="التقدم الشخصي"
            labelEn="Your Progress"
            value={local.started}
            onChange={v => update('started', v)}
            isAr={isAr}
            options={[
              { value: 'any', labelAr: 'الكل',             labelEn: 'Any' },
              { value: 'yes', labelAr: 'بدأت تحضيرها',     labelEn: 'Started preparing' },
            ]}
          />
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 8, padding: '0 18px calc(24px + env(safe-area-inset-bottom, 0px))', position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '11px 18px', borderRadius: 11,
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-2)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              {isAr ? 'إعادة ضبط' : 'Reset'}
            </button>
          )}
          <button
            type="button"
            onClick={apply}
            style={{
              flex: 1, padding: '11px 18px', borderRadius: 11,
              background: 'linear-gradient(135deg, #8F1D2C, #741622)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
            }}
          >
            {isAr ? `عرض ${totalResults} نتيجة` : `Show ${totalResults} results`}
          </button>
        </div>
      </div>
    </div>
  )
}
