'use client'

/**
 * ProcedureFeeHistory — log when a fee was paid for a procedure.
 *
 * LS key: dalilak_fee_paid_{code} → ISO date string (YYYY-MM-DD)
 * Shows days since last payment. "Record payment" button.
 * Dispatches dalilak_saved_change on update.
 *
 * Props: { code: string; fees?: string; isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  code: string
  fees?: string
  isAr: boolean
}

function lsKey(code: string) { return `dalilak_fee_paid_${code}` }

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' })
}

function daysDiff(iso: string): number {
  const then = new Date(iso + 'T00:00:00+03:00').getTime()
  return Math.floor((Date.now() - then) / 86400000)
}

export default function ProcedureFeeHistory({ code, fees, isAr }: Props) {
  const [mounted, setMounted]     = useState(false)
  const [lastPaid, setLastPaid]   = useState<string | null>(null)
  const [confirm, setConfirm]     = useState(false)

  useEffect(() => {
    setMounted(true)
    try { setLastPaid(localStorage.getItem(lsKey(code))) } catch {}
  }, [code])

  const record = useCallback(() => {
    const d = today()
    try { localStorage.setItem(lsKey(code), d) } catch {}
    setLastPaid(d)
    setConfirm(true)
    setTimeout(() => setConfirm(false), 2000)
    window.dispatchEvent(new Event('dalilak_saved_change'))
  }, [code])

  const clear = useCallback(() => {
    try { localStorage.removeItem(lsKey(code)) } catch {}
    setLastPaid(null)
  }, [code])

  if (!mounted || !fees) return null

  const days = lastPaid ? daysDiff(lastPaid) : null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        border: '1px solid #E5E7EB', borderRadius: 10,
        padding: '10px 14px', marginBottom: 8,
        background: '#FAFAFA',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 14 }}>💳</span>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#374151' }}>
          {isAr ? 'سجّل دفع الرسوم' : 'Fee payment tracker'}
        </span>
        {fees && (
          <span style={{ fontSize: 11, color: '#6B7280', marginInlineStart: 'auto' }}>
            {isAr ? `الرسوم: ${fees}` : `Fee: ${fees}`}
          </span>
        )}
      </div>

      {lastPaid ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 11, background: days !== null && days <= 30 ? '#ECFDF5' : '#FEF3C7',
            color: days !== null && days <= 30 ? '#065F46' : '#92400E',
            borderRadius: 6, padding: '3px 8px', fontWeight: 600,
          }}>
            {days === 0
              ? (isAr ? 'دفعت اليوم ✓' : 'Paid today ✓')
              : (isAr ? `منذ ${days} يوم` : `${days} day${days !== 1 ? 's' : ''} ago`)}
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{lastPaid}</span>
          <button
            type="button"
            onClick={clear}
            style={{ fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginInlineStart: 'auto' }}
          >
            {isAr ? 'حذف' : 'Clear'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={record}
          style={{
            fontSize: 11, fontWeight: 700, padding: '5px 12px',
            background: confirm ? '#ECFDF5' : '#8F1D2C', color: confirm ? '#065F46' : 'white',
            border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {confirm ? '✓' : (isAr ? 'سجّل الدفع الآن' : 'Record payment now')}
        </button>
      )}
    </div>
  )
}
