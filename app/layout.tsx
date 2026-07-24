import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import GlobalLangSwitch from '@/components/GlobalLangSwitch'
import OfflineNotice from '@/components/OfflineNotice'
import AccessibilityBar from '@/components/AccessibilityBar'
import MinistryQuickDial from '@/components/MinistryQuickDial'

export const metadata: Metadata = {
  // metadataBase lets every route's relative `alternates.canonical` (and any
  // relative OG/Twitter image path) resolve to a correct absolute URL. Was
  // missing before — Next.js falls back to an inferred/localhost base
  // without it, which is exactly why the canonical tags already added in
  // earlier batches (procedures/[slug], forms/[slug]) could not be fully
  // trusted to render correctly in production. Purely a metadata-resolution
  // fix — no visible UI change, no route change.
  metadataBase: new URL('https://dalilak-frontend.vercel.app'),
  title: 'دليلك — دليل المواطن اللبناني للمعاملات الحكومية',
  description: 'دليلك: مساعدك الذكي لكل المعاملات الحكومية اللبنانية — جوازات السفر، سجل النفوس، تسجيل الشركات، تراخيص البناء، والمزيد. معلومات موثوقة ومحدّثة.',
  keywords: ['دليلك', 'معاملات لبنانية', 'جواز سفر', 'سجل نفوس', 'تسجيل شركة', 'ترخيص بناء', 'وزارة الداخلية', 'دولتي', 'مواطن لبناني'],
  authors: [{ name: 'دليلك', url: 'https://dalilak-frontend.vercel.app' }],
  creator: 'دليلك',
  publisher: 'دليلك',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
    shortcut: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'دليلك',
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

// ── Site-wide structured data (JSON-LD) ──────────────────────────────────────
// Organization + WebSite/SearchAction schema — invisible to users, helps
// search engines build a Knowledge Panel and (for WebSite) potentially show
// a sitelinks search box. Built only from real, already-in-use data: the
// real support WhatsApp number wired in batch #327 (ProcedureHelpRequest),
// and the homepage's actual ?q= query param, which already triggers a real
// AI search (see app/page.tsx's ?q= handler) — not a placeholder endpoint.
const SITE_ROOT = 'https://dalilak-frontend.vercel.app'
const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'دليلك',
  alternateName: 'Dalilak',
  url: SITE_ROOT,
  logo: `${SITE_ROOT}/logo.PNG`,
  description: 'مساعدك الذكي لكل المعاملات الحكومية اللبنانية — جوازات السفر، سجل النفوس، تسجيل الشركات، تراخيص البناء، والمزيد.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+9616694794',
    contactType: 'customer service',
    areaServed: 'LB',
    availableLanguage: ['Arabic', 'English'],
  },
}
const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'دليلك',
  url: SITE_ROOT,
  inLanguage: 'ar-LB',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_ROOT}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
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
          <MinistryQuickDial />
        </LanguageProvider>
      </body>
    </html>
  )
}
