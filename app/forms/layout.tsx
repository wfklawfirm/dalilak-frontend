import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'النماذج الرسمية اللبنانية | دليلك',
  description: 'قاعدة بيانات شاملة للنماذج والاستمارات الرسمية في لبنان — نماذج الداخلية، الخارجية، المالية، الجمارك، وأكثر من 60 نموذجاً قابلاً للتحميل.',
  openGraph: {
    title: 'النماذج الرسمية اللبنانية | دليلك',
    description: 'أكثر من 60 نموذجاً رسمياً — ابحث عن النموذج الذي تحتاجه وتحقّق من متطلباته.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'النماذج الرسمية اللبنانية | دليلك',
    description: 'أكثر من 60 نموذجاً رسمياً لبنانياً.',
  },
}

export default function FormsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
