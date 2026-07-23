'use client'

/**
 * OfflineNotice — graceful offline banner.
 * Listens to window online/offline events.
 * Shows a non-blocking top strip when navigator.onLine is false.
 * Auto-hides when back online.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function OfflineNotice() {
  const { isAr } = useLanguage()
  const [offline, setOffline] = useState(false)
  const [justCameBack, setJustCameBack] = useState(false)

  useEffect(() => {
    // Initial state
    setOffline(!navigator.onLine)

    const handleOffline = () => {
      setOffline(true)
      setJustCameBack(false)
    }

    const handleOnline = () => {
      setJustCameBack(true)
      setOffline(false)
      // Hide "back online" badge after 3s
      setTimeout(() => setJustCameBack(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline && !justCameBack) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99998,
        background: offline ? '#1f2937' : '#065f46',
        color: '#fff',
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, fontSize: 13, fontWeight: 600,
        animation: 'fadeDown 0.25s ease both',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      }}
    >
      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{ fontSize: 16 }}>{offline ? '📡' : '✅'}</span>
      {offline
        ? (isAr
            ? 'أنت غير متصل بالإنترنت — النتائج قد تكون محدودة'
            : 'You\'re offline — results may be limited')
        : (isAr
            ? 'عادت الاتصال بالإنترنت'
            : 'Back online!')}
    </div>
  )
}
