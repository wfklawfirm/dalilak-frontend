import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'استعادة كلمة المرور | دليلك',
  description: 'استعد الوصول إلى حسابك في دليلك — أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
