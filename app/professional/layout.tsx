import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'مساحة العمل المهنية | دليلك',
}

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  return children
}
