'use client'

// ── /services/expat-property — Verified Vertical: Expat + Property + Contracts ──
// Phase 4: First world-class verified pack with guided experience.

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_GROUPS, type ServiceItem } from '@/lib/serviceGroups'

// Collect the relevant service items from the 3 groups
const EXPAT_ITEMS = SERVICE_GROUPS.find(g => g.slug === 'expat')?.services ?? []
const PROPERTY_ITEMS = SERVICE_GROUPS.find(g => g.slug === 'property')?.services ?? []
const CONTRACT_ITEMS = SERVICE_GROUPS.find(g => g.slug === 'contracts')?.services ?? []

type PackSection = {
  id: string
  icon: React.ReactNode
  titleAr: string
  titleEn: string
  color: string
  items: ServiceItem[]
}

const PACK_SECTIONS: PackSection[] = [
  { id: 'expat',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, titleAr: 'المغتربون', titleEn: 'Expat Services', color: '#8B1A1A', items: EXPAT_ITEMS },
  { id: 'property',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>, titleAr: 'العقارات', titleEn: 'Property', color: '#854D0E', items: PROPERTY_ITEMS },
  { id: 'contracts', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>, titleAr: 'العقود', titleEn: 'Contracts', color: '#7C3AED', items: CONTRACT_ITEMS },
]

const HOW_IT_WORKS_AR = [
  { step: 1, text: 'اختر معاملتك من الحزمة أدناه' },
  { step: 2, text: 'ارفع مستنداً أو ابدأ المسار الموجّه' },
  { step: 3, text: 'احصل على قائمة المستندات الناقصة ومستوى الخطر' },
  { step: 4, text: 'حمّل الـ Checklist أو اطلب مراجعة بشرية' },
]

const HOW_IT_WORKS_EN = [
  { step: 1, text: 'Choose your transaction from the pack below' },
  { step: 2, text: 'Upload a document or start the guided path' },
  { step: 3, text: 'Get missing documents list and risk level' },
  { step: 4, text: 'Download checklist or request human review' },
]

export default function ExpatPropertyPackPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [activeSection, setActiveSection] = useState<string>('expat')
  const isAr = lang === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  const handleService = (item: ServiceItem) => {
    if (item.defaultAction === 'upload_document') {
      router.push(`/?action=upload&service=${item.slug}`)
    } else if (item.defaultAction === 'generate_checklist') {
      const q = isAr ? `أعطني checklist لـ: ${item.titleAr}` : `Give me a checklist for: ${item.titleEn}`
      router.push(`/?q=${encodeURIComponent(q)}`)
    } else if (item.defaultAction === 'start_flow') {
      router.push(`/?action=flow&procedure=${item.procedureSlug ?? ''}`)
    } else {
      const q = isAr ? (item.chatPromptAr ?? item.titleAr) : (item.chatPromptEn ?? item.titleEn)
      router.push(`/?q=${encodeURIComponent(q)}`)
    }
  }

  const currentSection = PACK_SECTIONS.find(s => s.id === activeSection)!

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={dir}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        .svc-card:hover { border-color: #8B1A1A !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(139,26,26,0.10) !important; }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #5c1212 0%, #8B1A1A 100%)',
        padding: '14px 16px 18px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button onClick={() => router.push('/services')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {isAr ? 'حزمة المغتربين والعقارات والعقود' : 'Expat, Property & Contracts Pack'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
                {isAr ? 'مسار موثّق وشامل' : 'Verified comprehensive path'}
              </div>
            </div>
            <button
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >{isAr ? 'EN' : 'AR'}</button>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {PACK_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.3)',
                  background: activeSection === s.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {s.icon} {isAr ? s.titleAr : s.titleEn}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 100px' }}>

        {/* How it works */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F0F0F0', padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            {isAr ? 'كيف يعمل المسار؟' : 'How does the path work?'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(isAr ? HOW_IT_WORKS_AR : HOW_IT_WORKS_EN).map(step => (
              <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: '#8B1A1A', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{step.step}</div>
                <span style={{ fontSize: 11.5, color: '#374151' }}>{step.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#FEF2F2', borderRadius: 10, border: '1px solid rgba(139,26,26,0.1)' }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              {isAr
                ? 'هذا المسار للإرشاد فقط وليس استشارة قانونية رسمية. تأكد من المتطلبات الحالية من الجهة المختصة.'
                : 'This path is for guidance only and is not official legal advice. Verify current requirements with the competent authority.'}
            </p>
          </div>
        </div>

        {/* Current section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${currentSection.color}14`, border: `1.5px solid ${currentSection.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: currentSection.color,
          }}>
            <span style={{ transform: 'scale(1.5)' }}>{currentSection.icon}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
              {isAr ? currentSection.titleAr : currentSection.titleEn}
            </div>
            <div style={{ fontSize: 10.5, color: '#6B7280' }}>
              {currentSection.items.length} {isAr ? 'خدمات متاحة' : 'available services'}
            </div>
          </div>
        </div>

        {/* Service cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {currentSection.items.map(item => {
            const actionIcon: React.ReactNode = item.defaultAction === 'upload_document'
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              : item.defaultAction === 'generate_checklist'
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              : item.defaultAction === 'start_flow'
              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            const actionLabel = item.defaultAction === 'upload_document'
              ? (isAr ? 'ارفع مستنداً' : 'Upload Document')
              : item.defaultAction === 'generate_checklist'
              ? 'Checklist'
              : item.defaultAction === 'start_flow'
              ? (isAr ? 'ابدأ المسار' : 'Start Path')
              : (isAr ? 'اسأل AI' : 'Ask AI')

            return (
              <button
                key={item.id}
                className="svc-card"
                onClick={() => handleService(item)}
                style={{
                  background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 14,
                  padding: '14px 14px', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: isAr ? 'right' : 'left',
                  transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: `${currentSection.color}14`,
                  border: `1.5px solid ${currentSection.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: currentSection.color,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
                    {isAr ? item.titleAr : item.titleEn}
                  </div>
                  {(isAr ? item.descriptionAr : item.descriptionEn) && (
                    <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.45 }}>
                      {isAr ? item.descriptionAr : item.descriptionEn}
                    </div>
                  )}
                  {item.requiresDocument && (
                    <div style={{ fontSize: 9.5, color: '#B45309', fontWeight: 600, marginTop: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                    {isAr ? 'يتطلب رفع مستند' : 'Requires document upload'}
                  </span>
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '7px 12px', borderRadius: 9,
                  background: '#8B1A1A', color: '#fff',
                  fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {actionIcon} {actionLabel}
                </div>
              </button>
            )
          })}
        </div>

        {/* Human review CTA */}
        <div style={{ marginTop: 18, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            {isAr ? 'تحتاج مراجعة بشرية؟' : 'Need human review?'}
          </div>
          <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5 }}>
            {isAr
              ? 'في المعاملات المعقدة أو العقارية أو العقود ذات المخاطر العالية، يُنصح بمراجعة مختص.'
              : 'For complex, property, or high-risk contract transactions, specialist review is recommended.'}
          </p>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? 'أريد طلب مراجعة بشرية من مختص قانوني' : 'I want to request a human legal review')}`)}
            style={{
              padding: '9px 18px', borderRadius: 10,
              background: 'linear-gradient(135deg, #5c1212, #8B1A1A)',
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              {isAr ? 'اطلب مراجعة الآن' : 'Request Review'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
