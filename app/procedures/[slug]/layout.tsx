import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'تفاصيل الإجراء | دليلك',
  description: 'دليل خطوة بخطوة للإجراءات الرسمية اللبنانية — المستندات المطلوبة، الجهة المختصة، الرسوم، والمهل.',
  openGraph: {
    title: 'تفاصيل الإجراء | دليلك',
    description: 'دليل خطوة بخطوة للإجراءات الرسمية اللبنانية.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'تفاصيل الإجراء | دليلك',
    description: 'دليل خطوة بخطوة للإجراءات الرسمية اللبنانية.',
  },
}

export default function ProcedureSlugLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
