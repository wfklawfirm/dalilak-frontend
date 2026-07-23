'use client'

/**
 * ProcedureCompletionCelebration — full-screen celebration overlay.
 *
 * Triggers when ALL started procedures are marked as completed.
 * Reads:
 *   - dalilak_started_{code}   — any value means started
 *   - dalilak_completed_{code} — any value means completed
 *
 * Condition: startedCount > 0 && startedCount === completedCount
 *
 * LS key: dalilak_celebration_dismissed_{weekKey}
 * Dismisses automatically after 6 seconds or on user click.
 * Once dismissed this week, doesn't show again.
 *
 * Animation: confetti burst (SVG circles) + fade-in hero text.
 *
 * Listens to: dalilak_saved_change + storage (real-time update)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'

function getWeekKey(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
  return `${now.getFullYear()}_w${week}`
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  rotation: number
  vr: number
  opacity: number
}

const COLORS = ['#8F1D2C', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316']

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 4 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 1.2,
    vy: 0.4 + Math.random() * 0.8,
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 6,
    opacity: 1,
  }))
}

function checkAllComplete(): boolean {
  let started = 0, completed = 0
  try {
    for (const proc of ENRICHED_PROCEDURES) {
      if (localStorage.getItem(`dalilak_started_${proc.code}`)) started++
      if (localStorage.getItem(`dalilak_completed_${proc.code}`)) completed++
    }
  } catch {}
  return started > 0 && started === completed
}

export default function ProcedureCompletionCelebration() {
  const { isAr } = useLanguage()
  const [visible, setVisible]         = useState(false)
  const [particles, setParticles]     = useState<Particle[]>([])
  const [animFrame, setAnimFrame]     = useState(0)
  const animRef                       = useRef<number | null>(null)
  const [mounted, setMounted]         = useState(false)
  const timerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    setVisible(false)
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
    try { localStorage.setItem(`dalilak_celebration_dismissed_${getWeekKey()}`, '1') } catch {}
  }, [])

  const tryShow = useCallback(() => {
    if (!checkAllComplete()) return
    const key = `dalilak_celebration_dismissed_${getWeekKey()}`
    try { if (localStorage.getItem(key)) return } catch {}
    setParticles(createParticles(60))
    setVisible(true)
    timerRef.current = setTimeout(dismiss, 6000)
  }, [dismiss])

  // Animate particles
  useEffect(() => {
    if (!visible) return
    let frame = 0
    const tick = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.015,        // gravity
        rotation: p.rotation + p.vr,
        opacity: p.y > 80 ? Math.max(0, 1 - (p.y - 80) / 30) : 1,
      })).filter(p => p.opacity > 0.01))
      frame++
      setAnimFrame(frame)
      if (frame < 300) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [visible])

  useEffect(() => {
    setMounted(true)
    tryShow()
    window.addEventListener('dalilak_saved_change', tryShow)
    window.addEventListener('storage', tryShow)
    return () => {
      window.removeEventListener('dalilak_saved_change', tryShow)
      window.removeEventListener('storage', tryShow)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tryShow])

  // suppress re-render warning — animFrame is used to force particle re-render
  void animFrame

  if (!mounted || !visible) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        animation: 'celebFadeIn 0.4s ease',
      }}
    >
      {/* Confetti SVG layer */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {particles.map(p => (
          <g key={p.id} transform={`translate(${p.x}, ${p.y}) rotate(${p.rotation})`} opacity={p.opacity}>
            {p.id % 3 === 0
              ? <rect x={-p.size / 2} y={-p.size / 2} width={p.size} height={p.size / 2} fill={p.color} rx="1"/>
              : p.id % 3 === 1
                ? <circle cx="0" cy="0" r={p.size / 2} fill={p.color}/>
                : <polygon points={`0,${-p.size / 2} ${p.size / 3},${p.size / 2} ${-p.size / 3},${p.size / 2}`} fill={p.color}/>
            }
          </g>
        ))}
      </svg>

      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
        style={{
          background: '#fff', borderRadius: 24, padding: '36px 32px',
          maxWidth: 340, width: '90%', textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
          animation: 'celebSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Trophy */}
        <div style={{ fontSize: 64, marginBottom: 8, animation: 'celebBounce 0.6s ease 0.3s both', display: 'inline-block' }}>
          🏆
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#191713', margin: '0 0 8px', lineHeight: 1.2 }}>
          {isAr ? 'أحسنت! أنجزت كل معاملاتك' : 'Congrats! All done!'}
        </h2>

        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.5 }}>
          {isAr
            ? 'لقد أنهيت جميع الإجراءات التي بدأتها. دليلك فخور بك!'
            : "You've completed all the procedures you started. Dalilak is proud of you!"}
        </p>

        {/* Stars row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
          {[0, 0.1, 0.2].map((delay, i) => (
            <span key={i} style={{ fontSize: 24, animation: `celebStar 0.5s ease ${delay + 0.5}s both`, display: 'inline-block' }}>
              ⭐
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={dismiss}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 12,
            background: '#8F1D2C', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {isAr ? 'شكراً دليلك 🎉' : 'Thanks, Dalilak! 🎉'}
        </button>

        <p style={{ fontSize: 10, color: '#D1D5DB', marginTop: 10, marginBottom: 0 }}>
          {isAr ? 'انقر في أي مكان للإغلاق' : 'Click anywhere to close'}
        </p>
      </div>

      <style>{`
        @keyframes celebFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes celebSlideUp { from { transform: translateY(40px) scale(0.8); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
        @keyframes celebBounce  { 0%,100% { transform: scale(1) rotate(-5deg) } 50% { transform: scale(1.2) rotate(5deg) } }
        @keyframes celebStar    { from { transform: scale(0) rotate(-180deg); opacity: 0 } to { transform: scale(1) rotate(0deg); opacity: 1 } }
      `}</style>
    </div>
  )
}
