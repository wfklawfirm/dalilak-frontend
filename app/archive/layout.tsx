import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'أرشيف الوثائق الرسمية | دليلك',
  description: 'أرشيف بحثي لأكثر من 4300 وثيقة حكومية لبنانية حقيقية — قرارات مصرف لبنان، تعاميم جمركية، قرارات وزارية، تقارير رسمية، ونماذج معاملات من 18 جهة حكومية.',
  openGraph: {
    title: 'أرشيف الوثائق الرسمية | دليلك',
    description: 'أكثر من 4300 وثيقة حكومية لبنانية حقيقية وقابلة للبحث والتحميل.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'أرشيف الوثائق الرسمية | دليلك',
    description: 'أكثر من 4300 وثيقة حكومية لبنانية حقيقية.',
  },
  alternates: { canonical: '/archive' },
}

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
