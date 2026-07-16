import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور | دليلك',
  description: 'أدخل رمز إعادة التعيين وكلمة المرور الجديدة لاستعادة حسابك في دليلك.',
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
