'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDURES_DATA, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import { ALL_SERVICES } from '@/lib/allServices'
import { ENRICHED_PROCEDURES, searchEnrichedProcedures, type EnrichedProcedure } from '@/lib/enrichedProcedures'
import BottomNav from '@/components/BottomNav'

const GUIDED_ACTIVE_COUNT = PROCEDURES_DATA.filter(p => p.status === 'active').length
const PROCEDURES_TOTAL = GUIDED_ACTIVE_COUNT + ENRICHED_PROCEDURES.length

export default function ProceduresPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [expandedProc, setExpandedProc] = useState<string | null>(null)
  const isAr = lang === 'ar'

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
    router.push(`/?q=${encodeURIComponent(prompt)}`)
  }, [router])

  const totalResults = filteredGuided.length + filteredEnriched.length

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo', 'Inter', sans-serif", overflowX: 'hidden' }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; border-radius: 2px; }
        .proc-card:hover { border-color: rgba(139,26,26,0.4) !important; box-shadow: 0 2px 12px rgba(139,26,26,0.08) !important; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
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
                {isAr ? `${PROCEDURES_TOTAL} إجراء موثّق بالخطوات والوثائق` : `${PROCEDURES_TOTAL} documented step-by-step`}
              </p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#fff', borderRadius: 14, border: '1.5px solid #EAE4D9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {[
            { value: String(PROCEDURES_TOTAL), label: isAr ? 'إجراء موثّق' : 'Procedures' },
            { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة متاحة' : 'Services' },
            { value: '52+', label: isAr ? 'جهة مختصة' : 'Authorities' },
          ].map((stat, idx) => (
            <div key={stat.value} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              borderRight: idx < 2 ? '1px solid #EAE4D9' : 'none',
            }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#8B1A1A', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 9.5, color: '#9C8E80', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '10px 14px', marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? `ابحث في ${PROCEDURES_TOTAL} إجراء...` : `Search ${PROCEDURES_TOTAL} procedures...`}
            dir="rtl"
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13.5, color: '#1A1208', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', display: 'flex', alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Count */}
        <p style={{ fontSize: 11, color: '#9C8E80', marginBottom: 12 }}>
          {totalResults} {isAr ? `إجراء${search ? ` لـ "${search}"` : ''}` : `procedures${search ? ` for "${search}"` : ''}`}
        </p>

        {/* Results */}
        {totalResults === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9C8E80' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {isAr ? 'لم نجد إجراءات مطابقة' : 'No matching procedures'}
            </p>
            <button onClick={() => handleAsk(search)} style={{
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(139,26,26,0.25)',
            }}>
              {isAr ? `اسأل دليلك عن: ${search}` : `Ask about: ${search}`}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Guided procedures */}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#8B1A1A', background: 'rgba(139,26,26,0.08)', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.15)' }}>
                          {isAr ? 'مُرشدة' : 'Guided'}
                        </span>
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
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 7 }}>
                            {isAr ? 'الوثائق المطلوبة:' : 'Required documents:'}
                          </div>
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
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', marginBottom: 7 }}>
                            {isAr ? 'خطوات الإجراء:' : 'Steps:'}
                          </div>
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
                      }}>
                        {isAr ? 'اسأل دليلك عن هذا الإجراء' : 'Ask about this procedure'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Section divider — only when both groups are present */}
            {filteredGuided.length > 0 && filteredEnriched.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 2px' }}>
                <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9C8E80', whiteSpace: 'nowrap', padding: '3px 10px', background: '#F5F0EB', borderRadius: 20, border: '1px solid #EAE4D9' }}>
                  {isAr ? 'إجراءات موثّقة' : 'Documented procedures'}
                </span>
                <div style={{ flex: 1, height: 1, background: '#EAE4D9' }} />
              </div>
            )}

            {/* Enriched procedures */}
            {filteredEnriched.map((proc: EnrichedProcedure) => (
              <div key={proc.code} className="proc-card" style={{
                background: '#fff', border: `1.5px solid ${expandedProc === proc.code ? '#8B1A1A' : '#EAE4D9'}`,
                borderRadius: 14, overflow: 'hidden', transition: 'all 0.18s',
                boxShadow: expandedProc === proc.code ? '0 4px 16px rgba(139,26,26,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
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
                      {proc.steps.length > 0 && <span style={{ fontSize: 9.5, background: '#FEF2F2', color: '#8B1A1A', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{proc.steps.length} خطوة</span>}
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
                        <span style={{ fontSize: 11, color: '#5C4A3A' }}>{proc.fees.length > 180 ? proc.fees.slice(0, 180) + '…' : proc.fees}</span>
                      </div>
                    )}
                    <button onClick={() => handleAsk(proc.title)} style={{
                      marginTop: 4, padding: '8px 18px', borderRadius: 10,
                      background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                      border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      اسأل دليلك عن هذا الإجراء
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link to full services directory */}
        <div style={{ marginTop: 28, borderTop: '1px solid #EAE4D9', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 3 }}>
                {isAr ? 'دليل الخدمات الحكومية' : 'Government Services Directory'}
              </div>
              <div style={{ fontSize: 11, color: '#9C8E80' }}>
                {isAr ? `${ALL_SERVICES.length} خدمة · 44 فئة` : `${ALL_SERVICES.length} services · 44 categories`}
              </div>
            </div>
            <button
              onClick={() => router.push('/services')}
              style={{
                padding: '9px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(139,26,26,0.25)', whiteSpace: 'nowrap',
              }}
            >
              {isAr ? 'استعرض الكل' : 'Browse all'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <BottomNav isAr={lang === 'ar'} activeTab="procedures" />
    </div>
  )
}
