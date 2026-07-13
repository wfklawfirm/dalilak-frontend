import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'دليلك AI — مساعدك في المعاملات اللبنانية',
  description: 'دليلك AI هو دليلك الذكي لكل المعاملات الحكومية اللبنانية',
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for backend — wakes Render early */}
        <link rel="dns-prefetch" href="https://dalilak-backend-bvb9.onrender.com" />
        <link rel="preconnect" href="https://dalilak-backend-bvb9.onrender.com" crossOrigin="anonymous" />
        {/* font-display=swap prevents render-blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Cairo', 'Inter', sans-serif" }} className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
