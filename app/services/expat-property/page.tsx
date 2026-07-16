'use client'

// /services/expat-property — Expat + Property + Contracts Pack

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_GROUPS, type ServiceItem } from '@/lib/serviceGroups'
import BottomNav from '@/components/BottomNav'

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
  {
    id: 'expat',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    titleAr: 'المغتربون',
    titleEn: 'Expat Services',
    color: '#8B1A1A',
    items: EXPAT_ITEMS,
  },
  {
    id: 'property',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/>
      </svg>
    ),
    titleAr: 'العقارات',
    titleEn: 'Property',
    color: '#92400E',
    items: PROPERTY_ITEMS,
  },
  {
    id: 'contracts',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    ),
    titleAr: 'العقود',
    titleEn: 'Contracts',
    color: '#44403C',
    items: CONTRACT_ITEMS,
  },
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

function ServiceIcon({ action }: { action: string }) {
  if (action === 'upload_document') return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
    </svg>
  )
  if (action === 'generate_checklist') return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  )
  if (action === 'start_flow') return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/>
    </svg>
  )
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  )
}

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

  const getActionLabel = (action: string) => {
    if (action === 'upload_document') return isAr ? 'ارفع مستنداً' : 'Upload Doc'
    if (action === 'generate_checklist') return 'Checklist'
    if (action === 'start_flow') return isAr ? 'ابدأ المسار' : 'Start Path'
    return isAr ? 'اسأل دليلك' : 'Ask Dalilak'
  }

  const currentSection = PACK_SECTIONS.find(s => s.id === activeSection)!

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={dir}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #D5CEC4; border-radius: 3px; }
        .svc-card:hover { border-color: #8B1A1A !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(139,26,26,0.10) !important; }
        .bottom-nav-padding { padding-bottom: 68px; }
        @keyframes expHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        padding: '14px 16px 18px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 16px rgba(80,10,10,0.3)',
        animation: 'expHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button
              type="button"
              aria-label="الخدمات"
              onClick={() => router.push('/services')}
              onTouchStart={e => (e.currentTarget.style.opacity = '0.65')}
              onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: 'rgba(255,255,255,0.9)', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {isAr ? 'حزمة المغتربين والعقارات والعقود' : 'Expat, Property & Contracts Pack'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {isAr ? 'مسار موثّق وشامل' : 'Verified comprehensive path'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              aria-label="تغيير اللغة"
              onTouchStart={e => (e.currentTarget.style.opacity = '0.65')}
              onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
              style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8, padding: '5px 10px', color: '#fff',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isAr ? 'EN' : 'AR'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {PACK_SECTIONS.map(s => (
              <button
                type="button"
                key={s.id}
                aria-pressed={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
                onTouchStart={e => (e.currentTarget.style.opacity = '0.7')}
                onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
                style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.28)',
                  background: activeSection === s.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: activeSection === s.id ? '#fff' : 'rgba(255,255,255,0.68)',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {s.icon} {isAr ? s.titleAr : s.titleEn}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div id="main-content" className="bottom-nav-padding" style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 20px' }}>

        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #EAE4D9', padding: '14px 16px', marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#1A1208', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            {isAr ? 'كيف يعمل المسار؟' : 'How does the path work?'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(isAr ? HOW_IT_WORKS_AR : HOW_IT_WORKS_EN).map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10.5, fontWeight: 800,
                }}>{s.step}</div>
                <span style={{ fontSize: 11, color: '#2D1B0E', lineHeight: 1.45, paddingTop: 2 }}>{s.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '7px 10px', background: '#FFFBEB', borderRadius: 9, border: '1px solid #FDE68A' }}>
            <p style={{ fontSize: 10, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              {isAr
                ? 'هذا المسار للإرشاد فقط وليس استشارة قانونية رسمية. تأكد من المتطلبات الحالية من الجهة المختصة.'
                : 'This path is for guidance only and is not official legal advice. Verify current requirements with the competent authority.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${currentSection.color}14`, border: `1.5px solid ${currentSection.color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: currentSection.color,
          }}>
            <span style={{ transform: 'scale(1.5)', display: 'flex' }}>{currentSection.icon}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', lineHeight: 1.2 }}>
              {isAr ? currentSection.titleAr : currentSection.titleEn}
            </div>
            <div style={{ fontSize: 10.5, color: '#5C4A3A', marginTop: 1 }}>
              {currentSection.items.length} {isAr ? 'خدمات متاحة' : 'available services'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {currentSection.items.map(item => (
            <button
              type="button"
              key={item.id}
              className="svc-card"
              onClick={() => handleService(item)}
              onTouchStart={e => (e.currentTarget.style.background = '#F5F0E8')}
              onTouchEnd={e => (e.currentTarget.style.background = '#fff')}
              style={{
                background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14,
                padding: '13px 14px', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 12,
                textAlign: isAr ? 'right' : 'left',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)', width: '100%',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: `${currentSection.color}10`,
                border: `1.5px solid ${currentSection.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentSection.color,
              }}>
                <ServiceIcon action={item.defaultAction} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', lineHeight: 1.3 }}>
                  {isAr ? item.titleAr : item.titleEn}
                </div>
                {(isAr ? item.descriptionAr : item.descriptionEn) && (
                  <div style={{ fontSize: 10.5, color: '#5C4A3A', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isAr ? item.descriptionAr : item.descriptionEn}
                  </div>
                )}
              </div>

              <div style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20,
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {getActionLabel(item.defaultAction)}
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => router.push('/services')}
            onTouchStart={e => (e.currentTarget.style.opacity = '0.5')}
            onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
            style={{
              background: 'none', border: 'none', color: '#9C8E80',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
            </svg>
            {isAr ? 'العودة إلى الخدمات' : 'Back to Services'}
          </button>
        </div>

      </div>

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="services" /></div>
    </div>
  )
}
