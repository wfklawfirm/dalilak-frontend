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
        <link r