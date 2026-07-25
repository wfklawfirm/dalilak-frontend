'use client'
import { useLanguage } from '@/lib/LanguageContext'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProcedureLoading() {
  const { isAr } = useLanguage()
  return <LoadingSpinner isAr={isAr} fullPage />
}
