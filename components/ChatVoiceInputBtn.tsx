'use client'

/**
 * ChatVoiceInputBtn — microphone button for voice input.
 *
 * Uses Web SpeechRecognition API (Chrome/Edge only; gracefully hidden on
 * unsupported browsers).
 *
 * States: idle → listening → (transcript returned) → idle
 *
 * Props:
 *   onTranscript(text: string) — called with the final transcript
 *   isAr: boolean — drives recognition language + direction
 *   lang: 'ar' | 'en' — sets recognition language
 *   disabled?: boolean — disable while AI is typing
 */

import React, { useState, useRef, useEffect } from 'react'

interface Props {
  onTranscript: (text: string) => void
  isAr: boolean
  lang: 'ar' | 'en'
  disabled?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

export default function ChatVoiceInputBtn({ onTranscript, isAr, lang, disabled }: Props) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [pulse, setPulse]         = useState(0)
  const recRef = useRef<AnySpeechRecognition>(null)
  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  function startListening() {
    if (listening) { stopListening(); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const rec = new SR()
    rec.lang          = lang === 'ar' ? 'ar-LB' : 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.continuous    = false

    rec.onstart = () => {
      setListening(true)
      pulseTimer.current = setInterval(() => { setPulse(p => (p + 1) % 3) }, 500)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0]?.[0]?.transcript?.trim()
      if (t) onTranscript(t)
    }

    rec.onerror = () => { stopListening() }
    rec.onend   = () => { stopListening() }

    recRef.current = rec
    rec.start()
  }

  function stopListening() {
    try { recRef.current?.stop() } catch {}
    recRef.current = null
    setListening(false)
    setPulse(0)
    if (pulseTimer.current) clearInterval(pulseTimer.current)
  }

  // Cleanup on unmount
  useEffect(() => () => stopListening(), [])

  if (!supported) return null

  const ariaLabel = listening
    ? (isAr ? 'إيقاف الاستماع' : 'Stop listening')
    : (isAr ? 'تحدّث لإدخال النص' : 'Speak to input text')

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={disabled && !listening}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: listening ? '1.5px solid #EF4444' : '1.5px solid #D1CBC4',
        background: listening ? '#FEF2F2' : 'transparent',
        cursor: disabled && !listening ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', position: 'relative', outline: 'none',
        opacity: disabled && !listening ? 0.45 : 1,
      }}
      onMouseEnter={e => { if (!disabled || listening) e.currentTarget.style.background = listening ? '#FEE2E2' : '#F5F3EE' }}
      onMouseLeave={e => { e.currentTarget.style.background = listening ? '#FEF2F2' : 'transparent' }}
    >
      {listening ? (
        /* Animated mic — 3 bar equalizer */
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 3, borderRadius: 2,
              background: '#EF4444',
              height: pulse === i ? 14 : pulse === (i + 1) % 3 ? 10 : 6,
              transition: 'height 0.15s ease',
            }} />
          ))}
        </span>
      ) : (
        /* Mic SVG */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#5C534A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="2" width="6" height="11" rx="3"/>
          <path d="M5 10a7 7 0 0 0 14 0"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
      )}

      {/* Ripple ring while listening */}
      {listening && (
        <span style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: '1.5px solid #EF4444', opacity: 0.35,
          animation: 'voicePing 1.2s cubic-bezier(0,0,0.2,1) infinite',
          pointerEvents: 'none',
        }} />
      )}
      <style>{`
        @keyframes voicePing {
          0%   { transform: scale(1); opacity: 0.35; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </button>
  )
}
