'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { searchForms } from '@/lib/procedures'
import { TX_ALL, TX_WITH_FORMS, TX_MINISTRIES, filterTxAll, filterTxForms, type TxItem } from '@/lib/allTransactions'
import type { FormItem } from '@/lib/types'

type ViewTab = 'curated' | 'all-tx' | 'forms-tx'

export default function FormsPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [ministryFilter, setMinistryFilter] = useState('all')
  const [viewTab, setViewTab] = useState<ViewTab>('forms-tx')
  const isAr = lang === 'ar'

  const allForms = useMemo(() => searchForms(''), [])

  // Curated 32 forms
  const filteredCurated = useMemo(() => {
    let forms = search.trim() ? searchForms(search) : allForms
    if (ministryFilter !== 'all') {
      forms = forms.filter(f => {
        const m = (f.ministry_ar + f.ministry_en).toLowerCase()
        return m.includes(ministryFilter)
      })
    }
    return forms
  }, [search, ministryFilter, allForms])

  // All 2484 transactions
  const filteredAllTx = useMemo(() =>
    filterTxAll(ministryFilter === 'all' ? '' : ministryFilter, search, false),
    [search, ministryFilter])

  // 794 transactions with PDF forms
  const filteredTx = useMemo(() =>
    filterTxForms(ministryFilter === 'all' ? '' : ministryFilter, search),
    [search, ministryFilter])

  // Top ministries for filter
  const topMinistries = useMemo(() => TX_MINISTRIES.slice(0, 20), [])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  const typeColor = (t: string) => t === 'official' ? '#15803D' : '#B45309'
  const typeBg = (t: string) => t === 'official' ? '#F0FDF4' : '#FFFBEB'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir="rtl">
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #EAE4D9; }
        .form-card:hover { border-color: #8B1A1A !important; box-shadow: 0 4px 16px rgba(139,26,26,0.1) !important; }
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
                {isAr ? 'النماذج والمعاملات' : 'Forms & Procedures'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, margin: 0 }}>
                {isAr ? '2,484 معاملة · 794 نموذج PDF · 52 جهة' : '2,484 transactions · 794 PDF forms'}
              </p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 9, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 14px 100px' }}>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
          {[
            { tab: 'forms-tx' as ViewTab, labelAr: `نماذج PDF (${TX_WITH_FORMS.length})`, labelEn: `PDF Forms (${TX_WITH_FORMS.length})`, icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
            { tab: 'all-tx' as ViewTab, labelAr: `معاملات (${TX_ALL.length})`, labelEn: `All (${TX_ALL.length})`, icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> },
            { tab: 'curated' as ViewTab, labelAr: `منظّمة (${allForms.length})`, labelEn: `Curated (${allForms.length})`, icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
          ].map(({ tab, labelAr, labelEn, icon }) => (
            <button key={tab} onClick={() => setViewTab(tab)} style={{
              flex: 1, padding: '7px 6px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.15s',
              background: viewTab === tab ? '#fff' : 'transparent',
              color: viewTab === tab ? '#8B1A1A' : '#6B7280',
              boxShadow: viewTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {icon} {isAr ? labelAr : labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#B0A090', pointerEvents: 'none', display: 'flex' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input type="text"
            placeholder={viewTab === 'all-tx' ? 'ابحث في 2,484 معاملة...' : viewTab === 'forms-tx' ? 'ابحث في 794 نموذج PDF...' : 'ابحث في النماذج المنظّمة...'}
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 42px 11px 36px', border: '1.5px solid #EAE4D9', borderRadius: 14, fontSize: 13, background: '#fff', outline: 'none', fontFamily: 'inherit', color: '#1A1208', direction: 'rtl' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>}
        </div>

        {/* Ministry filter — for transaction tabs */}
        {(viewTab === 'forms-tx' || viewTab === 'all-tx') && (
          <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
            <button onClick={() => setMinistryFilter('all')} style={{
              padding: '4px 12px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: ministryFilter === 'all' ? '#8B1A1A' : '#EAE4D9',
              background: ministryFilter === 'all' ? '#FEF2F2' : '#fff',
              color: ministryFilter === 'all' ? '#8B1A1A' : '#6B7280',
            }}>
              الكل ({viewTab === 'all-tx' ? TX_ALL.length : TX_WITH_FORMS.length})
            </button>
            {topMinistries.map(m => (
              <button key={m.slug} onClick={() => setMinistryFilter(m.slug)} style={{
                padding: '4px 11px', borderRadius: 20, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                borderColor: ministryFilter === m.slug ? '#8B1A1A' : '#EAE4D9',
                background: ministryFilter === m.slug ? '#FEF2F2' : '#fff',
                color: ministryFilter === m.slug ? '#8B1A1A' : '#6B7280',
              }}>
                {m.ar.length > 22 ? m.ar.slice(0, 22) + '...' : m.ar}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p style={{ fontSize: 11, color: '#9C8E80', margin: '0 0 10px' }}>
          {viewTab === 'all-tx' ? `${filteredAllTx.length} معاملة حكومية` : viewTab === 'forms-tx' ? `${filteredTx.length} معاملة بنموذج PDF` : `${filteredCurated.length} نموذج منظّم`}
        </p>

        {/* ── ALL TRANSACTIONS VIEW ──────────────────────────────────────────── */}
        {viewTab === 'all-tx' && (
          filteredAllTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 8, color: '#C4B5A5' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>لم يُعثر على نتائج</p>
              <button onClick={() => askAI(`أريد معلومات عن معاملة: ${search}`)} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: '#8B1A1A', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                اسأل دليلك
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredAllTx.slice(0, 200).map((tx: TxItem) => (
                <div key={tx.id} className="form-card" style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '10px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', lineHeight: 1.4 }}>{tx.title}</div>
                    <div style={{ fontSize: 10, color: '#8B1A1A', fontWeight: 600 }}>{tx.ministry}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {tx.hasForm && tx.pdfUrl ? (
                      <a href={tx.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', background: '#8B1A1A', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>PDF</a>
                    ) : (
                      <span style={{ padding: '5px 9px', background: '#F3F4F6', color: '#6B7280', borderRadius: 8, fontSize: 10 }}>بلا نموذج</span>
                    )}
                    <button onClick={() => askAI(`ما هي متطلبات وخطوات معاملة: ${tx.title}؟`)} style={{ padding: '5px 9px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>AI</button>
                  </div>
                </div>
              ))}
              {filteredAllTx.length > 200 && (
                <div style={{ textAlign: 'center', padding: '12px', color: '#9C8E80', fontSize: 11 }}>
                  يتم عرض أول 200 نتيجة من {filteredAllTx.length} — استخدم البحث لتضييق النتائج
                </div>
              )}
            </div>
          )
        )}

        {/* ── FORMS-ONLY TRANSACTIONS VIEW ──────────────────────────────────── */}
        {viewTab === 'forms-tx' && (
          filteredTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 8, color: '#C4B5A5' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>لم يُعثر على نتائج</p>
              <button onClick={() => askAI(`أريد معلومات عن نماذج ${search}`)} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: '#8B1A1A', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                اسأل دليلك
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTx.map((tx: TxItem) => (
                <div key={tx.id} className="form-card" style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', lineHeight: 1.4, marginBottom: 2 }}>{tx.title}</div>
                      <div style={{ fontSize: 10.5, color: '#8B1A1A', fontWeight: 600, marginBottom: 6 }}>{tx.ministry}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, color: '#065F46', background: '#ECFDF5', borderRadius: 6, padding: '1px 7px', border: '1px solid #A7F3D0', fontWeight: 600 }}>نموذج متاح</span>
                        {tx.fee && <span style={{ fontSize: 9.5, color: '#854D0E', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>{tx.fee}</span>}
                        {tx.duration && <span style={{ fontSize: 9.5, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 6, padding: '1px 7px', border: '1px solid rgba(139,26,26,0.2)' }}>{tx.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
                    <button onClick={() => askAI(`ما هي متطلبات وإجراءات معاملة: ${tx.title}؟`)} style={{ flex: 1, padding: '7px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      اسأل دليلك
                    </button>
                    {tx.pdfUrl && (
                      <a href={tx.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '7px', background: '#fff', color: '#8B1A1A', border: '1.5px solid rgba(139,26,26,0.2)', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        تحميل النموذج
                      </a>
                    )}
                    {!tx.pdfUrl && (
                      <span style={{ flex: 1, padding: '7px', background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 9, fontSize: 11, textAlign: 'center' }}>
                        بلا نموذج
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── CURATED FORMS VIEW ──────────────────────────────────────────── */}
        {viewTab === 'curated' && (
          filteredCurated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9C8E80' }}>
              <div style={{ marginBottom: 8, color: '#C4B5A5' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>لم يُعثر على نماذج</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredCurated.map((form: FormItem) => (
                <div key={form.slug} className="form-card" style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? form.title_ar : form.title_en}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: typeColor(form.type), background: typeBg(form.type), borderRadius: 6, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {form.type === 'official'
                            ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>رسمي</>
                            : <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>مسودة</>
                          }
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 6px' }}>{isAr ? form.authority_ar : form.authority_en} · {isAr ? form.ministry_ar : form.ministry_en}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>{isAr ? form.category_ar : form.category_en}</span>
                        {form.lastReviewed && <span style={{ fontSize: 9.5, color: '#9C8E80', background: '#F5F5F5', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{form.lastReviewed}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #F0EBE0' }}>
                    <button onClick={() => askAI(isAr ? form.chatPrompt_ar : form.chatPrompt_en)} style={{ flex: 1, padding: '8px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                      اسأل دليلك
                    </button>
                    {form.url && (
                      <a href={form.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '8px', background: '#fff', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: 10, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>فتح النموذج<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* AI CTA */}
        <div style={{ marginTop: 20, padding: '14px', background: 'linear-gradient(135deg, #FEF2F2, #FFF7F7)', borderRadius: 14, border: '1px solid rgba(139,26,26,0.1)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 12.5, fontWeight: 700, color: '#1A1208' }}>لم تجد النموذج المطلوب؟</p>
          <p style={{ margin: '0 0 10px', fontSize: 10.5, color: '#6B7280' }}>اسأل الذكاء الاصطناعي — يغطي 81,000+ مصدر</p>
          <button onClick={() => router.push('/')} style={{ padding: '9px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #7a1a1a, #9B2335)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 6 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            اسأل دليلك الذكي
          </button>
        </div>
      </div>

      {/* Bottom Nav — mobile */}
      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
