import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'استوديو الصياغة القانونية | دليلك',
  description: 'صِغ وثائقك القانونية بمساعدة الذكاء الاصطناعي — عقود، شكاوى، طلبات رسمية، وأكثر من 130 صيغة قانونية جاهزة للتخصيص.',
  openGraph: {
    title: 'استوديو الصياغة القانونية | دليلك',
    description: 'أداة ذكاء اصطناعي لصياغة الوثائق والعقود والطلبات القانونية باللغة العربية.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'استوديو الصياغة القانونية | دليلك',
    description: 'صِغ وثائقك القانونية بمساعدة الذكاء الاصطناعي.',
  },
}

export default function DraftingStudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
