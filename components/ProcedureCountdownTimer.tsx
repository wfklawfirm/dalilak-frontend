'use client'

/**
 * ProcedureCountdownTimer — global countdown for completing a full procedure.
 *
 * LS key: dalilak_countdown_{code} → epoch ms target
 * Shows days/hours/minutes remaining. Red when < 24h.
 *
 * Props: { code: string; titleAr: string; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  code: string
  titleAr: string
  isAr: boolean
}

function lsKey(code: string) { return `dalilak_countdown_${code}` }

function formatCountdown(ms: number, isAr: boolean): string {
  if (ms <= 0) return isAr ? 'انتهى الوقت!' : 'Time\'s up!'
  const days    = Math.floor(ms / 86400000)
  const hours   = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (days > 0) return isAr ? `${days} يوم و ${hours} ساعة` : `${days}d ${hours}h`
  if (hours > 0) return isAr ? `${hours} ساعة و ${minutes} دقيقة` : `${hours}h ${minutes}m`
  return isAr ? `${minutes} دقيقة` : `${minutes}m`
}

export default function ProcedureCountdownTimer({ code, titleAr, isAr }: Props) {
  const [mounted, setMounted]   = useState(false)
  const [target, setTarget]     = useState<number | null>(null)
  const [now, setNow]           = useState(Date.now())
  const [open, setOpen]         = useState(false)
  const [days, setDays]         = useState('7')

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(lsKey(code))
      if (raw) setTarget(parseInt(raw, 10))
    } catch {}
  }, [code])

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [target])

  const set = useCallback(() => {
    const d     = Math.max(1, parseInt(days, 10) || 1)
    const epoch = Date.now() + d * 86400000
    try { localStorage.setItem(lsKey(code), String(epoch)) } catch {}
    setTarget(epoch)
    setOpen(false)
  }, [code, days])

  const clear = useCallback(() => {
    try { localStorage.removeItem(lsKey(code)) } catch {}
    setTarget(null)
  }, [code])

  if (!mounted) return null

  const remaining = target ? target - now : null
  const urgent    = remaining !== null && remaining < 86400000 && remaining > 0
  const expired   = remaining !== null && remaining <= 0

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 8 }}>
      {target ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: expired ? '#FEF2F2' : urgent ? '#FFF7ED' : '#F0F9FF',
          border: `1px solid ${expired ? '#FCA5A5' : urgent ? '#FDE68A' : '#BAE6FD'}`,
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 16 }}>{expired ? '⏰' : urgent ? '⚠️' : '⏱️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>
              {isAr ? 'الوقت المتبقي لإنجاز المعاملة' : 'Time remaining to complete'}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 900,
              color: expired ? '#DC2626' : urgent ? '#D97706' : '#0369A1',
            }}>
              {formatCountdown(remaining ?? 0, isAr)}
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label={isAr ? 'مسح العداد' : 'Clear countdown'}
            style={{ fontSize: 10, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', fontSize: 11, fontWeight: 700,
              background: 'transparent', color: '#6B7280',
              border: '1px solid #D1D5DB', borderRadius: 8,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ⏱️ {isAr ? 'ضع موعدًا نهائيًا' : 'Set deadline'}
          </button>
          {open && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <input
                type="number" min="1" max="365"
                value={days}
                onChange={e => setDays(e.target.value)}
                style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 12, fontFamily: 'inherit' }}
              />
              <span style={{ fontSize: 11, color: '#6B7280' }}>{isAr ? 'يوم' : 'days'}</span>
              <button
                type="button"
                onClick={set}
                style={{ padding: '4px 10px', background: '#8F1D2C', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isAr ? 'تأكيد' : 'Set'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ padding: '4px 8px', background: 'none', color: '#9CA3AF', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
