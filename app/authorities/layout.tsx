import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'الجهات الحكومية في لبنان | دليلك',
  description: 'دليل شامل لجميع الوزارات والجهات الحكومية في لبنان — وزارة الداخلية، الخارجية، العدل، المالية، وأكثر من 30 جهة رسمية.',
  openGraph: {
    title: 'الجهات الحكومية في لبنان | دليلك',
    description: 'دليل الوزارات والجهات الحكومية اللبنانية — اتصل وتواصل مع الجهة المختصة.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'الجهات الحكومية في لبنان | دليلك',
    description: 'دليل الوزارات والجهات الحكومية اللبنانية.',
  },
}

export default function AuthoritiesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
