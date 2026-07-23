'use client'

/**
 * /settings — centralizes preference toggles that were previously only
 * reachable via scattered floating widgets (AccessibilityBar, GlobalLangSwitch,
 * ChatResponseLength). This page does NOT replace those widgets — it reads
 * and writes the SAME localStorage keys, so toggling something here or from
 * the floating widgets stays in sync either way. Purely additive: no existing
 * control was removed.
 *
 * Sections: Language, Accessibility (high contrast / large text / reduce
 * motion), Chat preferences (default response length), About.
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useLanguage } from '@/lib/LanguageContext'
import { useResponseLength, type LengthMode } from '@/components/ChatResponseLength'

const LS_HC = 'dalilak_a11y_hc'
const LS_LT = 'dalilak_a11y_lt'
const LS_RM = 'dalilak_a11y_rm'

function applyA11yClasses(hc: boolean, lt: boolean, rm: boolean) {
  const html = document.documentElement
  html.classList.toggle('dalilak-high-contrast', hc)
  html.classList.toggle('dalilak-large-text', lt)
  html.classList.toggle('dalilak-reduce-motion', rm)
}

function ToggleRow({
  icon, titleAr, titleEn, descAr, descEn, checked, onToggle, isAr,
}: {
  icon: string; titleAr: string; titleEn: string; descAr: string; descEn: string
  checked: boolean; onToggle: () => void; isAr: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '13px 16px',
        background: checked ? 'rgba(143,29,44,0.05)' : 'transparent',
        border: 'none', borderBottom: '1px solid #F0ECE5',
        cursor: 'pointer', textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>
          {isAr ? titleAr : titleEn}
        </div>
        <div style={{ fontSize: 11, color: '#918B82', marginTop: 1 }}>
          {isAr ? descAr : descEn}
        </div>
      </div>
      <div style={{
        width: 38, height: 21, borderRadius: 11, flexShrink: 0,
        background: checked ? '#8F1D2C' : '#D5CEC4',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, width: 15, height: 15,
          borderRadius: '50%', background: '#fff', transition: 'left 0.2s, right 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          [isAr ? 'right' : 'left']: checked ? 20 : 3,
        }} />
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAr, lang, toggleLang } = useLanguage()
  const { mode, setMode } = useResponseLength()

  const [mounted, setMounted] = useState(false)
  const [hc, setHc] = useState(false)
  const [lt, setLt] = useState(false)
  const [rm, setRm] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const h = localStorage.getItem(LS_HC) === '1'
      const l = localStorage.getItem(LS_LT) === '1'
      const r = localStorage.getItem(LS_RM) === '1'
      setHc(h); setLt(l); setRm(r)
    } catch {}
  }, [])

  function toggleHc() {
    const next = !hc
    setHc(next)
    try { localStorage.setItem(LS_HC, next ? '1' : '0') } catch {}
    applyA11yClasses(next, lt, rm)
  }
  function toggleLt() {
    const next = !lt
    setLt(next)
    try { localStorage.setItem(LS_LT, next ? '1' : '0') } catch {}
    applyA11yClasses(hc, next, rm)
  }
  function toggleRm() {
    const next = !rm
    setRm(next)
    try { localStorage.setItem(LS_RM, next ? '1' : '0') } catch {}
    applyA11yClasses(hc, lt, next)
  }

  const lengthOpts: Array<{ value: LengthMode; ar: string; en: string; icon: string }> = [
    { value: 'short',    ar: 'موجز',   en: 'Brief',    icon: '⚡' },
    { value: '',         ar: 'عادي',   en: 'Normal',   icon: '💬' },
    { value: 'detailed', ar: 'مفصّل',  en: 'Detailed', icon: '📖' },
  ]

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAFAF8', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E6E2DC' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={isAr ? 'رجوع' : 'Back'}
            style={{
              width: 38, height: 38, borderRadius: 9, border: '1.5px solid #E6E2DC',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#191713" strokeWidth="2.3">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#191713' }}>
              ⚙️ {isAr ? 'الإعدادات' : 'Settings'}
            </div>
            <div style={{ fontSize: 11, color: '#918B82' }}>
              {isAr ? 'تفضيلاتك في مكان واحد' : 'All your preferences in one place'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '18px 14px' }}>

        {/* Language */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 4px 8px' }}>
          {isAr ? 'اللغة' : 'Language'}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <button
            type="button"
            onClick={toggleLang}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '13px 16px', background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>🌐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>
                {isAr ? 'لغة الواجهة' : 'Interface language'}
              </div>
              <div style={{ fontSize: 11, color: '#918B82', marginTop: 1 }}>
                {isAr ? 'العربية حالياً — اضغط للتبديل إلى الإنجليزية' : 'English currently — tap to switch to Arabic'}
              </div>
            </div>
            <span style={{
              fontSize: 11.5, fontWeight: 800, color: '#8F1D2C',
              background: 'rgba(143,29,44,0.08)', borderRadius: 8, padding: '4px 10px',
            }}>
              {lang === 'ar' ? 'AR' : 'EN'}
            </span>
          </button>
        </div>

        {/* Accessibility */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 4px 8px' }}>
          {isAr ? 'إمكانية الوصول' : 'Accessibility'}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          {mounted && (
            <>
              <ToggleRow
                icon="🔲" isAr={isAr}
                titleAr="تباين عالٍ" titleEn="High Contrast"
                descAr="خلفية داكنة + نص أبيض" descEn="Dark background + white text"
                checked={hc} onToggle={toggleHc}
              />
              <ToggleRow
                icon="🔠" isAr={isAr}
                titleAr="نص كبير" titleEn="Large Text"
                descAr="تكبير حجم الخط بنسبة 20%" descEn="Increase font size by 20%"
                checked={lt} onToggle={toggleLt}
              />
              <div style={{ borderBottom: 'none' }}>
                <ToggleRow
                  icon="🎞️" isAr={isAr}
                  titleAr="تقليل الحركة" titleEn="Reduce Motion"
                  descAr="إيقاف التأثيرات الحركية" descEn="Disable animations & transitions"
                  checked={rm} onToggle={toggleRm}
                />
              </div>
            </>
          )}
        </div>

        {/* Chat preferences */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 4px 8px' }}>
          {isAr ? 'تفضيلات المحادثة' : 'Chat preferences'}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 12, padding: '13px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#191713', marginBottom: 3 }}>
            {isAr ? 'الطول الافتراضي لردود دليلك' : 'Default answer length'}
          </div>
          <div style={{ fontSize: 11, color: '#918B82', marginBottom: 10 }}>
            {isAr ? 'يمكنك أيضاً تغييره من داخل المحادثة في أي وقت' : 'You can also change this from inside the chat at any time'}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#F5F3EE', borderRadius: 20, border: '1.5px solid #E5E0D8', padding: 2, gap: 1 }}>
            {lengthOpts.map(o => {
              const active = mode === o.value
              return (
                <button
                  key={o.value || 'normal'}
                  type="button"
                  onClick={() => setMode(o.value)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '6px 13px', borderRadius: 16,
                    background: active ? '#fff' : 'transparent',
                    border: active ? '1.5px solid #D1CBC4' : '1.5px solid transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 12, fontWeight: active ? 800 : 600,
                    color: active ? '#1C1917' : '#78716C',
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span>{o.icon}</span>
                  {isAr ? o.ar : o.en}
                </button>
              )
            })}
          </div>
        </div>

        {/* About */}
        <div style={{ fontSize: 11, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 4px 8px' }}>
          {isAr ? 'عن التطبيق' : 'About'}
        </div>
        <div style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: 'rgba(143,29,44,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
          }}>
            <img src="/logo-icon.png" alt="دليلك" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>
              {isAr ? 'دليلك' : 'Dalilak'}
            </div>
            <div style={{ fontSize: 11, color: '#918B82' }}>
              {isAr ? 'دليل المواطن اللبناني للمعاملات الحكومية' : 'Lebanese Citizens\' Government Procedures Guide'}
            </div>
          </div>
        </div>
      </div>

      <BottomNav isAr={isAr} />
    </div>
  )
}
