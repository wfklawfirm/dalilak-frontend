import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | دليلك',
  description: 'أجوبة على أكثر الأسئلة شيوعاً حول المعاملات الحكومية والإجراءات الرسمية في لبنان — جوازات، هوية، زواج، شركات وأكثر.',
  openGraph: {
    title: 'الأسئلة الشائعة | دليلك',
    description: 'إجابات على أكثر الأسئلة شيوعاً عن الإجراءات الرسمية في لبنان.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'الأسئلة الشائعة | دليلك',
    description: 'إجابات على أكثر الأسئلة شيوعاً عن الإجراءات الرسمية في لبنان.',
  },
}

export default function FaqLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
