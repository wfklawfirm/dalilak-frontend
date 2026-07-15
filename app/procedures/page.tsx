'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import { ALL_SERVICES, SERVICE_CATEGORIES, type ServiceItem } from '@/lib/allServices'
import { ENRICHED_PROCEDURES, searchEnrichedProcedures, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import BottomNav from '@/components/BottomNav'

type ViewMode = 'procedures' | 'directory'

function ServiceModal({ service, onClose, onAsk }: {
  service: ServiceItem
  onClose: () => void
  onAsk: (prompt: string) => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 720,
        margin: '0 auto', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #EAE4D9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)', border: '1px solid rgba(139,26,26,0.1)', color: '#8B1A1A', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A1208', lineHeight: 1.3 }}>{service.name_ar}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8B1A1A', fontWeight: 600 }}>{service.authority_ar}</p>
            </div>
            <button onClick={onClose} style={{ background: '#EAE4D9', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: '#5C4A3A', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {service.fees && (
              <span style={{ fontSize: 11, color: '#854D0E', background: '#FEFCE8', borderRadius: 8, padding: '3px 9px', border: '1px solid #FEF08A', fontWeight: 600 }}>
                {service.fees}
              </span>
            )}
            {service.processing_time && (
              <span style={{ fontSize: 11, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 8, padding: '3px 9px', border: '1px solid rgba(139,26,26,0.2)', fontWeight: 600 }}>
                {service.processing_time}
              </span>
            )}
            {service.online_available && (
              <span style={{ fontSize: 11, color: '#065F46', background: '#ECFDF5', borderRadius: 8, padding: '3px 9px', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                متوفر أونلاين
              </span>
            )}
            <span style={{ fontSize: 11, color: '#5C4A3A', background: '#FAFAF8', borderRadius: 8, padding: '3px 9px', border: '1px solid #EAE4D9' }}>
              {service.category}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
          {service.description && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#2D1B0E', lineHeight: 1.7 }}>{service.description}</p>
            </div>
          )}
          {service.required_documents.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>الوثائق المطلوبة</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {service.required_documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #EAE4D9' }}>
                    <span style={{ color: '#8B1A1A', marginTop: 2, flexShrink: 0 }}>
                      <svg width="6" height="6" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="#8B1A1A" transform="rotate(45 5 5)"/></svg>
                    </span>
                    <span style={{ fontSize: 12, color: '#2D1B0E', lineHeight: 1.5 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {service.forms_needed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>النماذج المطلوبة</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.forms_needed.map((form, i) => {
                  // Parse "Label — https://..." format
                  const urlMatch = form.match(/(https?:\/\/[^\s]+)/)
                  const url = urlMatch ? urlMatch[1] : null
                  const label = url ? form.replace(/\s*—?\s*https?:\/\/[^\s]+/, '').trim() : form
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 8, padding: '7px 10px', border: '1px solid rgba(139,26,26,0.15)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      {label || 'تحميل النموذج'}
                    </a>
                  ) : (
                    <span key={i} style={{ fontSize: 12, color: '#854D0E', background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', border: '1px solid #FEF3C7' }}>{form}</span>
                  )
                })}
              </div>
            </div>
          )}
          {service.important_notes && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FFF7ED', borderRadius: 12, border: '1px solid #FED7AA' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>{service.important_notes}</p>
            </div>
          )}
          {(service.phone || service.website || service.working_hours) && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>معلومات التواصل</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {service.phone && (
                  <a href={`tel:${service.phone}`} style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {service.phone}
                  </a>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    {service.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {service.working_hours && (
                  <span style={{ fontSize: 12, color: '#5C4A3A', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C4A3A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                    </svg>
                    {service.working_hours}
                  </span>
                )}
              </div>
            </div>
          )}
          <p style={{ fontSize: 10, color: '#9C8E80', marginTop: 20, lineHeight: 1.5, padding: '10px 14px', background: '#FAFAF8', borderRadius: 8 }}>
            المعلومات المعروضة مستخرجة من مصادر رسمية وهي للإرشاد العام. تأكد دائماً من المصادر الرسمية قبل تقديم أي طلب.
          </p>
        </div>
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #EAE4D9', display: 'flex', gap: 10 }}>
          <button onClick={() => onAsk(service.chatPrompt_ar)} style={{
            flex: 1, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            اسألني عن هذه الخدمة
          </button>
          <button onClick={onClose} style={{
            padding: '12px 16px', borderRadius: 14, background: '#FAFAF8', border: '1.5px solid #EAE4D9',
            color: '#5C4A3A', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

const GUIDED_ACTIVE_COUNT = PROCEDURES_DATA.filter(p => p.status === 'active').length
const PROCEDURES_TOTAL = GUIDED_ACTIVE_COUNT + ENRICHED_PROCEDURES.length

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('procedures')
  const [expandedProc, setExpandedProc] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const isAr = lang === 'ar'

  const filteredAll = useMemo(() => {
    let list = ALL_SERVICES
    if (activeCategory !== 'all') list = list.filter(s => s.categorySlug === activeCategory)
    if (search.trim()) {
      const q = search.trim()
      list = list.filter(s =>
        s.name_ar.includes(q) || s.category.includes(q) ||
        s.authority_ar.includes(q) || s.description.includes(q)
      )
    }
    return list
  }, [search, activeCategory])

  const filteredGuided = useMemo(() => {
    let list = PROCEDURES_DATA.filter(p => p.status === 'active')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title_ar.includes(search) || p.title_en.toLowerCase().includes(q) ||
        p.description_ar.includes(search) || p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [search])

  const filteredEnriched = useMemo(() => searchEnrichedProcedures(search), [search])

  const handleAsk = useCallback((prompt: string) => {
    setSelectedService(null)
    router.push(`/?q=${encodeURIComponent(prompt)}`)
  }, [router])

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>()
    return SERVICE_CATEGORIES.filter(c => {
      if (seen.has(c.slug)) return false
      seen.add(c.slug)
      return true
    })
  }, [])

  const totalProcedureResults = filteredGuided.length + filteredEnriched.length

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo', 'Inter', sans-serif", overflowX: 'hidden' }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 2px; }
        .svc-card:hover { border-color: #8B1A1A !important; box-shadow: 0 4px 16px rgba(139,26,26,0.12) !important; }
        .cat-chip:hover { background: #FEF2F2 !important; border-color: #8B1A1A !important; color: #8B1A1A !important; }
        .proc-card:hover { border-color: rgba(139,26,26,0.4) !important; box-shadow: 0 2px 12px rgba(139,26,26,0.08) !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {isAr ? 'المعاملات الحكومية' : 'Government Procedures'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>
                {isAr ? `${PROCEDURES_TOTAL} إجراء موثّق · ${ALL_SERVICES.length} خدمة` : `${PROCEDURES_TOTAL} documented`}
              </p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        <div style={{ background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)', borderRadius: 16, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { value: String(PROCEDURES_TOTAL), label: isAr ? 'إجراء موثّق' : 'Procedures' },
              { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة حكومية' : 'Services' },
              { value: '52+', label: isAr ? 'جهة مختصة' : 'Authorities' },
            ].map((stat, idx) => (
              <React.Fragment key={stat.value}>
                {idx > 0 && <div style={{ width: 1, height: 32, background: 'rgba(139,26,26,0.15)', flexShrink: 0 }} />}
                <div style={{ textAlign: 'center', minWidth: 40 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 9.5, color: '#5C4A3A', marginTop: 2, whiteSpace: 'nowrap' }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
            <div style={{ fontSize: 11, color: '#9C8E80', lineHeight: 1.5, flex: '1 1 120px' }}>
              {isAr ? 'بيانات رسمية — وثائق، رسوم، خطوات الإجراء' : 'Official data — docs, fees, steps'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#EAE4D9', borderRadius: 12, padding: 4 }}>
          {([
            { mode: 'procedures' as ViewMode, labelAr: `الإجراءات (${PROCEDURES_TOTAL})`, labelEn: `Procedures (${PROCEDURES_TOTAL})` },
            { mode: 'directory' as ViewMode, labelAr: `دليل الخدمات (${ALL_SERVICES.length})`, labelEn: `Services Directory (${ALL_SERVICES.length})` },
          ] as const).map(({ mode, labelAr, labelEn }) => (
            <button key={mode} onClick={() => { setViewMode(mode); setSearch(''); setExpandedProc(null) }} style={{
              flex: 1, padding: '9px 8px', borderRadius: 9, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none', transition: 'all 0.15s', textAlign: 'center',
              background: viewMode === mode ? '#fff' : 'transparent',
              color: viewMode === mode ? '#8B1A1A' : '#5C4A3A',
              boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
              {isAr ? labelAr : labelEn}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '10px 14px', marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={viewMode === 'procedures' ? `ابحث في ${PROCEDURES_TOTAL} إجراء...` : `ابحث في ${ALL_SERVICES.length} خدمة...`}
            dir="rtl"
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', display: 'flex', alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {viewMode === 'directory' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            <button className="cat-chip" onClick={() => setActiveCategory('all')} style={{
              whiteSpace: 'nowrap', padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid', transition: 'all 0.15s',
              borderColor: activeCategory === 'all' ? '#8B1A1A' : '#EAE4D9',
              background: activeCategory === 'all' ? '#FEF2F2' : '#fff',
              color: activeCategory === 'all' ? '#8B1A1A' : '#5C4A3A',
            }}>الكل ({ALL_SERVICES.length})</button>
            {visibleCategories.map(cat => (
              <button key={cat.slug} className="cat-chip" onClick={() => setActiveCategory(cat.slug)} style={{
                whiteSpace: 'nowrap', padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid', transition: 'all 0.15s',
                borderColor: activeCategory === cat.slug ? '#8B1A1A' : '#EAE4D9',
                background: activeCategory === cat.slug ? '#FEF2F2' : '#fff',
                color: activeCategory === cat.slug ? '#8B1A1A' : '#5C4A3A',
              }}>{cat.label_ar} ({cat.count})</button>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: '#9C8E80', marginBottom: 12 }}>
          {viewMode === 'procedures'
            ? `${totalProcedureResults} إجراء${search ? ` لـ "${search}"` : ''}`
            : `${filteredAll.length} خدمة`
          }
        </p>

        {viewMode === 'procedures' && (
          totalProcedureResults === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>لم نجد إجراءات مطابقة</p>
              <button onClick={() => handleAsk(search)} style={{
                marginTop: 16, padding: '10px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>اسأل دليلك عن: {search}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredGuided.map(proc => {
                const isExpanded = expandedProc === proc.slug
                return (
                  <div key={proc.slug} className="proc-card" style={{
                    background: '#fff',
                    border: `1.5px solid ${isExpanded ? '#8B1A1A' : '#EAE4D9'}`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: isExpanded ? '0 4px 16px rgba(139,26,26,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.18s',
                  }}>
                    <button
                      onClick={() => setExpandedProc(isExpanded ? null : proc.slug)}
                      style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isExpanded ? 'rgba(139,26,26,0.1)' : '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                      </div>
                      <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8B1A1A', background: 'rgba(139,26,26,0.08)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.15)' }}>مُرشدة</span>
                          <span style={{ fontSize: 9.5, borderRadius: 6, padding: '1px 7px', fontWeight: 600, background: getComplexityBg(proc.complexity), color: getComplexityColor(proc.complexity) }}>
                            {getComplexityLabel(proc.complexity, isAr)}
                          </span>
                          {proc.estimatedDuration_ar && (
                            <span style={{ fontSize: 9.5, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 6, padding: '1px 7px' }}>
                              {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isExpanded ? '#8B1A1A' : '#1A1208', lineHeight: 1.4 }}>
                          {isAr ? proc.title_ar : proc.title_en}
                        </div>
                      </div>
                      <span style={{ color: isExpanded ? '#8B1A1A' : '#9C8E80', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '0 14px 16px', borderTop: '1px solid #EAE4D9', animation: 'slideDown 0.2s ease' }}>
                        <p style={{ margin: '12px 0 14px', fontSize: 13, color: '#2D1B0E', lineHeight: 1.75 }}>
                          {isAr ? proc.description_ar : proc.description_en}
                        </p>
                        {proc.requiredDocuments.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 7 }}>الوثائق المطلوبة:</div>
                            {proc.requiredDocuments.map((doc, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '5px 0', borderBottom: '1px solid #EAE4D9' }}>
                                <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 4 }}>
                                  <svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.7"/></svg>
                                </span>
                                <span style={{ fontSize: 12, color: '#2D1B0E', lineHeight: 1.5 }}>{isAr ? doc.name_ar : doc.name_en}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {proc.steps.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 7 }}>خطوات الإجراء:</div>
                            {proc.steps.map((s, i) => {
                              const isLastStep = i === proc.steps.length - 1
                              return (
                                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'stretch', paddingBottom: isLastStep ? 0 : 8 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                                    {!isLastStep && <div style={{ width: 1.5, flex: 1, background: 'rgba(139,26,26,0.2)', marginTop: 4, borderRadius: 1 }} />}
                                  </div>
                                  <div style={{ paddingTop: 2 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208' }}>{isAr ? s.title_ar : s.title_en}</div>
                                    {s.description_ar && (
                                      <div style={{ fontSize: 11.5, color: '#5C4A3A', marginTop: 2, lineHeight: 1.5 }}>
                                        {isAr ? s.description_ar : ((s as unknown as { description_en?: string }).description_en || s.description_ar)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <button onClick={() => handleAsk(isAr ? proc.chatPrompt_ar : proc.chatPrompt_en)} style={{
                          padding: '8px 18px', borderRadius: 10,
                          background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                          border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          boxShadow: '0 2px 6px rgba(139,26,26,0.25)',
                        }}>اسأل دليلك عن هذا الإجراء</button>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredEnriched.map((proc: EnrichedProcedure) => (
                <div key={proc.code} className="proc-card" style={{
                  background: '#fff', border: `1.5px solid ${expandedProc === proc.code ? '#8B1A1A' : '#EAE4D9'}`,
                  borderRadius: 14, overflow: 'hidden', transition: 'all 0.18s',
                }}>
                  <button
                    onClick={() => setExpandedProc(expandedProc === proc.code ? null : proc.code)}
                    style={{ width: '100%', padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EAE4D9', border: '1px solid #EAE4D9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5C4A3A', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 6, padding: '1px 7px' }}>موثّقة</span>
                        {proc.requiredDocuments.length > 0 && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{proc.requiredDocuments.length} وثيقة</span>}
                        {proc.steps.length > 0 && <span style={{ fontSize: 9.5, background: '#F0FDF4', color: '#065F46', borderRadius: 6, padding: '1px 7px', border: '1px solid #A7F3D0' }}>{proc.steps.length} خطوة</span>}
                        {proc.hasForm && <span style={{ fontSize: 9.5, background: '#FFFBEB', color: '#854D0E', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>نموذج</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: expandedProc === proc.code ? '#8B1A1A' : '#1A1208', lineHeight: 1.4 }}>{proc.title}</div>
                      <div style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600, marginTop: 3 }}>{proc.ministry}</div>
                    </div>
                    <span style={{ color: expandedProc === proc.code ? '#8B1A1A' : '#9C8E80', transform: expandedProc === proc.code ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, display: 'inline-flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </button>
                  {expandedProc === proc.code && (
                    <div style={{ padding: '0 14px 16px', borderTop: '1px solid #EAE4D9', animation: 'slideDown 0.2s ease' }}>
                      {proc.requiredDocuments.length > 0 && (
                        <div style={{ marginTop: 12, marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>الوثائق المطلوبة:</div>
                          {proc.requiredDocuments.map((d, i) => (
                            <div key={i} style={{ fontSize: 11.5, color: '#2D1B0E', padding: '4px 0', borderBottom: '1px solid #EAE4D9', display: 'flex', gap: 6 }}>
                              <span style={{ color: '#8B1A1A', flexShrink: 0, marginTop: 4 }}><svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8B1A1A" opacity="0.7"/></svg></span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {proc.steps.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>خطوات الإجراء:</div>
                          {proc.steps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 9, paddingBottom: i < proc.steps.length - 1 ? 7 : 0 }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                              <span style={{ fontSize: 11.5, color: '#2D1B0E', lineHeight: 1.5, paddingTop: 2 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {proc.fees && (
                        <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#854D0E' }}>الرسوم: </span>
                          <span style={{ fontSize: 11, color: '#5C4A3A' }}>{proc.fees.slice(0, 200)}</span>
                        </div>
                      )}
                      <button onClick={() => handleAsk(proc.title)} style={{
                        marginTop: 4, padding: '8px 18px', borderRadius: 10,
                        background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                        border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>اسأل دليلك عن هذا الإجراء</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {viewMode === 'directory' && (
          filteredAll.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>لم نجد نتائج</p>
              <button onClick={() => handleAsk(search)} style={{
                marginTop: 16, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>اسأل دليلك عن: {search}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredAll.map(svc => (
                <button key={svc.id} className="svc-card" onClick={() => setSelectedService(svc)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s', width: '100%',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 2, lineHeight: 1.4 }}>{svc.name_ar}</div>
                    <div style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 600, marginBottom: 4 }}>{svc.authority_ar}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {svc.fees && <span style={{ fontSize: 10, color: '#854D0E', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>{svc.fees.length > 25 ? svc.fees.slice(0, 25) + '...' : svc.fees}</span>}
                      {svc.processing_time && <span style={{ fontSize: 10, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{svc.processing_time}</span>}
                      {svc.required_documents.length > 0 && <span style={{ fontSize: 10, color: '#5C4A3A', background: '#FAFAF8', borderRadius: 6, padding: '1px 7px', border: '1px solid #EAE4D9' }}>{svc.required_documents.length} وثيقة</span>}
                      {svc.online_available && <span style={{ fontSize: 10, color: '#065F46', background: '#ECFDF5', borderRadius: 6, padding: '1px 7px', border: '1px solid #A7F3D0' }}>أونلاين</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}

      </div>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAsk={handleAsk}
        />
      )}

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={lang === 'ar'} activeTab="procedures" />
      </div>
    </div>
  )
}
