'use client'

// زر تبديل اللغة العائم — يظهر على كل صفحة في الموقع بلا استثناء (بما فيها صفحات
// تسجيل الدخول، الإدارة، وأي صفحة قد لا تملك TopNav أو BottomNav خاصاً بها).
// هذا يضمن أن كل مستخدم — خصوصاً على الهاتف حيث كان الزر مخفياً سابقاً في
// TopNav وBottomNav لا يملك أي زر لغة إطلاقاً — يجد دائماً طريقة واضحة للتبديل.

import { useLanguage } from '@/lib/LanguageContext'

export default function GlobalLangSwitch() {
  const { isAr, toggleLang } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="global-lang-switch no-print"
      aria-label={isAr ? 'تغيير اللغة إلى الإنجليزية' : 'Switch to Arabic'}
      style={{
        position: 'fixed',
        bottom: 'calc(182px + env(safe-area-inset-bottom, 0px))',
        [isAr ? 'left' : 'right']: 14,
        zIndex: 8400,
        height: 34,
        minWidth: 46,
        padding: '0 12px',
        borderRadius: 20,
        border: '1.5px solid rgba(143,29,44,0.25)',
        background: '#fff',
        color: '#8F1D2C',
        fontSize: 11.5,
        fontWeight: 800,
        letterSpacing: '0.4px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 16px rgba(80,10,10,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  )
}
