'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "'Cairo','Inter',sans-serif", background: '#FAFAF8' }}>
        <div
          id="main-content"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: 64, height: 64,
            borderRadius: 18,
            background: '#FEF2F2',
            border: '1.5px solid rgba(139,26,26,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1A1208', margin: '0 0 8px' }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ fontSize: 13, color: '#9C8E80', margin: '0 0 24px', lineHeight: 1.6, maxWidth: 320 }}>
            نعتذر، واجه التطبيق مشكلة. يمكنك المحاولة مجدداً أو العودة للصفحة الرئيسية.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
              }}
            >
              حاول مجدداً
            </button>
            <a
              href="/"
              style={{
                padding: '10px 22px',
                background: '#fff',
                color: '#8B1A1A',
                border: '1.5px solid rgba(139,26,26,0.3)',
                borderRadius: 12,
                textDecoration: 'none',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              الصفحة الرئيسية
            </a>
          </div>
          {error.digest && (
            <p style={{ fontSize: 10, color: '#C8BEB2', marginTop: 20 }}>
              معرّف الخطأ: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
