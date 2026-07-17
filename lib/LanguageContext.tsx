'use client'

// دليلك — سياق اللغة المشترك عبر كل صفحات الموقع
//
// المشكلة التي يحلّها هذا الملف: كانت كل صفحة تحتفظ بحالة لغة محلية خاصة بها
// (useState('ar'|'en'))، فكان التبديل للإنجليزية في صفحة واحدة لا ينتقل معك إلى
// أي صفحة أخرى — بمجرد الانتقال، ترجع اللغة للعربية تلقائياً. هذا الملف يوفّر
// حالة لغة واحدة مشتركة، محفوظة في localStorage (المفتاح 'dalilak_lang')، تُقرأ
// وتُكتب من أي صفحة عبر useLanguage().

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

export type Lang = 'ar' | 'en'

interface LanguageContextValue {
  lang: Lang
  isAr: boolean
  setLang: (l: Lang) => void
  toggleLang: () => void
}

const STORAGE_KEY = 'dalilak_lang'

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // نبدأ دائماً بـ'ar' في أول عرض (SSR) لتفادي أي عدم تطابق (hydration mismatch)،
  // ثم نقرأ القيمة الحقيقية المحفوظة فور التحميل على المتصفح.
  const [lang, setLangState] = useState<Lang>('ar')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === 'ar' || saved === 'en') {
        setLangState(saved)
      }
    } catch {
      // localStorage قد يكون غير متاح (وضع خاص) — نتجاهل بصمت ونبقى على 'ar'
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang, hydrated])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggleLang = useCallback(() => setLangState(prev => (prev === 'ar' ? 'en' : 'ar')), [])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, isAr: lang === 'ar', setLang, toggleLang }),
    [lang, setLang, toggleLang]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // احتياط: أي مكوّن نُسي تغليفه بـ LanguageProvider يحصل على قيمة افتراضية
    // آمنة بدل انهيار كامل للتطبيق (defensive fallback, not meant to be relied on).
    return { lang: 'ar', isAr: true, setLang: () => {}, toggleLang: () => {} }
  }
  return ctx
}
