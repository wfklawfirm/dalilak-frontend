import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import GlobalLangSwitch from '@/components/GlobalLangSwitch'
import OfflineNotice from '@/components/OfflineNotice'
import AccessibilityBar from '@/components/AccessibilityBar'

export const metadata: Metadata = {
  title: 'دليلك — دليل المواطن اللبناني للمعاملات الحكومية',
  description: 'دليلك: مساعدك الذكي لكل المعاملات الحكومية اللبنانية — جوازات السفر، سجل النفوس، تسجيل الشركات، تراخيص البناء، والمزيد. معلومات موثوقة ومحدّثة.',
  keywords: ['دليلك', 'معاملات لبنانية', 'جواز سفر', 'سجل نفوس', 'تسجيل شركة', 'ترخيص بناء', 'وزارة الداخلية', 'دولتي', 'مواطن لبناني'],
  authors: [{ name: 'دليلك', url: 'https://dalilak-frontend.vercel.app' }],
  creator: 'دليلك',
  publisher: 'دليلك',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.PNG',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'دليلك — دليل المواطن اللبناني',
    description: 'مساعدك الذكي لكل المعاملات الحكومية اللبنانية',
    siteName: 'دليلك',
    url: 'https://dalilak-frontend.vercel.app',
    locale: 'ar_LB',
    type: 'website',
    images: [
      {
        url: 'https://dalilak-frontend.vercel.app/logo.PNG',
        width: 512,
        height: 512,
        alt: 'دليلك',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'دليلك — دليل المواطن اللبناني',
    description: 'مساعدك الذكي لكل المعاملات الحكومية اللبنانية',
    images: ['https://dalilak-frontend.vercel.app/logo.PNG'],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://dalilak-frontend.vercel.app',
  },
}

// Explicit viewport — userScalable deliberately omitted (WCAG 1.4.4 — Resize Text).
// Do NOT add userScalable: false or maximumScale: 1 — both block accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8F1D2C',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* DNS + TLS handshake early — fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Cairo — primary Arabic + Latin font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Security headers via meta */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Cairo', 'Inter', sans-serif" }}>
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            انتقل إلى المحتوى الرئيسي / Skip to main content
          </a>
          <OfflineNotice />
          {children}
          <GlobalLangSwitch />
          <AccessibilityBar />
        </LanguageProvider>
      </body>
    </html>
  )
}
