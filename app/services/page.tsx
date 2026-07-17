'use client'
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'
import { useLanguage } from '@/lib/LanguageContext'
import type { ServiceItem } from '@/lib/allServices'

// ─── Service Detail Sheet ────────────────────────────────────────────────────

function ServiceSheet({ service, onClose, onAsk }: {
  service: ServiceItem
  onClose: () => void
  onAsk: (q: string) => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { closeRef.current?.focus() }, [])
  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={service.name_ar}
        onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 720,
        margin: '0 auto', maxHeight: '82vh', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '4px 20px 14px', borderBottom: '1px solid #EAE4D9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FEF2F2, #FDE8E8)',
              border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>
              {service.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A1208', lineHeight: 1.35 }}>
                {service.name_ar}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8B1A1A', fontWeight: 600, lineHeight: 1.3 }}>
                {service.authority_ar}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="إغلاق"
              onClick={onClose}
              style={{
                background: '#EAE4D9', border: 'none', borderRadius: 10, width: 32, height: 32,
                cursor: 'pointer', color: '#5C4A3A', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(139,26,26,0.15)', fontWeight: 600 }}>
              {service.category}
            </span>
            {service.fees && (
              <span style={{ fontSize: 10.5, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '3px 10px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                {service.fees}
              </span>
            )}
            {service.processing_time && (
              <span style={{ fontSize: 10.5, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '3px 10px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                {service.processing_time}
              </span>
            )}
            {service.online_available && (
              <span style={{ fontSize: 10.5, color: '#065F46', background: 'rgba(6,95,70,0.07)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(6,95,70,0.2)', fontWeight: 600 }}>
                متاح أونلاين
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {service.description && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#2D1B0E', lineHeight: 1.75 }}>
              {service.description}
            </p>
          )}

          {/* Required documents */}
          {service.required_documents && service.required_documents.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A1208', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: '#FEF2F2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </span>
                المستندات المطلوبة
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.required_documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FAFAF8', borderRadius: 9, border: '1px solid #EAE4D9' }}>
                    <svg aria-hidden="true" width="8" height="8" viewBox="0 0 10 10" style={{ flexShrink: 0 }}><circle cx="5" cy="5" r="4.5" fill="#8B1A1A"/></svg>
                    <span style={{ fontSize: 12, color: '#1A1208', lineHeight: 1.4 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important notes */}
          {service.important_notes && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
              padding: '10px 13px', marginBottom: 16,
            }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p style={{ margin: 0, fontSize: 11.5, color: '#78350F', lineHeight: 1.6 }}>
                {service.important_notes}
              </p>
            </div>
          )}

          {/* Forms needed */}
          {service.forms_needed && service.forms_needed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A1208', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: '#FFFBEB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </span>
                النماذج المطلوبة
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.forms_needed.map((form, i) => {
                  const urlMatch = form.match(/(https?:\/\/[^\s]+)/)
                  const url = urlMatch ? urlMatch[1] : null
                  const label = url ? form.replace(/\s*—?\s*https?:\/\/[^\s]+/, '').trim() : form
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 8, padding: '7px 10px', border: '1px solid rgba(139,26,26,0.15)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      {label || 'تحميل النموذج'}
                    </a>
                  ) : (
                    <span key={i} style={{ fontSize: 12, color: '#854D0E', background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', border: '1px solid #FDE68A' }}>{form}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact info */}
          {(service.phone || service.website || service.working_hours) && (
            <div style={{ background: '#F8F4F0', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, color: '#5C4A3A', margin: '0 0 8px' }}>معلومات التواصل</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#2D1B0E' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {service.phone}
                  </div>
                )}
                {service.working_hours && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#2D1B0E' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                    </svg>
                    {service.working_hours}
                  </div>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8B1A1A', fontWeight: 600, textDecoration: 'none' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    الموقع الرسمي
                  </a>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: '#9C8E80', margin: 0, lineHeight: 1.5, padding: '10px 14px', background: '#FAFAF8', borderRadius: 8 }}>
            المعلومات للإرشاد العام — تأكد دائماً من المصادر الرسمية قبل تقديم أي طلب.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 28px', borderTop: '1px solid #EAE4D9', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onAsk(service.chatPrompt_ar || service.name_ar)}
            onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
            onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            style={{
              flex: 1, padding: '13px 16px', borderRadius: 14,
              background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 3px 12px rgba(139,26,26,0.3)', transition: 'opacity 0.12s, transform 0.12s',
            }}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            اسأل دليلك
          </button>
          <button
            type="button"
            onClick={onClose}
            onTouchStart={e => { e.currentTarget.style.background = '#EAE4D9' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#FAFAF8' }}
            style={{
              padding: '13px 16px', borderRadius: 14, background: '#FAFAF8',
              border: '1.5px solid #EAE4D9', color: '#5C4A3A', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  const handleAsk = useCallback((q: string) => {
    setSelectedService(null)
    router.push(`/?q=${encodeURIComponent(q)}`)
  }, [router])

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_SERVICES.forEach(s => {
      if (s.categorySlug) counts[s.categorySlug] = (counts[s.categorySlug] || 0) + 1
    })
    return counts
  }, [])

  // Sort categories by count descending
  const sortedCategories = useMemo(() =>
    [...SERVICE_CATEGORIES].sort((a, b) => (categoryCounts[b.slug] || 0) - (categoryCounts[a.slug] || 0)),
  [categoryCounts])

  // Filter services locally — instant, no API call
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ALL_SERVICES.filter(s => {
      const matchesCat = !selectedCat || s.categorySlug === selectedCat
      const matchesQ = !q ||
        s.name_ar.toLowerCase().includes(q) ||
        s.authority_ar.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [search, selectedCat])

  const activeCatLabel = selectedCat
    ? SERVICE_CATEGORIES.find(c => c.slug === selectedCat)?.label_ar
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 4px; }
        .svc-card { transition: border-color 0.14s, box-shadow 0.14s, transform 0.14s; }
        .svc-card:hover { border-color: rgba(139,26,26,0.4) !important; box-shadow: 0 4px 18px rgba(139,26,26,0.13) !important; transform: translateY(-2px); }
        .cat-chip { transition: border-color 0.14s, color 0.14s, background 0.14s; }
        .cat-chip:hover { border-color: #8B1A1A !important; color: #8B1A1A !important; background: #FEF7F7 !important; }
        @keyframes svc-header-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes svc-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes svcEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes svcStatsIn { from { opacity: 0; transform: translateY(-5px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .cat-chips-row::-webkit-scrollbar { display: none; }
        .cat-chips-row { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 599px) {
          .svc-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .svc-card { padding: 10px !important; }
          .svc-card h3 { font-size: 11.5px !important; line-height: 1.35 !important; }
          .svc-icon { font-size: 15px !important; }
          .svc-cat { font-size: 9px !important; padding: 1px 5px !important; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .svc-meta { display: none !important; }
        }
        @media (min-width: 600px) and (max-width: 899px) { .svc-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        animation: 'svc-header-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label="الرجوع"
            onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexShrink: 0,
            }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo.PNG" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{isAr ? 'الخدمات الحكومية' : 'Government Services'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                {isAr ? `${ALL_SERVICES.length} خدمة · ${SERVICE_CATEGORIES.length} فئة` : `${ALL_SERVICES.length} services · ${SERVICE_CATEGORIES.length} categories`}
              </div>
            </div>
          </div>
          {/* Search count badge */}
          {(search || selectedCat) && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.15)', borderRadius: 20,
              padding: '3px 10px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span aria-live="polite" aria-atomic="true">{filtered.length} {isAr ? 'نتيجة' : 'results'}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div id="main-content" style={{ background: '#FAFAF8', padding: '12px 14px 0', maxWidth: 1024, margin: '0 auto' }}>
        <div style={{ position: 'relative', background: '#fff', border: `1.5px solid ${searchFocused ? '#8B1A1A' : '#EAE4D9'}`, borderRadius: 14, boxShadow: searchFocused ? '0 0 0 3px rgba(139,26,26,0.08), 0 2px 12px rgba(139,26,26,0.06)' : '0 1px 6px rgba(0,0,0,0.05)', transition: 'border-color 0.18s, box-shadow 0.18s' }}>
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#8B1A1A' : '#B0A090', display: 'flex', alignItems: 'center', pointerEvents: 'none', transition: 'color 0.18s',
          }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            aria-label={isAr ? 'ابحث في الخدمات' : 'Search services'}
            placeholder={isAr ? 'ابحث: جواز سفر، تسجيل شركة، ترخيص بناء...' : 'Search: passport, company registration, building permit...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '12px 44px 12px 42px', borderRadius: 14,
              fontSize: 13.5, border: 'none', outline: 'none',
              fontFamily: "'Cairo','Inter',sans-serif",
              direction: 'rtl', color: '#1A1208', background: 'transparent',
            }}
          />
          {search && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#EAE4D9', border: 'none', borderRadius: '50%',
                width: 22, height: 22, cursor: 'pointer', color: '#5C4A3A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '18px 14px 100px' }}>

        {/* ── Stats strip — premium individual cards ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة حكومية' : 'Services', featured: true },
            { value: String(SERVICE_CATEGORIES.length), label: isAr ? 'فئة خدمية' : 'Categories', featured: false },
            { value: ALL_SERVICES.filter(s => s.online_available).length + '+', label: isAr ? 'خدمة أونلاين' : 'Online services', featured: false },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: '14px 8px 16px', textAlign: 'center',
              background: stat.featured ? 'linear-gradient(135deg, #FEF2F2 0%, #FDE4E4 100%)' : '#fff',
              border: stat.featured ? '1.5px solid rgba(139,26,26,0.18)' : '1.5px solid #EAE4D9',
              borderRadius: 12,
              boxShadow: stat.featured ? '0 2px 10px rgba(139,26,26,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'svcStatsIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
              animationDelay: `${0.06 + i * 0.07}s`,
            }}>
              <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 9.5, color: '#9C8E80', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Category chips — horizontal scroll, no wrap ──────────────────── */}
        <div style={{ marginBottom: 16, marginRight: -14, marginLeft: -14 }}>
          <div
            className="cat-chips-row"
            style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 7, paddingRight: 14, paddingLeft: 14, paddingBottom: 2 }}
          >
            {/* All / reset chip */}
            <button
              type="button"
              aria-pressed={!selectedCat}
              onClick={() => setSelectedCat(null)}
              className="cat-chip"
              onTouchStart={e => {
                e.currentTarget.style.background = !selectedCat ? '#FDE8E8' : '#FEF9F9'
                e.currentTarget.style.borderColor = '#8B1A1A'
              }}
              onTouchEnd={e => {
                e.currentTarget.style.background = !selectedCat ? '#FEF2F2' : '#fff'
                e.currentTarget.style.borderColor = !selectedCat ? '#8B1A1A' : '#EAE4D9'
              }}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                border: !selectedCat ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                background: !selectedCat ? '#FEF2F2' : '#fff',
                color: !selectedCat ? '#8B1A1A' : '#5C4A3A',
                boxShadow: !selectedCat ? '0 2px 8px rgba(139,26,26,0.15)' : 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {isAr ? `الكل (${ALL_SERVICES.length})` : `All (${ALL_SERVICES.length})`}
            </button>

            {sortedCategories.map(cat => {
              const active = selectedCat === cat.slug
              const cnt = categoryCounts[cat.slug] || 0
              return (
                <button
                  type="button"
                  key={cat.slug}
                  aria-pressed={active}
                  onClick={() => setSelectedCat(active ? null : cat.slug)}
                  className="cat-chip"
                  onTouchStart={e => {
                    e.currentTarget.style.background = active ? '#FDE8E8' : '#FEF9F9'
                    e.currentTarget.style.borderColor = '#8B1A1A'
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.background = active ? '#FEF2F2' : '#fff'
                    e.currentTarget.style.borderColor = active ? '#8B1A1A' : '#EAE4D9'
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 600,
                    border: active ? '2px solid #8B1A1A' : '1.5px solid #EAE4D9',
                    background: active ? '#FEF2F2' : '#fff',
                    color: active ? '#8B1A1A' : '#5C4A3A',
                    boxShadow: active ? '0 2px 8px rgba(139,26,26,0.15)' : 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{cat.icon}</span>
                  {cat.label_ar}
                  {cnt > 0 && <span style={{ opacity: 0.55, fontSize: 10, fontWeight: 600 }}>{cnt}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results meta bar ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#9C8E80', fontWeight: 500 }}>
            {filtered.length === ALL_SERVICES.length
              ? (isAr ? `${ALL_SERVICES.length} خدمة حكومية` : `${ALL_SERVICES.length} services`)
              : (isAr ? `${filtered.length} خدمة` : `${filtered.length} services`)}
          </span>
          {activeCatLabel && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 12 }}>·</span>
              <button
                type="button"
                aria-label={`إزالة فلتر الفئة: ${activeCatLabel}`}
                onClick={() => setSelectedCat(null)}
                style={{
                  fontSize: 11, color: '#8B1A1A', fontWeight: 700,
                  background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)',
                  borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {activeCatLabel}
                <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </>
          )}
          {search && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 12 }}>·</span>
              <span style={{ fontSize: 11, color: '#9C8E80' }}>{isAr ? `نتائج لـ "${search}"` : `Results for "${search}"`}</span>
            </>
          )}
        </div>

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ color: '#5C4A3A', fontSize: 14, fontWeight: 600, margin: '0 0 5px' }}>
              {isAr ? 'لا توجد نتائج مطابقة' : 'No matching results'}
            </p>
            <p style={{ color: '#9C8E80', fontSize: 12.5, margin: '0 0 18px' }}>
              {isAr ? 'جرّب مصطلحاً مختلفاً أو اسأل دليلك مباشرةً' : 'Try a different term or ask Dalilak directly'}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => router.push(`/?q=${encodeURIComponent(search)}`)}
                onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                style={{
                  padding: '10px 20px', background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
                  transition: 'opacity 0.12s, transform 0.12s',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCat(null) }}
                onTouchStart={e => { e.currentTarget.style.background = '#EAE4D9' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}
                style={{
                  padding: '10px 20px', background: '#fff', border: '1.5px solid #EAE4D9',
                  color: '#5C4A3A', borderRadius: 12,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
              >
                {isAr ? 'عرض كل الخدمات' : 'Show all services'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="svc-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}
          >
            {filtered.map((service, svcIdx) => (
              <button
                type="button"
                key={service.id}
                aria-label={service.name_ar}
                onClick={() => setSelectedService(service)}
                className="svc-card"
                style={{
                  display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16,
                  padding: '14px', border: '1.5px solid #EAE4D9',
                  textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  fontFamily: 'inherit', cursor: 'pointer', width: '100%',
                  transition: 'all 0.14s', position: 'relative', overflow: 'hidden',
                  animation: 'svcEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${Math.min(svcIdx, 20) * 0.03}s`,
                }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF7F7'; e.currentTarget.style.borderColor = 'rgba(139,26,26,0.3)'; e.currentTarget.style.transform = 'scale(0.98)' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                {/* Top row: icon badge + chevron */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #FEF2F2, #FCE8E8)',
                    border: '1px solid rgba(139,26,26,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="svc-icon" style={{ fontSize: 20, lineHeight: 1 }}>{service.icon}</span>
                  </div>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </div>

                {/* Name */}
                <h3 style={{
                  fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  flex: 1,
                }}>
                  {service.name_ar}
                </h3>

                {/* Authority */}
                <p style={{
                  fontSize: 10.5, color: '#8B1A1A', margin: '0 0 10px', fontWeight: 700,
                  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {service.authority_ar}
                </p>

                {/* Meta row */}
                <div className="svc-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {service.fees && (
                    <span style={{ fontSize: 10, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '2px 8px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                      {service.fees.length > 18 ? service.fees.slice(0, 18) + '…' : service.fees}
                    </span>
                  )}
                  {service.processing_time && (
                    <span style={{ fontSize: 10, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '2px 8px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                      {service.processing_time}
                    </span>
                  )}
                  {service.online_available && (
                    <span style={{ fontSize: 10, color: '#065F46', background: 'rgba(6,95,70,0.07)', borderRadius: 20, padding: '2px 8px', border: '1px solid rgba(6,95,70,0.2)', fontWeight: 600 }}>
                      أونلاين
                    </span>
                  )}
                  {service.required_documents && service.required_documents.length > 0 && (
                    <span style={{ fontSize: 10, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                      {service.required_documents.length} وثيقة
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Service Detail Sheet ─────────────────────────────────────────────── */}
      {selectedService && (
        <ServiceSheet
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAsk={handleAsk}
        />
      )}

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="services" /></div>
    </div>
  )
}