'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import { ALL_SERVICES, SERVICE_CATEGORIES, type ServiceItem } from '@/lib/allServices'
import { ENRICHED_PROCEDURES, searchEnrichedProcedures, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import BottomNav from '@/components/BottomNav'

// ── Types ──────────────────────────────────────────────────────────────────────

type ViewMode = 'all' | 'enriched' | 'detailed'

// ── Service Detail Modal ───────────────────────────────────────────────────────

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
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{service.icon}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A1208', lineHeight: 1.3 }}>{service.name_ar}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8B1A1A', fontWeight: 600 }}>{service.authority_ar}</p>
            </div>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#6B7280', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          {/* Quick stats */}
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
            <span style={{ fontSize: 11, color: '#6B7280', background: '#F9FAFB', borderRadius: 8, padding: '3px 9px', border: '1px solid #E5E7EB' }}>
              {service.category}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
          {service.description && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{service.description}</p>
            </div>
          )}

          {service.required_documents.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208', display: 'flex', alignItems: 'center', gap: 6 }}>
                الوثائق المطلوبة
                <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 400 }}>({service.required_documents.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {service.required_documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#8B1A1A', fontSize: 12, marginTop: 1 }}>◆</span>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {service.forms_needed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>النماذج المطلوبة</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.forms_needed.map((form, i) => (
                  <span key={i} style={{ fontSize: 12, color: '#854D0E', background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', border: '1px solid #FEF3C7' }}>{form}</span>
                ))}
              </div>
            </div>
          )}

          {service.important_notes && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FFF7ED', borderRadius: 12, border: '1px solid #FED7AA' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>{service.important_notes}</p>
            </div>
          )}

          {/* Contact info */}
          {(service.phone || service.website || service.working_hours) && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>معلومات التواصل</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.phone && (
                  <a href={`tel:${service.phone}`} style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    {service.phone}
                  </a>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    {service.website}
                  </a>
                )}
                {service.working_hours && (
                  <span style={{ fontSize: 12, color: '#374151' }}>{service.working_hours}</span>
                )}
              </div>
            </div>
          )}

          {service.related_services.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>🔗 خدمات ذات صلة</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {service.related_services.map((rel, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#6B7280', background: '#F9FAFB', borderRadius: 20, padding: '4px 10px', border: '1px solid #E5E7EB' }}>{rel}</span>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 20, lineHeight: 1.5, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
            ⚠️ المعلومات المعروضة مستخرجة من مصادر رسمية وهي للإرشاد العام. تأكد دائماً من المصادر الرسمية قبل تقديم أي طلب.
          </p>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 10 }}>
          <button onClick={() => onAsk(service.chatPrompt_ar)} style={{
            flex: 1, padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #7a1a1a, #9B2335)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            🤖 اسألني عن هذه الخدمة
          </button>
          <button onClick={onClose} style={{
            padding: '12px 16px', borderRadius: 14, background: '#F9FAFB', border: '1.5px solid #E5E7EB',
            color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [expandedProc, setExpandedProc] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const isAr = lang === 'ar'

  // All services filtered
  const filteredAll = useMemo(() => {
    let list = ALL_SERVICES
    if (activeCategory !== 'all') list = list.filter(s => s.categorySlug === activeCategory)
    if (search.trim()) {
      const q = search.trim()
      list = list.filter(s =>
        s.name_ar.includes(q) ||
        s.category.includes(q) ||
        s.authority_ar.includes(q) ||
        s.description.includes(q)
      )
    }
    return list
  }, [search, activeCategory])

  // Detailed procedures filtered
  const filteredDetailed = useMemo(() => {
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

  const handleAsk = useCallback((prompt: string) => {
    setSelectedService(null)
    router.push(`/?q=${encodeURIComponent(prompt)}`)
  }, [router])

  // ── Categories for filter ──────────────────────────────────────────────────

  const visibleCategories = useMemo(() => {
    const topCats = SERVICE_CATEGORIES.slice(0, 20)
    return topCats
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo', 'Inter', sans-serif", overflowX: 'hidden' }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 2px; }
        .svc-card:hover { border-color: #8B1A1A !important; box-shadow: 0 4px 16px rgba(139,26,26,0.12) !important; }
        .cat-chip:hover { background: #FEF2F2 !important; border-color: #8B1A1A !important; color: #8B1A1A !important; }
      `}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)', padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.3)' }}>
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
                {isAr ? 'الخدمات والمعاملات' : 'Services & Procedures'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>
                {isAr ? '201 خدمة · 45 فئة حكومية' : '201 services · 45 categories'}
              </p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Stats banner */}
        <div style={{ background: 'linear-gradient(135deg, #FEF2F2, #FFF7F7)', border: '1px solid rgba(139,26,26,0.1)', borderRadius: 16, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { value: '201', label: isAr ? 'خدمة موثّقة' : 'Services' },
              { value: '45',  label: isAr ? 'فئة حكومية' : 'Categories' },
              { value: '52+', label: isAr ? 'جهة مختصة' : 'Authorities' },
            ].map((stat, idx) => (
              <React.Fragment key={stat.value}>
                {idx > 0 && <div style={{ width: 1, height: 32, background: 'rgba(139,26,26,0.15)', flexShrink: 0 }} />}
                <div style={{ textAlign: 'center', minWidth: 40 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 9.5, color: '#6B7280', marginTop: 2, whiteSpace: 'nowrap' }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
            <div style={{ fontSize: 11, color: '#9C8E80', lineHeight: 1.5, flex: '1 1 120px', marginTop: 0 }}>
              {isAr ? 'بيانات رسمية محدّثة — وثائق، رسوم، إجراءات' : 'Official data — docs, fees, procedures'}
            </div>
          </div>
        </div>

        {/* View mode tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
          {[
            { mode: 'all' as ViewMode, labelAr: `خدمات (${ALL_SERVICES.length})`, labelEn: `Services (${ALL_SERVICES.length})`, icon: '📋' },
            { mode: 'enriched' as ViewMode, labelAr: `مفصّلة (${ENRICHED_PROCEDURES.length})`, labelEn: `Detailed (${ENRICHED_PROCEDURES.length})`, icon: '🔍' },
            { mode: 'detailed' as ViewMode, labelAr: `مُرشدة (${PROCEDURES_DATA.filter(p => p.status === 'active').length})`, labelEn: `Guided (${PROCEDURES_DATA.filter(p => p.status === 'active').length})`, icon: '🧭' },
          ].map(({ mode, labelAr, labelEn, icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              flex: 1, padding: '7px 6px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none', transition: 'all 0.15s', textAlign: 'center',
              background: viewMode === mode ? '#fff' : 'transparent',
              color: viewMode === mode ? '#8B1A1A' : '#6B7280',
              boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {icon} {isAr ? labelAr : labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '10px 14px', marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={viewMode === 'all' ? 'ابحث في 201 خدمة...' : viewMode === 'enriched' ? 'ابحث في 60 إجراء مفصّل...' : 'ابحث في الإجراءات المُرشدة...'}
            dir="rtl"
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', fontSize: 18, lineHeight: 1 }}>×</button>}
        </div>

        {/* Category filters (only in all mode) */}
        {viewMode === 'all' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            <button className="cat-chip" onClick={() => setActiveCategory('all')} style={{
              whiteSpace: 'nowrap', padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid', transition: 'all 0.15s',
              borderColor: activeCategory === 'all' ? '#8B1A1A' : '#EAE4D9',
              background: activeCategory === 'all' ? '#FEF2F2' : '#fff',
              color: activeCategory === 'all' ? '#8B1A1A' : '#6B7280',
            }}>
              🌐 الكل ({ALL_SERVICES.length})
            </button>
            {visibleCategories.map(cat => (
              <button key={cat.slug} className="cat-chip" onClick={() => setActiveCategory(cat.slug)} style={{
                whiteSpace: 'nowrap', padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid', transition: 'all 0.15s',
                borderColor: activeCategory === cat.slug ? '#8B1A1A' : '#EAE4D9',
                background: activeCategory === cat.slug ? '#FEF2F2' : '#fff',
                color: activeCategory === cat.slug ? '#8B1A1A' : '#6B7280',
              }}>
                {cat.icon} {cat.label_ar} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p style={{ fontSize: 11, color: '#9C8E80', marginBottom: 12 }}>
          {viewMode === 'all'
            ? `${filteredAll.length} خدمة${activeCategory !== 'all' ? ' في هذه الفئة' : ''}`
            : viewMode === 'enriched'
            ? `${searchEnrichedProcedures(search).length} إجراء مفصّل بخطوات ووثائق`
            : `${filteredDetailed.length} إجراء مُرشد`
          }
        </p>

        {/* ── ALL SERVICES VIEW ─────────────────────────────────────────────── */}
        {viewMode === 'all' && (
          filteredAll.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 12, color: '#C4B5A5' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>لم نجد نتائج</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>جرب كلمة بحث مختلفة أو اسأل الذكاء الاصطناعي مباشرة</p>
              <button onClick={() => handleAsk(search)} style={{
                marginTop: 16, padding: '10px 20px', borderRadius: 12, background: '#8B1A1A',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                اسأل دليلك عن: {search}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredAll.map((svc) => (
                <button key={svc.id} className="svc-card" onClick={() => setSelectedService(svc)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s', width: '100%',
                }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {svc.icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 2, lineHeight: 1.4 }}>
                      {svc.name_ar}
                    </div>
                    <div style={{ fontSize: 11, color: '#8B1A1A', fontWeight: 600, marginBottom: 4 }}>
                      {svc.authority_ar}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {svc.fees && (
                        <span style={{ fontSize: 10, color: '#854D0E', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>
                          {svc.fees.length > 25 ? svc.fees.slice(0, 25) + '...' : svc.fees}
                        </span>
                      )}
                      {svc.processing_time && (
                        <span style={{ fontSize: 10, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>
                          {svc.processing_time}
                        </span>
                      )}
                      {svc.required_documents.length > 0 && (
                        <span style={{ fontSize: 10, color: '#6B7280', background: '#F9FAFB', borderRadius: 6, padding: '1px 7px', border: '1px solid #E5E7EB' }}>
                          {svc.required_documents.length} وثيقة
                        </span>
                      )}
                      {svc.online_available && (
                        <span style={{ fontSize: 10, color: '#065F46', background: '#ECFDF5', borderRadius: 6, padding: '1px 7px', border: '1px solid #A7F3D0' }}>
                          أونلاين
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Arrow */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C4B5A5" strokeWidth="2" style={{ flexShrink: 0, marginTop: 4, transform: 'rotate(180deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          )
        )}

        {/* ── ENRICHED PROCEDURES VIEW (60 with steps + docs) ─────────────── */}
        {viewMode === 'enriched' && (() => {
          const procs = searchEnrichedProcedures(search)
          return procs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 12, color: '#C4B5A5' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>لم نجد نتائج</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {procs.map((proc: EnrichedProcedure) => (
                <div key={proc.code} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedProc(expandedProc === proc.code ? null : proc.code)}
                    style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {proc.icon}
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', lineHeight: 1.4 }}>{proc.title}</div>
                      <div style={{ fontSize: 10.5, color: '#8B1A1A', fontWeight: 600, marginTop: 2 }}>{proc.ministry}</div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {proc.requiredDocuments.length > 0 && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{proc.requiredDocuments.length} وثيقة</span>}
                        {proc.steps.length > 0 && <span style={{ fontSize: 9.5, background: '#F0FDF4', color: '#065F46', borderRadius: 6, padding: '1px 7px', border: '1px solid #A7F3D0' }}>{proc.steps.length} خطوة</span>}
                        {proc.hasForm && <span style={{ fontSize: 9.5, background: '#FFFBEB', color: '#854D0E', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>نموذج</span>}
                        {proc.fees && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid #FECACA' }}>رسوم</span>}
                      </div>
                    </div>
                    <span style={{ color: '#9C8E80', fontSize: 16, transform: expandedProc === proc.code ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
                  </button>
                  {expandedProc === proc.code && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
                      {proc.requiredDocuments.length > 0 && (
                        <div style={{ marginTop: 12, marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>الوثائق المطلوبة:</div>
                          {proc.requiredDocuments.map((d, i) => (
                            <div key={i} style={{ fontSize: 11.5, color: '#374151', padding: '4px 0', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 6 }}>
                              <span style={{ color: '#8B1A1A', fontWeight: 700 }}>•</span><span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {proc.steps.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>خطوات الإجراء:</div>
                          {proc.steps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                              <span style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {proc.fees && (
                        <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#854D0E' }}>الرسوم:</span>
                          <span style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'pre-line' }}>{proc.fees.slice(0, 200)}</span>
                        </div>
                      )}
                      {proc.pdfUrls.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {proc.pdfUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: '#8B1A1A', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                              تحميل النموذج {proc.pdfUrls.length > 1 ? i + 1 : ''}
                            </a>
                          ))}
                        </div>
                      )}
                      <button onClick={() => router.push(`/?q=${encodeURIComponent(`ما هي خطوات ومتطلبات إجراء: ${proc.title}؟`)}`)} style={{ width: '100%', padding: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        اسأل دليلك عن هذا الإجراء
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })()}

        {/* ── DETAILED PROCEDURES VIEW ──────────────────────────────────────── */}
        {viewMode === 'detailed' && (
          filteredDetailed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 12, color: '#C4B5A5' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>لم نجد نتائج</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>جرب كلمة بحث مختلفة</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredDetailed.map((proc) => (
                <button key={proc.slug} onClick={() => router.push(`/procedures/${proc.slug}`)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 16,
                  background: '#fff', border: '1.5px solid #EAE4D9', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s', width: '100%',
                }}
                className="svc-card">
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {proc.icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1208' }}>
                        {isAr ? proc.title_ar : proc.title_en}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '1px 7px', flexShrink: 0 }}>
                        {getComplexityLabel(proc.complexity, isAr)}
                      </span>
                      <span style={{ fontSize: 10, color: '#065F46', background: '#ECFDF5', borderRadius: 8, padding: '1px 7px', border: '1px solid #A7F3D0', fontWeight: 600 }}>
                        مفصّل
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9C8E80', margin: '0 0 6px', lineHeight: 1.5 }}>
                      {isAr ? proc.description_ar : proc.description_en}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '1px 7px' }}>
                        {isAr ? proc.category_ar : proc.category_en}
                      </span>
                      {proc.estimatedDuration_ar && (
                        <span style={{ fontSize: 10, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '1px 7px' }}>
                          {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                        </span>
                      )}
                      {proc.forms.length > 0 && (
                        <span style={{ fontSize: 10, color: '#854D0E', background: '#FEFCE8', borderRadius: 8, padding: '1px 7px', border: '1px solid #FEF08A' }}>
                          نموذج متوفر
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2, transform: 'rotate(180deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          )
        )}

        {/* Ask AI CTA (always visible at bottom) */}
        <div style={{ marginTop: 24, padding: '16px', background: 'linear-gradient(135deg, #FEF2F2, #FFF7F7)', borderRadius: 16, border: '1px solid rgba(139,26,26,0.12)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>لم تجد ما تبحث عنه؟</p>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#6B7280' }}>اسأل دليلك الذكي مباشرة — يغطي 81,000+ وثيقة وقانون</p>
          <button onClick={() => router.push('/')} style={{
            padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #7a1a1a, #9B2335)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            🤖 اسأل دليلك الذكي
          </button>
        </div>
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" onHomeClick={() => router.push('/')} />
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAsk={handleAsk}
        />
      )}
    </div>
  )
}
