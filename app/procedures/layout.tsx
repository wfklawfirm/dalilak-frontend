import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'دليل المعاملات الرسمية | دليلك AI',
  description: 'تصفّح جميع المعاملات الحكومية والإجراءات الرسمية في لبنان — جوازات، هويات، عقارات، شركات، وأكثر.',
  openGraph: {
    title: 'دليل المعاملات الرسمية | دليلك AI',
    description: 'جميع الإجراءات الحكومية في لبنان خطوة بخطوة.',
    siteName: 'دليلك AI',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'دليل المعاملات الرسمية | دليلك AI',
    description: 'جميع الإجراءات الحكومية في لبنان خطوة بخطوة.',
  },
}

export default function ProceduresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
