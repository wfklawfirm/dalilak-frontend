import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'دليلك — مساعدك في المعاملات اللبنانية',
  description: 'دليلك هو دليلك الذكي لكل المعاملات الحكومية اللبنانية',
  openGraph: {
    title: 'دليلك',
    description: 'دليلك الذكي للمعاملات الحكومية اللبنانية',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

// Explicit viewport — userScalable deliberately omitted (WCAG 1.4.4 — Resize Text).
// Do NOT add userScalable: false or maximumScale: 1 — both block accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
        {children}
      </body>
    </html>
  )
}
