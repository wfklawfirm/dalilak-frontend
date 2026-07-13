import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'تسجيل الدخول | دليلك AI',
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
