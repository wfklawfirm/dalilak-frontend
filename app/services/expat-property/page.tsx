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
  icon: string
  titleAr: string
  titleEn: string
  color: string
  items: ServiceItem[]
}

const PACK_SECTIONS: PackSection[] = [
  { id: 'expat', icon: '✈️', titleAr: 'المغتربون', titleEn: 'Expat Services', color: '#1E40AF', items: EXPAT_ITEMS },
  { id: 'property', icon: '🏛️', titleAr: 'العقارات', titleEn: 'Property', color: '#854D0E', items: PROPERTY_ITEMS },
  { id: 'contracts', icon: '📝', titleAr: 'العقود', titleEn: 'Contracts', color: '#7C3AED', items: CONTRACT_ITEMS },
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
        background: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 100%)',
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
                {isAr ? '✈️🏛️ حزمة المغتربين والعقارات والعقود' : '✈️🏛️ Expat, Property & Contracts Pack'}
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
          <div style={{ fontSize: 12, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
            {isAr ? '📋 كيف يعمل المسار؟' : '📋 How does the path work?'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(isAr ? HOW_IT_WORKS_AR : HOW_IT_WORKS_EN).map(step => (
              <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: '#1E40AF', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{step.step}</div>
                <span style={{ fontSize: 11.5, color: '#374151' }}>{step.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#FEF2F2', borderRadius: 10, border: '1px solid rgba(139,26,26,0.1)' }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              {isAr
                ? '⚠️ هذا المسار للإرشاد فقط وليس استشارة قانونية رسمية. تأكد من المتطلبات الحالية من الجهة المختصة.'
                : '⚠️ This path is for guidance only and is not official legal advice. Verify current requirements with the competent authority.'}
            </p>
          </div>
        </div>

        {/* Current section title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${currentSection.color}14`, border: `1.5px solid ${currentSection.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {currentSection.icon}
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
            const actionIcon = item.defaultAction === 'upload_document' ? '📎'
              : item.defaultAction === 'generate_checklist' ? '✅'
              : item.defaultAction === 'start_flow' ? '▶'
              : '💬'
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {item.icon ?? currentSection.icon}
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
                      {isAr ? '📎 يتطلب رفع مستند' : '📎 Requires document upload'}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '7px 12px', borderRadius: 9,
                  background: '#8B1A1A', color: '#fff',
                  fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {actionIcon} {actionLabel}
                </div>
              </button>
            )
          })}
        </div>

        {/* Human review CTA */}
        <div style={{ marginTop: 18, background: '#fff', border: '1.5px solid #F0F0F0', borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
            {isAr ? '👨‍💼 تحتاج مراجعة بشرية؟' : '👨‍💼 Need human review?'}
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
              background: 'linear-gradient(135deg, #1E3A5F, #1E40AF)',
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isAr ? '← اطلب مراجعة الآن' : 'Request Review →'}
          </button>
        </div>
      </div>
    </div>
  )
}
