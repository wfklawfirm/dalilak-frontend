import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'خدمات المغتربين والعقارات في لبنان | دليلك',
  description: 'دليل شامل لخدمات المغتربين اللبنانيين، المعاملات العقارية، والعقود الرسمية — تسجيل عقارات، توثيق عقود، خدمات القنصليات، وأكثر من 40 خدمة.',
  openGraph: {
    title: 'خدمات المغتربين والعقارات | دليلك',
    description: 'دليل شامل لخدمات المغتربين اللبنانيين، المعاملات العقارية، والعقود الرسمية.',
    siteName: 'دليلك',
    locale: 'ar_LB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'خدمات المغتربين والعقارات | دليلك',
    description: 'دليل شامل لخدمات المغتربين اللبنانيين، المعاملات العقارية، والعقود الرسمية.',
  },
  alternates: { canonical: '/services/expat-property' },
}

export default function ExpatPropertyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
