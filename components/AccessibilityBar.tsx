'use client'

/**
 * AccessibilityBar — high-contrast + large-text toggle for Dalilak.
 *
 * Adds/removes CSS classes on <html>:
 *   .dalilak-high-contrast  — activates high-contrast color scheme
 *   .dalilak-large-text     — increases base font size by 20%
 *
 * State persists in localStorage:
 *   dalilak_a11y_hc  — "1" if high-contrast active
 *   dalilak_a11y_lt  — "1" if large-text active
 *
 * Shows as a floating pill button (bottom-right, above BottomNav).
 * Expands to a small panel with two toggles.
 *
 * Corresponding globals.css additions (applied by this component via <style>):
 *   .dalilak-high-contrast { --bg: #000; --text-1: #fff; ... }
 *   .dalilak-large-text    { font-size: 120%; }
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const LS_HC = 'dalilak_a11y_hc'
const LS_LT = 'dalilak_a11y_lt'
const LS_RM = 'dalilak_a11y_rm'

function applyClasses(hc: boolean, lt: boolean, rm: boolean) {
  const html = document.documentElement
  html.classList.toggle('dalilak-high-contrast', hc)
  html.classList.toggle('dalilak-large-text', lt)
  html.classList.toggle('dalilak-reduce-motion', rm)
}

export default function AccessibilityBar() {
  const { isAr } = useLanguage()
  const [open, setOpen] = useState(false)
  const [hc, setHc] = useState(false)
  const [lt, setLt] = useState(false)
  const [rm, setRm] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const h = localStorage.getItem(LS_HC) === '1'
      const l = localStorage.getItem(LS_LT) === '1'
      const r = localStorage.getItem(LS_RM) === '1'
      setHc(h); setLt(l); setRm(r)
      applyClasses(h, l, r)
    } catch {}
  }, [])

  // Escape closes the options panel when open — standard dialog behavior.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  function toggleHc() {
    const next = !hc
    setHc(next)
    try { localStorage.setItem(LS_HC, next ? '1' : '0') } catch {}
    applyClasses(next, lt, rm)
  }

  function toggleLt() {
    const next = !lt
    setLt(next)
    try { localStorage.setItem(LS_LT, next ? '1' : '0') } catch {}
    applyClasses(hc, next, rm)
  }

  function toggleRm() {
    const next = !rm
    setRm(next)
    try { localStorage.setItem(LS_RM, next ? '1' : '0') } catch {}
    applyClasses(hc, lt, next)
  }

  if (!mounted) return null

  const anyActive = hc || lt || rm
  const side = isAr ? 'left' : 'right'

  return (
    <>
      {/* Inject accessibility CSS */}
      <style>{`
        .dalilak-high-contrast {
          --bg: #000000 !important;
          --surface: #1a1a1a !important;
          --surface-2: #222222 !important;
          --border: #555555 !important;
          --text-1: #ffffff !important;
          --text-2: #f0f0f0 !important;
          --text-3: #cccccc !important;
          --text-4: #aaaaaa !important;
          filter: contrast(1.3);
        }
        .dalilak-large-text {
          font-size: 118% !important;
        }
        .dalilak-large-text button,
        .dalilak-large-text input,
        .dalilak-large-text textarea {
          font-size: inherit !important;
        }
        .dalilak-reduce-motion *,
        .dalilak-reduce-motion *::before,
        .dalilak-reduce-motion *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
      `}</style>

      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="no-print"
        style={{
          position: 'fixed',
          bottom: 'calc(134px + env(safe-area-inset-bottom, 0px))',
          [side]: 14,
          zIndex: 8400,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: isAr ? 'flex-start' : 'flex-end',
          gap: 6,
        }}
      >
        {/* Toggle button */}
        <button
          type="button"
          aria-label={isAr ? 'خيارات إمكانية الوصول' : 'Accessibility options'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="tap-hit-2"
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: anyActive ? '#1a56db' : '#fff',
            border: `2px solid ${anyActive ? '#1a56db' : '#D5CEC4'}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            transition: 'all 0.18s',
            color: anyActive ? '#fff' : '#4B3B3B',
            flexShrink: 0,
          }}
          title={isAr ? 'إمكانية الوصول' : 'Accessibility'}
        >
          ♿
        </button>

        {/* Panel */}
        {open && (
          <div
            role="dialog"
            aria-label={isAr ? 'إعدادات إمكانية الوصول' : 'Accessibility settings'}
            style={{
              background: '#fff',
              border: '1px solid #E6E2DC',
              borderRadius: 14,
              boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
              width: 210,
              overflow: 'hidden',
              animation: 'fadeUp 0.15s ease both',
            }}
          >
            {/* Header */}
            <div style={{ padding: '9px 14px 8px', borderBottom: '1px solid #E6E2DC' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#191713' }}>
                ♿ {isAr ? 'إمكانية الوصول' : 'Accessibility'}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ padding: '8px 0' }}>
              {/* High contrast */}
              <button
                type="button"
                role="switch"
                aria-checked={hc}
                onClick={toggleHc}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: hc ? 'rgba(26,86,219,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 17 }}>🔲</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191713' }}>
                    {isAr ? 'تباين عالٍ' : 'High Contrast'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>
                    {isAr ? 'خلفية داكنة + نص أبيض' : 'Dark background + white text'}
                  </div>
                </div>
                {/* Toggle pill */}
                <div style={{
                  width: 34, height: 18, borderRadius: 9,
                  background: hc ? '#1a56db' : '#D5CEC4',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, width: 12, height: 12,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    [isAr ? 'right' : 'left']: hc ? 3 : 'auto',
                    [isAr ? 'left' : 'right']: !hc ? 3 : 'auto',
                  }} />
                </div>
              </button>

              {/* Large text */}
              <button
                type="button"
                role="switch"
                aria-checked={lt}
                onClick={toggleLt}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: lt ? 'rgba(26,86,219,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 17 }}>🔠</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191713' }}>
                    {isAr ? 'نص كبير' : 'Large Text'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>
                    {isAr ? 'تكبير حجم الخط بنسبة 20%' : 'Increase font size by 20%'}
                  </div>
                </div>
                <div style={{
                  width: 34, height: 18, borderRadius: 9,
                  background: lt ? '#1a56db' : '#D5CEC4',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, width: 12, height: 12,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    [isAr ? 'right' : 'left']: lt ? 3 : 'auto',
                    [isAr ? 'left' : 'right']: !lt ? 3 : 'auto',
                  }} />
                </div>
              </button>

              {/* Reduce motion */}
              <button
                type="button"
                role="switch"
                aria-checked={rm}
                onClick={toggleRm}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: rm ? 'rgba(26,86,219,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  textAlign: isAr ? 'right' : 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 17 }}>🎞️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191713' }}>
                    {isAr ? 'تقليل الحركة' : 'Reduce Motion'}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>
                    {isAr ? 'إيقاف التأثيرات الحركية' : 'Disable animations & transitions'}
                  </div>
                </div>
                <div style={{
                  width: 34, height: 18, borderRadius: 9,
                  background: rm ? '#1a56db' : '#D5CEC4',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3, width: 12, height: 12,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    [isAr ? 'right' : 'left']: rm ? 3 : 'auto',
                    [isAr ? 'left' : 'right']: !rm ? 3 : 'auto',
                  }} />
                </div>
              </button>
            </div>

            {/* Reset */}
            {anyActive && (
              <div style={{ padding: '4px 14px 10px' }}>
                <button
                  type="button"
                  onClick={() => { setHc(false); setLt(false); setRm(false); applyClasses(false, false, false); try { localStorage.removeItem(LS_HC); localStorage.removeItem(LS_LT); localStorage.removeItem(LS_RM) } catch {} }}
                  style={{
                    width: '100%', padding: '5px',
                    background: 'none', border: '1px solid #E6E2DC',
                    borderRadius: 7, fontSize: 11, color: '#9ca3af',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {isAr ? 'إعادة الضبط' : 'Reset to default'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
