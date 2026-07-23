'use client'

/**
 * ChatVoicePlayback — Text-to-Speech playback for AI messages.
 *
 * Uses the Web Speech Synthesis API (available on all modern browsers
 * including iOS Safari, Android Chrome, etc.).
 *
 * - Arabic text → uses an Arabic voice (ar-LB or ar)
 * - English text → uses an English voice (en-US or en)
 * - Auto-detects language from content (simple heuristic: >30% Arabic chars)
 * - Always renders after mount (no early return on unsupported)
 * - On unsupported browser: shows a toast and gracefully does nothing
 *
 * Props: { text: string; isAr: boolean }
 */

import React, { useState, useEffect, useRef } from 'react'

interface Props {
  text: string
  isAr: boolean
}

function isArabicText(t: string): boolean {
  const arabicChars = (t.match(/[؀-ۿ]/g) || []).length
  return arabicChars / t.length > 0.25
}

function stripMarkdown(t: string): string {
  return t
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-•*]\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
}

export default function ChatVoicePlayback({ text, isAr }: Props) {
  const [mounted,  setMounted]  = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const [toast,    setToast]    = useState('')
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Cleanup on unmount
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch {} }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function toggle() {
    if (!mounted) return

    // Check support
    if (!window.speechSynthesis) {
      showToast(isAr
        ? '🔊 قارئ الشاشة غير متاح في هذا المتصفح'
        : '🔊 Text-to-speech is not available in this browser')
      return
    }

    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    const clean = stripMarkdown(text).slice(0, 2000) // limit length
    const textIsAr = isArabicText(clean)

    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = textIsAr ? 'ar' : 'en-US'
    utt.rate  = 0.92
    utt.pitch = 1.0

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      const preferred = voices.find(v =>
        textIsAr
          ? v.lang.startsWith('ar')
          : v.lang.startsWith('en') && v.localService
      ) || voices.find(v => textIsAr ? v.lang.startsWith('ar') : v.lang.startsWith('en'))
      if (preferred) utt.voice = preferred
    }

    utt.onstart = () => setPlaying(true)
    utt.onend   = () => setPlaying(false)
    utt.onerror = () => setPlaying(false)

    uttRef.current = utt
    window.speechSynthesis.speak(utt)
  }

  if (!mounted) return null

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      {toast && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)',
          left: 0, right: 'auto',
          background: '#1C1917', color: '#fff',
          borderRadius: 9, padding: '6px 10px',
          fontSize: 10, fontWeight: 600, lineHeight: 1.4,
          maxWidth: 220, whiteSpace: 'pre-wrap' as const,
          zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        title={playing
          ? (isAr ? 'إيقاف القراءة' : 'Stop reading')
          : (isAr ? 'استمع للرسالة' : 'Listen to message')}
        style={{
          background: playing ? '#EFF6FF' : 'none',
          border: playing ? '1px solid #BFDBFE' : 'none',
          borderRadius: 8, padding: '3px 6px',
          cursor: 'pointer', fontSize: 14, lineHeight: 1,
          transition: 'all 0.15s',
          color: playing ? '#1D4ED8' : '#A8A29E',
        }}
        onMouseEnter={e => { if (!playing) e.currentTarget.style.color = '#3B82F6' }}
        onMouseLeave={e => { if (!playing) e.currentTarget.style.color = '#A8A29E' }}
      >
        {playing ? (
          /* Stop icon — two vertical bars */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          /* Speaker icon */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        )}
      </button>
    </span>
  )
}
