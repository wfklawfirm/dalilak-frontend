'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const FORMS = [
  {
    category_ar: 'السفر والهوية',
    category_en: 'Travel & Identity',
    items: [
      { icon: '📘', title_ar: 'طلب جواز سفر', title_en: 'Passport Application', ministry_ar: 'الأمن العام', ministry_en: 'General Security', url: 'https://www.general-security.gov.lb', q_ar: 'ما هو نموذج طلب جواز السفر اللبناني وأين أحصل عليه؟', q_en: 'What is the Lebanese passport application form and where to get it?' },
      { icon: '🪪', title_ar: 'طلب بطاقة هوية', title_en: 'ID Card Application', ministry_ar: 'وزارة الداخلية', ministry_en: 'Ministry of Interior', url: 'https://www.interior.gov.lb', q_ar: 'كيف أملأ نموذج طلب بطاقة الهوية اللبنانية؟', q_en: 'How do I fill the Lebanese ID card application form?' },
    ],
  },
  {
    category_ar: 'العقارات',
    category_en: 'Real Estate',
    items: [
      { icon: '📝', title_ar: 'طلب نقل ملكية', title_en: 'Property Transfer Form', ministry_ar: 'دائرة التسجيل العقاري', ministry_en: 'Real Estate Dept.', url: 'https://www.deeds.gov.lb', q_ar: 'ما هو نموذج نقل ملكية العقار في لبنان؟', q_en: 'What is the property transfer form in Lebanon?' },
      { icon: '🏗️', title_ar: 'طلب رخصة بناء', title_en: 'Building Permit Request', ministry_ar: 'وزارة الأشغال', ministry_en: 'Ministry of Public Works', url: 'https://www.publicworks.gov.lb', q_ar: 'ما هي نماذج طلب رخصة البناء في لبنان؟', q_en: 'What are the building permit application forms in Lebanon?' },
    ],
  },
  {
    category_ar: 'الأعمال التجارية',
    category_en: 'Business',
    items: [
      { icon: '🏭', title_ar: 'تسجيل شركة SAL', title_en: 'SAL Company Registration', ministry_ar: 'وزارة العدل', ministry_en: 'Ministry of Justice', url: 'https://www.justice.gov.lb', q_ar: 'ما هي نماذج تسجيل شركة مساهمة في لبنان؟', q_en: 'What are the forms for registering a joint-stock company in Lebanon?' },
      { icon: '📄', title_ar: 'طلب سجل تجاري', title_en: 'Commercial Register', ministry_ar: 'وزارة الاقتصاد', ministry_en: 'Ministry of Economy', url: 'https://www.economy.gov.lb', q_ar: 'ما هو نموذج التسجيل في السجل التجاري اللبناني؟', q_en: 'What is the Lebanese commercial register application form?' },
    ],
  },
  {
    category_ar: 'الضمان الاجتماعي',
    category_en: 'Social Security',
    items: [
      { icon: '🏥', title_ar: 'طلب تسجيل NSSF', title_en: 'NSSF Registration', ministry_ar: 'الضمان الاجتماعي', ministry_en: 'NSSF', url: 'https://www.cnss.gov.lb', q_ar: 'ما هي نماذج التسجيل في الضمان الاجتماعي اللبناني؟', q_en: 'What are the Lebanese NSSF registration forms?' },
      { icon: '💊', title_ar: 'مطالبة تعويض صحي', title_en: 'Medical Claim Form', ministry_ar: 'الضمان الاجتماعي', ministry_en: 'NSSF', url: 'https://www.cnss.gov.lb', q_ar: 'كيف أقدم مطالبة تعويض طبي من الضمان الاجتماعي؟', q_en: 'How do I submit a medical reimbursement claim to NSSF?' },
    ],
  },
]

export default function FormsPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const handleForm = (q: string) => {
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
            {isAr ? 'النماذج الرسمية' : 'Official Forms'}
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

        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FDF8E8 0%, #FEF3C7 100%)',
          border: '1px solid #FCD34D', borderRadius: 14,
          padding: '12px 16px', marginBottom: 20,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.6 }}>
            {isAr
              ? 'اضغط على أي نموذج لسؤال الأيجنت عنه والحصول على دليل إرشادي شامل وخطوات التعبئة.'
              : 'Tap any form to ask the agent about it and get a comprehensive guide with filling instructions.'}
          </p>
        </div>

        {FORMS.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#5C3A1A', margin: 0, whiteSpace: 'nowrap' }}>
                {isAr ? cat.category_ar : cat.category_en}
              </h2>
              <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.items.map((item, ii) => (
                <button key={ii}
                  onClick={() => handleForm(isAr ? item.q_ar : item.q_en)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: '#fff', border: '1.5px solid #EAE4D9',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: isAr ? 'right' : 'left',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(184,134,11,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
                  onTouchStart={e => { e.currentTarget.style.background = '#FDF8E8' }}
                  onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #FDF8E8 0%, #FEF3C7 100%)',
                    border: '1px solid rgba(184,134,11,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>
                      {isAr ? item.title_ar : item.title_en}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#9C8E80', marginTop: 2 }}>
                      {isAr ? item.ministry_ar : item.ministry_en}
                    </div>
                  </div>
                  <div style={{
                    flexShrink: 0, background: '#FEF2F2', borderRadius: 8,
                    padding: '4px 8px', fontSize: 10, color: '#8B1A1A', fontWeight: 600,
                  }}>
                    {isAr ? 'دليل' : 'Guide'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
