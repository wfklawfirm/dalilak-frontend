'use client'
import { useLanguage } from '@/lib/LanguageContext'

export default function FormLoading() {
  const { isAr } = useLanguage()
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAF8',
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
            border: '3px solid #EAE4D9',
            borderTopColor: '#8B1A1A',
            borderRadius: '50%',
            margin: '0 auto 14px',
            animation: 'fl-spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes fl-spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#9C8E80', fontSize: 13, margin: 0 }}>{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  )
}
