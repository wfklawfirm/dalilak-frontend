import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'دليلك AI — مساعدك في المعاملات اللبنانية',
  description: 'دليلك AI هو دليلك الذكي لكل المعاملات الحكومية اللبنانية',
}

// Explicit viewport — userScalable is deliberately omitted so browsers allow
// pinch-to-zoom and text enlargement (WCAG 1.4.4 — Resize Text, Level AA).
// Do NOT add userScalable: false or maximumScale: 1 — both block accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic antialiased min-h-screen">{children}</body>
    </html>
  )
}
