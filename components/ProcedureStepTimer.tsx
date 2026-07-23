'use client'

/**
 * ProcedureStepTimer — per-step countdown timers for a procedure.
 *
 * Renders one collapsible timer row per step. User can set a wait countdown
 * (1h / 6h / 1d / 3d / 7d / custom days) for any step independently.
 *
 * LS keys: dalilak_step_timer_{code}_{stepIndex} → epoch ms target
 *
 * Props: { code: string; steps: string[]; isAr: boolean }
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  code: string
  steps: string[]
  isAr: boolean
}

const lsKey = (code: string, i: number) => `dalilak_step_timer_${code}_${i}`

function loadTarget(code: string, i: number): number | null {
  try { const v = localStorage.getItem(lsKey(code, i)); return v ? parseInt(v, 10) : null }
  catch { return null }
}
function saveTarget(code: string, i: number, ts: number) {
  try { localStorage.setItem(lsKey(code, i), String(ts)) } catch {}
}
function clearTarget(code: string, i: number) {
  try { localStorage.removeItem(lsKey(code, i)) } catch {}
}
function fmt(ms: number) {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  return [h, Math.floor((s % 3600) / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':')
}

const PRESETS = [
  { ar: 'ساعة',    en: '1h',    ms: 3_600_000 },
  { ar: '٦ ساعات', en: '6h',   ms: 21_600_000 },
  { ar: 'يوم',     en: '1d',   ms: 86_400_000 },
  { ar: '٣ أيام',  en: '3d',   ms: 259_200_000 },
  { ar: 'أسبوع',   en: '1w',   ms: 604_800_000 },
]

function StepTimer({ code, idx, label, isAr }: { code: string; idx: number; label: string; isAr: boolean }) {
  const [target, setTarget]       = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [done, setDone]           = useState(false)
  const [open, setOpen]           = useState(false)
  const [custom, setCustom]       = useState('')
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = loadTarget(code, idx)
    if (!t) return
    const diff = t - Date.now()
    if (diff <= 0) { setDone(true) } else { setTarget(t); setRemaining(diff) }
  }, [code, idx])

  useEffect(() => {
    if (!target || done) return
    tick.current = setInterval(() => {
      const d = target - Date.now()
      if (d <= 0) { setRemaining(0); setDone(true); clearInterval(tick.current!) }
      else setRemaining(d)
    }, 1000)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [target, done])

  function start(ms: number) {
    const t = Date.now() + ms
    saveTarget(code, idx, t)
    setTarget(t); setRemaining(ms); setDone(false); setOpen(false)
  }
  function cancel() {
    clearTarget(code, idx)
    setTarget(null); setRemaining(0); setDone(false)
    if (tick.current) clearInterval(tick.current)
  }

  // Active countdown
  if (target && !done) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 9, color: '#78716C', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {idx + 1}. {label}
      </span>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 14,
        background: '#EFF6FF', border: '1.5px solid #BFDBFE',
      }}>
        <span>⏳</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#1E40AF', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(remaining)}
        </span>
        <button type="button" onClick={cancel} aria-label={isAr ? 'إلغاء المؤقت' : 'Cancel timer'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#93C5FD', padding: 0 }}>✕</button>
      </div>
    </div>
  )

  // Done
  if (done) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 9, color: '#78716C', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {idx + 1}. {label}
      </span>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 14,
        background: '#FEF2F2', border: '1.5px solid #FECACA',
      }}>
        <span>⏰</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#991B1B' }}>
          {isAr ? 'انتهى!' : 'Done!'}
        </span>
        <button type="button" onClick={cancel} aria-label={isAr ? 'إغلاق التنبيه' : 'Dismiss alert'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#EF4444', padding: 0 }}>✕</button>
      </div>
    </div>
  )

  // Idle
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#A8A29E', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {idx + 1}. {label}
        </span>
        <button type="button" onClick={() => setOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 12,
            background: '#F5F3EE', border: '1.5px solid #E5E0D8',
            fontSize: 9, fontWeight: 700, color: '#78716C',
            cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          }}>
          ⏱ {isAr ? 'مؤقّت' : 'Timer'}
        </button>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)',
          [isAr ? 'right' : 'left']: 0,
          background: '#fff', border: '1.5px solid #E5E0D8',
          borderRadius: 10, padding: '8px 10px', zIndex: 40,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          display: 'flex', flexWrap: 'wrap', gap: 5, minWidth: 200,
        }}>
          {PRESETS.map(p => (
            <button key={p.en} type="button" onClick={() => start(p.ms)}
              style={{
                padding: '3px 9px', borderRadius: 16,
                background: '#F5F3EE', border: '1.5px solid #E5E0D8',
                fontSize: 9, fontWeight: 700, color: '#44403C',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {isAr ? p.ar : p.en}
            </button>
          ))}
          <div style={{ width: '100%', display: 'flex', gap: 5, marginTop: 2 }}>
            <input type="number" min="1" max="365" value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder={isAr ? 'أيام' : 'days'}
              style={{
                width: 50, padding: '3px 6px', borderRadius: 7,
                border: '1.5px solid #D1CBC4', fontSize: 9,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="button"
              onClick={() => { const d = parseInt(custom); if (d > 0) start(d * 86_400_000) }}
              style={{
                padding: '3px 9px', borderRadius: 16,
                background: '#8F1D2C', color: '#fff',
                border: 'none', fontSize: 9, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {isAr ? 'ابدأ' : 'Go'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProcedureStepTimer({ code, steps, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted || steps.length === 0) return null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginTop: 6 }}>
      <button type="button" onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', padding: '3px 0', marginBottom: expanded ? 6 : 0,
        }}>
        <span style={{ fontSize: 13 }}>⏱</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#78716C' }}>
          {isAr ? 'مؤقّتات الخطوات' : 'Step timers'}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {steps.map((s, i) => (
            <StepTimer key={i} code={code} idx={i} label={s} isAr={isAr} />
          ))}
        </div>
      )}
    </div>
  )
}
