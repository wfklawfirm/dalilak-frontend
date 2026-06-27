'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearToken } from '@/lib/auth'

const PROCEDURES = [
  {
    icon: '🛂',
    category_ar: 'سفر',
    category_en: 'Travel',
    items: [
      { icon: '📘', title_ar: 'جواز السفر اللبناني', title_en: 'Lebanese Passport', desc_ar: 'استخراج وتجديد جواز السفر', desc_en: 'Issue or renew passport', q_ar: 'كيف أستخرج أو أجدد جواز السفر اللبناني؟ ما هي الوثائق والرسوم والخطوات؟', q_en: 'How do I get or renew a Lebanese passport?' },
      { icon: '🪪', title_ar: 'بطاقة الهوية', title_en: 'National ID Card', desc_ar: 'إصدار وتجديد بطاقة الهوية', desc_en: 'Issue or renew ID card', q_ar: 'كيف أستخرج أو أجدد بطاقة الهوية اللبنانية؟', q_en: 'How do I get a Lebanese national ID card?' },
      { icon: '✈️', title_ar: 'تأشيرة الخروج', title_en: 'Exit Visa', desc_ar: 'تصريح مغادرة الأراضي', desc_en: 'Permission to leave Lebanon', q_ar: 'كيف أحصل على تأشيرة خروج من لبنان؟', q_en: 'How do I get an exit visa from Lebanon?' },
    ],
  },
  {
    icon: '👶',
    category_ar: 'الأحوال الشخصية',
    category_en: 'Civil Status',
    items: [
      { icon: '📋', title_ar: 'شهادة الميلاد', title_en: 'Birth Certificate', desc_ar: 'تسجيل المولود واستخراج شهادة', desc_en: 'Register newborn and get certificate', q_ar: 'كيف أسجل مولوداً واستخرج شهادة ميلاد في لبنان؟', q_en: 'How do I register a newborn and get a birth certificate?' },
      { icon: '💍', title_ar: 'تسجيل الزواج', title_en: 'Marriage Registration', desc_ar: 'توثيق وتسجيل عقد الزواج', desc_en: 'Document and register marriage', q_ar: 'كيف أسجل عقد الزواج رسمياً في لبنان؟', q_en: 'How do I officially register a marriage in Lebanon?' },
      { icon: '🕊️', title_ar: 'شهادة الوفاة', title_en: 'Death Certificate', desc_ar: 'إجراءات تسجيل الوفاة', desc_en: 'Death registration procedures', q_ar: 'كيف أسجل وفاة وأستخرج شهادة الوفاة في لبنان؟', q_en: 'How do I register a death and get a death certificate?' },
    ],
  },
  {
    icon: '🏢',
    category_ar: 'الأعمال',
    category_en: 'Business',
    items: [
      { icon: '🏭', title_ar: 'تسجيل شركة', title_en: 'Company Registration', desc_ar: 'تأسيس وتسجيل شركة تجارية', desc_en: 'Establish and register a company', q_ar: 'كيف أسجل شركة في لبنان؟ ما هي الخطوات والوثائق والرسوم؟', q_en: 'How do I register a company in Lebanon?' },
      { icon: '📄', title_ar: 'الرخصة التجارية', title_en: 'Trade License', desc_ar: 'استخراج رخصة مزاولة الأعمال', desc_en: 'Get a business operating license', q_ar: 'كيف أستخرج رخصة تجارية في لبنان؟', q_en: 'How do I get a trade license in Lebanon?' },
      { icon: '💼', title_ar: 'السجل التجاري', title_en: 'Commercial Register', desc_ar: 'التسجيل في السجل التجاري', desc_en: 'Commercial register enrollment', q_ar: 'كيف أسجل في السجل التجاري اللبناني؟', q_en: 'How do I register in the Lebanese commercial register?' },
    ],
  },
  {
    icon: '🚗',
    category_ar: 'المركبات',
    category_en: 'Vehicles',
    items: [
      { icon: '🚘', title_ar: 'تسجيل سيارة', title_en: 'Vehicle Registration', desc_ar: 'تسجيل مركبة جديدة أو مستعملة', desc_en: 'Register new or used vehicle', q_ar: 'كيف أسجل سيارة في لبنان؟ ما هي الإجراءات والرسوم؟', q_en: 'How do I register a vehicle in Lebanon?' },
      { icon: '🪪', title_ar: 'رخصة القيادة', title_en: 'Driver\'s License', desc_ar: 'استخراج وتجديد رخصة القيادة', desc_en: 'Get or renew driver\'s license', q_ar: 'كيف أستخرج أو أجدد رخصة القيادة اللبنانية؟', q_en: 'How do I get or renew a Lebanese driver\'s license?' },
      { icon: '🔄', title_ar: 'نقل ملكية سيارة', title_en: 'Vehicle Transfer', desc_ar: 'إجراءات نقل ملكية المركبة', desc_en: 'Transfer vehicle ownership', q_ar: 'كيف أنقل ملكية سيارة في لبنان؟', q_en: 'How do I transfer vehicle ownership in Lebanon?' },
    ],
  },
  {
    icon: '🏠',
    category_ar: 'العقارات',
    category_en: 'Real Estate',
    items: [
      { icon: '🏗️', title_ar: 'رخصة البناء', title_en: 'Building Permit', desc_ar: 'استخراج تصريح البناء', desc_en: 'Get a construction permit', q_ar: 'كيف أستخرج رخصة بناء في لبنان؟', q_en: 'How do I get a building permit in Lebanon?' },
      { icon: '📝', title_ar: 'نقل ملكية عقار', title_en: 'Property Transfer', desc_ar: 'إجراءات نقل الملكية العقارية', desc_en: 'Real estate ownership transfer', q_ar: 'ما هي إجراءات نقل ملكية العقار في لبنان والرسوم المترتبة؟', q_en: 'What are the property transfer procedures in Lebanon?' },
      { icon: '📋', title_ar: 'عقد الإيجار', title_en: 'Rental Contract', desc_ar: 'توثيق وتسجيل عقد إيجار', desc_en: 'Notarize and register rental contract', q_ar: 'كيف أوثق وأسجل عقد إيجار في لبنان؟', q_en: 'How do I register a rental contract in Lebanon?' },
    ],
  },
  {
    icon: '⚖️',
    category_ar: 'الضمان والعمل',
    category_en: 'Work & Social',
    items: [
      { icon: '🏥', title_ar: 'الضمان الاجتماعي', title_en: 'Social Security', desc_ar: 'تسجيل وخدمات الضمان الاجتماعي', desc_en: 'NSSF registration and services', q_ar: 'كيف أسجل في الضمان الاجتماعي اللبناني؟ ما هي الخدمات المتاحة؟', q_en: 'How do I register with Lebanese social security (NSSF)?' },
      { icon: '📜', title_ar: 'تصريح العمل', title_en: 'Work Permit', desc_ar: 'تصاريح العمل للأجانب', desc_en: 'Work permits for foreigners', q_ar: 'كيف يحصل الأجانب على تصريح عمل في لبنان؟', q_en: 'How do foreigners get a work permit in Lebanon?' },
      { icon: '🎓', title_ar: 'تصديق الشهادات', title_en: 'Degree Attestation', desc_ar: 'تصديق وتوثيق الشهادات', desc_en: 'Attest and verify academic degrees', q_ar: 'كيف أصدق شهادتي الجامعية في لبنان؟', q_en: 'How do I attest my university degree in Lebanon?' },
    ],
  },
]

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const handleProcedure = (item: typeof PROCEDURES[0]['items'][0]) => {
    const q = isAr ? item.q_ar : item.q_en
    router.push(`/?q=${encodeURIComponent(q)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Cairo', 'Inter', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)',
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
            fontSize: 12, fontFamily: 'inherit',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
          <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
            {isAr ? 'المعاملات الشائعة' : 'Common Procedures'}
          </h1>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{
            background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'inherit', fontWeight: 700,
          }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>
        <p style={{ fontSize: 12, color: '#9C8E80', marginBottom: 20, textAlign: 'center' }}>
          {isAr ? 'اختر المعاملة للحصول على دليل شامل' : 'Select a procedure for a comprehensive guide'}
        </p>

        {PROCEDURES.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', margin: 0 }}>
                {isAr ? cat.category_ar : cat.category_en}
              </h2>
              <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.items.map((item, ii) => (
                <button key={ii} onClick={() => handleProcedure(item)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(139,26,26,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)',
                    border: '1px solid rgba(139,26,26,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>
                      {isAr ? item.title_ar : item.title_en}
                    </div>
                    <div style={{ fontSize: 11, color: '#9C8E80', marginTop: 2 }}>
                      {isAr ? item.desc_ar : item.desc_en}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2" style={{ flexShrink: 0, transform: isAr ? 'rotate(180deg)' : 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
