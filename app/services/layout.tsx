import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'الخدمات القانونية والإدارية | دليلك',
  description: 'تصفّح أكثر من 200 خدمة قانونية وإدارية في لبنان — هوية، جواز، عقارات، شركات، زواج، ميراث، وخدمات للمغتربين.',
  openGraph: {
    title: 'الخدمات القانونية والإدارية | دليلك',
    description: 'أكثر من 200 خدمة قانونية وإدارية منظّمة حسب الوزارة والفئة.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'الخدمات القانونية والإدارية | دليلك',
    description: 'أكثر من 200 خدمة قانونية وإدارية في لبنان.',
  },
  alternates: { canonical: '/services' },
}

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
