'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function NotFound() {
  const { isAr } = useLanguage()
  return (
    <div id="main-content" style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cairo','Tajawal',system-ui,sans-serif",
      direction: 'rtl',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Logo mark */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 18,
        background: 'linear-gradient(135deg,#8B1A1A 0%,#6b2737 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        boxShadow: '0 4px 20px rgba(139,26,26,0.25)',
      }}>
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>

      {/* Error code */}
      <div style={{
        fontSize: 72, fontWeight: 900,
        color: '#8B1A1A',
        lineHeight: 1,
        marginBottom: 8,
        letterSpacing: '-2px',
      }}>404</div>

      <h1 style={{
        fontSize: 20, fontWeight: 800,
        color: '#1A1208',
        margin: '0 0 8px',
      }}>
        {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
      </h1>

      <p style={{
        fontSize: 14, color: '#5C4A3A',
        margin: '0 0 28px',
        maxWidth: 320,
        lineHeight: 1.7,
      }}>
        {isAr
          ? 'لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.'
          : 'We could not find the page you were looking for. It may have been moved or deleted.'}
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 24px',
          borderRadius: 12,
          background: 'linear-gradient(135deg,#8B1A1A 0%,#6b2737 100%)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'inherit',
          textDecoration: 'none',
          boxShadow: '0 3px 12px rgba(139,26,26,0.28)',
          transition: 'transform 0.18s,box-shadow 0.18s',
        }}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        {isAr ? 'العودة للرئيسية' : 'Back to Home'}
      </Link>
    </div>
  )
}
