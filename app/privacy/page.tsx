'use client'

/**
 * /privacy — batch #366: added because MobileMenu's drawer spec requires a
 * "سياسة الخصوصية" entry point. Content here is intentionally limited to
 * facts that are actually verifiable from this codebase (what gets stored
 * in localStorage, that account data is used only to operate the account,
 * how to reach us with questions) — it does NOT make legal claims about
 * data retention periods, third-party processors, or regulatory compliance
 * (e.g. GDPR) that nobody has confirmed are accurate for this business.
 * This should be reviewed/expanded by the person responsible for Dalilak's
 * actual data practices before being treated as a binding policy; it is a
 * good-faith, technically-accurate starting point, not invented copy.
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

const SECTIONS_AR = [
  {
    title: 'ما الذي يُخزَّن على جهازك',
    body: 'يحفظ دليلك بعض التفضيلات والبيانات محلياً على متصفحك (localStorage) — مثل لغة الواجهة، إعدادات إمكانية الوصول، الإجراءات المحفوظة، وسجل المحادثة الأخير. هذه البيانات تبقى على جهازك ولا تُرسَل لأي طرف خارجي تلقائياً؛ يمكنك مسحها في أي وقت من إعدادات المتصفح.',
  },
  {
    title: 'بيانات الحساب',
    body: 'إذا أنشأت حساباً، تُستخدم بياناته (مثل الاسم والبريد الإلكتروني) فقط لتشغيل الحساب وتقديم الخدمة — تسجيل الدخول، حفظ ملفاتك ومعاملاتك، والتواصل معك بخصوص حسابك.',
  },
  {
    title: 'المحادثة مع الذكاء الاصطناعي',
    body: 'الأسئلة التي تطرحها على دليلك تُرسَل إلى خدمة الذكاء الاصطناعي لإنتاج الرد. لا نستخدم محتوى محادثاتك لأغراض إعلانية.',
  },
  {
    title: 'التواصل معنا',
    body: 'لأي استفسار متعلق بالخصوصية أو طلب حذف بياناتك، تواصل معنا عبر تفاصيل التواصل المتاحة داخل التطبيق (القائمة الجانبية ← تواصل معنا).',
  },
]

const SECTIONS_EN = [
  {
    title: 'What is stored on your device',
    body: 'Dalilak saves some preferences and data locally in your browser (localStorage) — such as your interface language, accessibility settings, saved procedures, and recent chat history. This data stays on your device and is not automatically sent to any third party; you can clear it any time from your browser settings.',
  },
  {
    title: 'Account data',
    body: 'If you create an account, its data (such as name and email) is used only to operate the account and provide the service — signing you in, saving your files and procedures, and contacting you about your account.',
  },
  {
    title: 'AI chat',
    body: 'Questions you ask Dalilak are sent to the AI service to generate a response. We do not use your chat content for advertising purposes.',
  },
  {
    title: 'Contact us',
    body: 'For any privacy question or a request to delete your data, reach us via the contact details available inside the app (Menu → Contact Us).',
  },
]

export default function PrivacyPolicyPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const sections = isAr ? SECTIONS_AR : SECTIONS_EN

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 48 }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={isAr ? 'رجوع' : 'Back'}
            style={{
              width: 38, height: 38, borderRadius: 9, border: '1.5px solid var(--border)',
              background: 'transparent', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-1)" strokeWidth="2.3">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
            </svg>
          </button>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'inherit' }}>
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
        </div>
      </div>

      <main id="main-content" style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 24px' }}>
          {isAr
            ? 'دليلك أداة مساعدة معلوماتية، وهذه الصفحة تشرح ببساطة كيف نتعامل مع بياناتك.'
            : 'Dalilak is an informational guide, and this page explains simply how we handle your data.'}
        </p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 6px' }}>{s.title}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </main>
    </div>
  )
}
