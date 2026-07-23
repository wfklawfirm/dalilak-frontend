'use client'
import { useEffect, useState } from 'react'

export default function Loading() {
  const [isAr, setIsAr] = useState(true)
  useEffect(() => {
    try {
      if (localStorage.getItem('dalilak_lang') === 'en') setIsAr(false)
    } catch {}
  }, [])

  return (
    <div
      role="status"
      aria-label={isAr ? 'جارٍ التحميل' : 'Loading'}
      style={{
        minHeight: '100vh',
        background: '#F2EDE6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo','Tajawal',system-ui,sans-serif",
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}>
        {/* Animated logo mark */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg,#8B1A1A 0%,#6b2737 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(139,26,26,0.22)',
          animation: 'pulse 1.4s ease-in-out infinite',
        }}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>

        {/* Dot loader */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: '#8B1A1A',
                opacity: 0.7,
                animation: `pulseDot 1.2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
