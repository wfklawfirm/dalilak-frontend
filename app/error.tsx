'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { isAr } = useLanguage()

  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[Dalilak Error]', error)
    }
  }, [error])

  return (
    <div id="main-content" style={{
      minHeight: '100vh',
      background: '#F2EDE6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cairo','Tajawal',system-ui,sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Warning icon */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 18,
        background: '#FEF2F2',
        border: '1.5px solid rgba(139,26,26,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>

      <h1 style={{
        fontSize: 20, fontWeight: 800,
        color: '#1A1208',
        margin: '0 0 8px',
      }}>
        {isAr ? 'حدث خطأ غير متوقع' : 'An Unexpected Error Occurred'}
      </h1>

      <p style={{
        fontSize: 14, color: '#5C4A3A',
        margin: '0 0 24px',
        maxWidth: 340,
        lineHeight: 1.7,
      }}>
        {isAr
          ? 'نعتذر عن هذا الخطأ. يُرجى المحاولة مرة أخرى. إذا استمرت المشكلة، تواصل معنا.'
          : 'We apologize for this error. Please try again. If the problem persists, contact us.'}
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 22px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg,#8B1A1A 0%,#6b2737 100%)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            boxShadow: '0 3px 12px rgba(139,26,26,0.28)',
          }}
        >
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {isAr ? 'المحاولة مجدداً' : 'Try Again'}
        </button>

        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 22px',
            borderRadius: 10,
            border: '1.5px solid #EAE4D9',
            background: '#fff',
            color: '#5C4A3A',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </a>
      </div>
    </div>
  )
}
