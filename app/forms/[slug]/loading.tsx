'use client'
import { useLanguage } from '@/lib/LanguageContext'

export default function FormLoading() {
  const { isAr } = useLanguage()
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F8F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo','Inter',sans-serif",
      }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #E6E2DC',
            borderTopColor: '#8F1D2C',
            borderRadius: '50%',
            margin: '0 auto 14px',
            animation: 'fl-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes fl-spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#918B82', fontSize: 13, margin: 0 }}>{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  )
}
