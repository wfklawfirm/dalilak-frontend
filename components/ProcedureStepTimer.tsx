'use client'

/**
 * ProcedureStepTimer — per-step countdown timer for procedure execution.
 *
 * Each step shows a small ▶ button. Clicking starts a countdown (user-set minutes).
 * Active step pulses amber. Timer persists across short page visits via LS.
 *
 * LS key: dalilak_step_timer_{code} → { stepIdx, endsAt: ISO string }
 *
 * Props: { code: string; steps: string[]; isAr: boolean }
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  code: string
  steps: string[]
  isAr: boolean
}

interface TimerState {
  stepIdx: number
  endsAt: string  // ISO
}

function loadTimer(code: string): TimerState | null {
  try {
    const raw = localStorage.getItem(`dalilak_step_timer_${code}`)
    if (!raw) return null
    const parsed: TimerState = JSON.parse(raw)
    if (new Date(parsed.endsAt) < new Date()) return null
    return parsed
  } catch { return null }
}

function saveTimer(code: string, state: TimerState) {
  try { localStorage.setItem(`dalilak_step_timer_${code}`, JSON.stringify(state)) } catch {}
}

function clearTimer(code: string) {
  try { localStorage.removeItem(`dalilak_step_timer_${code}`) } catch {}
}

function fmtSecs(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function ProcedureStepTimer({ code, steps, isAr }: Props) {
  const [activeIdx, setActiveIdx]   = useState<number | null>(null)
  const [remaining, setRemaining]   = useState(0)
  const [mounted, setMounted]       = useState(false)
  const [inputMins, setInputMins]   = useState<Record<number, string>>({})
  const [picking, setPicking]       = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pickRef = useRef<HTMLDivElement | null>(null)

  const tick = useCallback(() => {
    if (activeIdx === null) return
    const saved = loadTimer(code)
    if (!saved) { setActiveIdx(null); setRemaining(0); return }
    const secs = Math.max(0, Math.round((new Date(saved.endsAt).getTime() - Date.now()) / 1000))
    setRemaining(secs)
    if (secs === 0) {
      clearTimer(code)
      setActiveIdx(null)
    }
  }, [activeIdx, code])

  useEffect(() => {
    setMounted(true)
    const saved = loadTimer(code)
    if (saved) {
      setActiveIdx(saved.stepIdx)
      const secs = Math.max(0, Math.round((new Date(saved.endsAt).getTime() - Date.now()) / 1000))
      setRemaining(secs)
    }
  }, [code])

  useEffect(() => {
    if (activeIdx !== null) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeIdx, tick])

  // Close picker on outside click
  useEffect(() => {
    if (picking === null) return
    function handler(e: MouseEvent) {
      if (pickRef.current && !pickRef.current.contains(e.target as Node)) setPicking(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [picking])

  function startTimer(idx: number, mins: number) {
    const endsAt = new Date(Date.now() + mins * 60 * 1000).toISOString()
    const state: TimerState = { stepIdx: idx, endsAt }
    saveTimer(code, state)
    setActiveIdx(idx)
    setRemaining(mins * 60)
    setPicking(null)
  }

  function stopTimer() {
    clearTimer(code)
    setActiveIdx(null)
    setRemaining(0)
    setPicking(null)
  }

  if (!mounted || steps.length === 0) return null

  const PRESET_MINS = [5, 10, 15, 30, 60]

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {steps.map((step, idx) => {
        const isActive = activeIdx === idx
        const mins = parseInt(inputMins[idx] || '', 10)

        return (
          <div key={idx} style={{
            display: 'flex', alignItems: 'flex-start', gap: 7,
            padding: '6px 8px', borderRadius: 8,
            background: isActive ? 'rgba(245,158,11,0.07)' : 'transparent',
            border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : 'transparent'}`,
            transition: 'background 0.2s, border 0.2s',
            animation: isActive ? 'stepPulse 2s ease infinite' : 'none',
            position: 'relative',
          }}>
            {/* Step number */}
            <span style={{
              minWidth: 22, height: 22, borderRadius: '50%',
              background: isActive ? '#F59E0B' : '#E6E2DC',
              color: isActive ? '#fff' : '#6B5A4A',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>{idx + 1}</span>

            {/* Step text */}
            <span style={{ flex: 1, fontSize: 11.5, color: '#191713', lineHeight: 1.4, fontWeight: isActive ? 700 : 500 }}>
              {step}
            </span>

            {/* Timer controls */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              {isActive ? (
                <>
                  <span style={{ fontSize: 11, fontWeight: 800, color: remaining < 60 ? '#DC2626' : '#D97706', fontVariantNumeric: 'tabular-nums' }}>
                    ⏱ {fmtSecs(remaining)}
                  </span>
                  <button type="button" onClick={stopTimer}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#918B82', padding: 0 }}
                    title={isAr ? 'إيقاف' : 'Stop'}
                  >⏹</button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPicking(p => p === idx ? null : idx)}
                  title={isAr ? 'ابدأ مؤقتاً' : 'Start timer'}
                  style={{
                    background: 'none', border: '1px solid #D1CBC4', borderRadius: 5,
                    cursor: 'pointer', fontSize: 10, color: '#918B82', padding: '1px 5px',
                    fontFamily: 'inherit',
                  }}
                >▶</button>
              )}
            </div>

            {/* Duration picker */}
            {picking === idx && (
              <div ref={pickRef} dir={isAr ? 'rtl' : 'ltr'} style={{
                position: 'absolute', top: '100%', [isAr ? 'left' : 'right']: 0, zIndex: 200,
                background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 10, minWidth: 160,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#918B82', marginBottom: 6 }}>
                  {isAr ? 'مدة الخطوة (دقائق)' : 'Step duration (min)'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {PRESET_MINS.map(m => (
                    <button key={m} type="button" onClick={() => startTimer(idx, m)}
                      style={{
                        padding: '3px 8px', background: '#F5F3EE', border: '1px solid #D1CBC4',
                        borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700,
                        color: '#191713', fontFamily: 'inherit',
                      }}
                    >{m}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="number" min="1" max="240"
                    placeholder={isAr ? 'دقيقة' : 'min'}
                    value={inputMins[idx] || ''}
                    onChange={e => setInputMins(p => ({ ...p, [idx]: e.target.value }))}
                    style={{ flex: 1, padding: '3px 6px', border: '1px solid #D1CBC4', borderRadius: 6, fontSize: 10, fontFamily: 'inherit', color: '#191713' }}
                  />
                  <button type="button"
                    onClick={() => { if (!isNaN(mins) && mins > 0) startTimer(idx, mins) }}
                    style={{ padding: '3px 8px', background: '#8F1D2C', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}
                  >▶</button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes stepPulse {
          0%,100% { border-color: rgba(245,158,11,0.3); }
          50%       { border-color: rgba(245,158,11,0.7); }
        }
      `}</style>
    </div>
  )
}
