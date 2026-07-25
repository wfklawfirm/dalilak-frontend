import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | دليلك',
  description: 'كيف يتعامل دليلك مع بياناتك: ما يُخزَّن محلياً على جهازك، بيانات الحساب، والمحادثة مع الذكاء الاصطناعي.',
  openGraph: {
    title: 'سياسة الخصوصية | دليلك',
    description: 'كيف يتعامل دليلك مع بياناتك الشخصية.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'سياسة الخصوصية | دليلك',
    description: 'كيف يتعامل دليلك مع بياناتك الشخصية.',
  },
  alternates: { canonical: '/privacy' },
}

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
