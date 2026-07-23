import type { MetadataRoute } from 'next'

/**
 * manifest.ts — Next.js metadata route, served at /manifest.webmanifest.
 * Was missing entirely, so the app had no "Add to Home Screen" / installable
 * PWA support on mobile. Icons (icon-192.png, icon-512.png) are square,
 * padded resizes of the existing public/logo-icon.png — same real logo
 * already used across the app, no new artwork. Purely additive: Next.js
 * auto-links this file, no changes to any existing page, route, or
 * metadata were needed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'دليلك — دليل المواطن اللبناني',
    short_name: 'دليلك',
    description: 'مساعدك الذكي لكل المعاملات الحكومية اللبنانية — جوازات السفر، سجل النفوس، تسجيل الشركات، تراخيص البناء، والمزيد.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#8F1D2C',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
