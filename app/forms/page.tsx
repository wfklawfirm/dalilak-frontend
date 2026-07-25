'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { searchForms } from '@/lib/procedures'
import { TX_ALL, TX_WITH_FORMS, TX_MINISTRIES, filterTxAll, filterTxForms, type TxItem } from '@/lib/allTransactions'
import type { FormItem } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'

type ViewTab = 'curated' | 'all-tx' | 'forms-tx'

export default function FormsPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [search, setSearch] = useState('')
  const [ministryFilter, setMinistryFilter] = useState('all')
  const [viewTab, setViewTab] = useState<ViewTab>('forms-tx')
  const [searchFocused, setSearchFocused] = useState(false)

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

  // Top ministries for filter — deduplicated by slug (highest-count first), skip 'other'
  const topMinistries = useMemo(() => {
    const seen = new Set<string>()
    return TX_MINISTRIES
      .filter(m => m.slug !== 'other')
      .filter(m => { if (seen.has(m.slug)) return false; seen.add(m.slug); return true })
      .slice(0, 18)
  }, [])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  const typeColor = (t: string) => t === 'official' ? '#78350F' : '#B45309'
  const typeBg = (t: string) => t === 'official' ? '#FFFBEB' : '#FFF7ED'

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--border); }
        .form-card:hover { border-color: var(--brand) !important; }
        .forms-filter-row { -ms-overflow-style: none; scrollbar-width: none; }
        .forms-filter-row::-webkit-scrollbar { display: none; }
        @keyframes formEnter { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header — v4.0: flat surface header, same pattern as other pages */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--header-padding)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 'var(--container-md)', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label={isAr ? 'الرئيسية' : 'Home'} onClick={() => router.push('/')}
            onTouchStart={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'transparent' }}
            style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text-1)', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ color: 'var(--text-1)', fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.2, flex: 1, fontFamily: 'inherit' }}>
            {isAr ? 'النماذج والمعاملات' : 'Forms & Procedures'}
          </h1>
        </div>
      </header>

      <main id="main-content" style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '16px 14px var(--bottom-nav-clearance)' }}>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'var(--border)', borderRadius: 12, padding: 4 }}>
          {[
            { tab: 'forms-tx' as ViewTab, labelAr: `نماذج PDF (${TX_WITH_FORMS.length})`, labelEn: `PDF Forms (${TX_WITH_FORMS.length})`, icon: <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
            { tab: 'all-tx' as ViewTab, labelAr: `معاملات (${TX_ALL.length})`, labelEn: `All (${TX_ALL.length})`, icon: <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> },
            { tab: 'curated' as ViewTab, labelAr: `منظّمة (${allForms.length})`, labelEn: `Curated (${allForms.length})`, icon: <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
          ].map(({ tab, labelAr, labelEn, icon }) => (
            <button type="button" key={tab} aria-pressed={viewTab === tab} onClick={() => setViewTab(tab)}
              onTouchStart={e => {
                e.currentTarget.style.background = viewTab === tab ? 'var(--bg)' : 'transparent'
              }}
              onTouchEnd={e => {
                e.currentTarget.style.background = viewTab === tab ? '#fff' : 'transparent'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = viewTab === tab ? 'var(--bg)' : 'transparent'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = viewTab === tab ? '#fff' : 'transparent'
              }}
              style={{
              flex: 1, padding: '7px 6px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              background: viewTab === tab ? '#fff' : 'transparent',
              color: viewTab === tab ? 'var(--brand)' : 'var(--text-2)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {icon} {isAr ? labelAr : labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ position: 'relative', marginBottom: 12, border: `1px solid ${searchFocused ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 14, background: 'var(--surface)', transition: 'border-color 0.18s' }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: searchFocused ? 'var(--brand)' : '#B0A090', pointerEvents: 'none', display: 'flex', transition: 'color 0.18s' }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input type="text"
            aria-label={isAr ? 'ابحث في النماذج والمعاملات' : 'Search forms and procedures'}
            placeholder={isAr
              ? (viewTab === 'all-tx' ? `ابحث في ${TX_ALL.length.toLocaleString('en-US')} معاملة...` : viewTab === 'forms-tx' ? `ابحث في ${TX_WITH_FORMS.length} نموذج PDF...` : 'ابحث في النماذج المنظّمة...')
              : (viewTab === 'all-tx' ? `Search ${TX_ALL.length.toLocaleString('en-US')} transactions...` : viewTab === 'forms-tx' ? `Search ${TX_WITH_FORMS.length} PDF forms...` : 'Search curated forms...')
            }
            value={search} onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ width: '100%', padding: '11px 42px 11px 36px', border: 'none', borderRadius: 14, fontSize: 13, background: 'transparent', outline: 'none', fontFamily: 'inherit', color: 'var(--text-1)', direction: isAr ? 'rtl' : 'ltr' }}
          />
          {search && <button type="button" aria-label={isAr ? 'مسح البحث' : 'Clear search'} onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 4, background: 'var(--border)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)' }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>}
        </div>

        {/* Ministry filter — for transaction tabs */}
        {(viewTab === 'forms-tx' || viewTab === 'all-tx') && (
          <div className="forms-filter-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
            <button type="button" aria-pressed={ministryFilter === 'all'} onClick={() => setMinistryFilter('all')}
              onTouchStart={e => {
                const isActive = ministryFilter === 'all'
                e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : 'var(--bg)'
                e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
              }}
              onTouchEnd={e => {
                const isActive = ministryFilter === 'all'
                e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : '#fff'
                e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
              }}
              onMouseEnter={e => {
                const isActive = ministryFilter === 'all'
                e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : 'var(--bg)'
                e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
              }}
              onMouseLeave={e => {
                const isActive = ministryFilter === 'all'
                e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : '#fff'
                e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
              }}
              style={{
              padding: '4px 12px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: ministryFilter === 'all' ? 'var(--brand)' : 'var(--border)',
              background: ministryFilter === 'all' ? 'var(--brand-soft)' : '#fff',
              color: ministryFilter === 'all' ? 'var(--brand)' : 'var(--text-2)',
            }}>
              {isAr ? 'الكل' : 'All'} ({viewTab === 'all-tx' ? TX_ALL.length : TX_WITH_FORMS.length})
            </button>
            {topMinistries.map(m => (
              <button type="button" key={m.slug} aria-pressed={ministryFilter === m.slug} onClick={() => setMinistryFilter(m.slug)}
                onTouchStart={e => {
                  const isActive = ministryFilter === m.slug
                  e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : 'var(--bg)'
                  e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
                }}
                onTouchEnd={e => {
                  const isActive = ministryFilter === m.slug
                  e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : '#fff'
                  e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
                }}
                onMouseEnter={e => {
                  const isActive = ministryFilter === m.slug
                  e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : 'var(--bg)'
                  e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
                }}
                onMouseLeave={e => {
                  const isActive = ministryFilter === m.slug
                  e.currentTarget.style.background = isActive ? 'var(--brand-soft)' : '#fff'
                  e.currentTarget.style.borderColor = isActive ? 'var(--brand)' : 'var(--border)'
                }}
                style={{
                padding: '4px 11px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                borderColor: ministryFilter === m.slug ? 'var(--brand)' : 'var(--border)',
                background: ministryFilter === m.slug ? 'var(--brand-soft)' : '#fff',
                color: ministryFilter === m.slug ? 'var(--brand)' : 'var(--text-2)',
              }}>
                {m.ar.length > 22 ? m.ar.slice(0, 22) + '...' : m.ar}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p aria-live="polite" aria-atomic="true" style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 10px' }}>
          {viewTab === 'all-tx'
            ? `${filteredAllTx.length} ${isAr ? 'معاملة حكومية' : 'government transactions'}`
            : viewTab === 'forms-tx'
              ? `${filteredTx.length} ${isAr ? 'معاملة بنموذج PDF' : 'transactions with PDF form'}`
              : `${filteredCurated.length} ${isAr ? 'نموذج منظّم' : 'curated forms'}`}
        </p>

        {/* ── ALL TRANSACTIONS VIEW ──────────────────────────────────────────── */}
        {viewTab === 'all-tx' && (
          filteredAllTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
              <div style={{ marginBottom: 8, color: 'var(--text-3)' }}><svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>{isAr ? 'لم يُعثر على نتائج' : 'No results found'}</p>
              <button type="button" onClick={() => askAI(isAr ? `أريد معلومات عن معاملة: ${search}` : `I need information about: ${search}`)}
                onTouchStart={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: 'var(--brand)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s, transform 0.12s' }}>
                {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredAllTx.slice(0, 200).map((tx: TxItem) => (
                <div key={tx.id} className="form-card" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', transition: 'border-color 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{isAr ? tx.title : (tx.titleEn || tx.title)}</div>
                    <div style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 600 }}>{isAr ? tx.ministry : (tx.ministryEn || tx.ministry)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {tx.hasForm && tx.pdfUrl ? (
                      <a href={tx.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 9px', background: 'var(--brand)', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 700, textDecoration: 'none' }}>PDF</a>
                    ) : (
                      <span style={{ padding: '5px 9px', background: 'var(--border)', color: 'var(--text-2)', borderRadius: 8, fontSize: 10 }}>{isAr ? 'بلا نموذج' : 'No form'}</span>
                    )}
                    <button type="button" onClick={() => askAI(isAr ? `ما هي متطلبات وخطوات معاملة: ${tx.title}؟` : `What are the requirements and steps for: ${tx.titleEn || tx.title}?`)}
                      onTouchStart={e => { e.currentTarget.style.opacity = '0.75' }}
                      onTouchEnd={e => { e.currentTarget.style.opacity = '1' }}
                      style={{ padding: '5px 9px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s' }}>{isAr ? 'اسأل' : 'Ask'}</button>
                  </div>
                </div>
              ))}
              {filteredAllTx.length > 200 && (
                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-3)', fontSize: 11 }}>
                  {isAr
                    ? `يتم عرض أول 200 نتيجة من ${filteredAllTx.length} — استخدم البحث لتضييق النتائج`
                    : `Showing first 200 of ${filteredAllTx.length} — use search to narrow results`}
                </div>
              )}
            </div>
          )
        )}

        {/* ── FORMS-ONLY TRANSACTIONS VIEW ──────────────────────────────────── */}
        {viewTab === 'forms-tx' && (
          filteredTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
              <div style={{ marginBottom: 8, color: 'var(--text-3)' }}><svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>{isAr ? 'لم يُعثر على نتائج' : 'No results found'}</p>
              <button type="button" onClick={() => askAI(isAr ? `أريد معلومات عن نماذج ${search}` : `I need information about forms: ${search}`)}
                onTouchStart={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: 'var(--brand)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s, transform 0.12s' }}>
                {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredTx.map((tx: TxItem, txIdx: number) => (
                <div key={tx.id} className="form-card" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px', transition: 'border-color 0.15s', animation: 'formEnter 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(txIdx, 14) * 0.04}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--brand-soft)', border: '1px solid var(--border-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 2 }}>{isAr ? tx.title : (tx.titleEn || tx.title)}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--brand)', fontWeight: 600, marginBottom: 6 }}>{isAr ? tx.ministry : (tx.ministryEn || tx.ministry)}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 9.5, color: '#854D0E', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', border: '1px solid #FDE68A', fontWeight: 600 }}>{isAr ? 'نموذج متاح' : 'Form available'}</span>
                        {tx.fee && <span style={{ fontSize: 9.5, color: '#854D0E', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', border: '1px solid #FEF3C7' }}>{tx.fee}</span>}
                        {tx.duration && <span style={{ fontSize: 9.5, color: 'var(--brand)', background: 'var(--brand-soft)', borderRadius: 6, padding: '1px 7px', border: '1px solid var(--border-brand)' }}>{tx.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <button type="button" onClick={() => askAI(isAr ? `ما هي متطلبات وإجراءات معاملة: ${tx.title}؟` : `What are the requirements and procedures for: ${tx.titleEn || tx.title}?`)}
                      onTouchStart={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(0.97)' }}
                      onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                      style={{ flex: 1, padding: '7px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.12s, transform 0.12s' }}>
                      {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                    </button>
                    {tx.pdfUrl && (
                      <a href={tx.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '7px', background: '#fff', color: 'var(--brand)', border: '1.5px solid var(--border-brand)', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isAr ? 'تحميل النموذج' : 'Download form'}
                      </a>
                    )}
                    {!tx.pdfUrl && (
                      <span style={{ flex: 1, padding: '7px', background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 9, fontSize: 11, textAlign: 'center' }}>
                        {isAr ? 'بلا نموذج' : 'No form'}
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
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
              <div style={{ marginBottom: 8, color: 'var(--text-3)' }}><svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
              <p style={{ fontSize: 14, margin: 0 }}>{isAr ? 'لم يُعثر على نماذج' : 'No forms found'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredCurated.map((form: FormItem, fIdx: number) => (
                <div key={form.slug} className="form-card" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', transition: 'border-color 0.15s', animation: 'formEnter 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(fIdx, 14) * 0.04}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-soft)', border: '1px solid var(--border-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 3 }}>
                        {isAr ? form.title_ar : form.title_en}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600, marginBottom: 8 }}>
                        {isAr ? form.ministry_ar : form.ministry_en}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 9.5, borderRadius: 6, padding: '2px 8px', fontWeight: 600,
                          color: form.type === 'official' ? 'var(--brand)' : '#854D0E',
                          background: form.type === 'official' ? 'var(--brand-soft)' : '#FFFBEB',
                          border: `1px solid ${form.type === 'official' ? 'var(--border-brand)' : '#FEF3C7'}`,
                        }}>
                          {isAr ? (form.type === 'official' ? 'رسمي' : 'مسودة') : form.type}
                        </span>
                        <span style={{ fontSize: 9.5, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 6, padding: '2px 8px', border: '1px solid var(--border)' }}>
                          {isAr ? form.category_ar : form.category_en}
                        </span>
                        {form.fileType === 'pdf' && (
                          <span style={{ fontSize: 9.5, color: '#991B1B', background: 'var(--brand-soft)', borderRadius: 6, padding: '2px 8px', border: '1px solid #FECACA', fontWeight: 700 }}>PDF</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      onClick={() => askAI(isAr ? form.chatPrompt_ar : form.chatPrompt_en)}
                      onTouchStart={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(0.97)' }}
                      onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                      style={{ flex: 1, padding: '8px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'opacity 0.12s, transform 0.12s' }}
                    >
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                    </button>
                    {form.url ? (
                      <a href={form.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '8px', background: '#fff', color: 'var(--brand)', border: '1.5px solid var(--border-brand)', borderRadius: 10, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        {isAr ? 'تحميل النموذج' : 'Download'}
                      </a>
                    ) : (
                      <span style={{ flex: 1, padding: '8px', background: 'var(--bg)', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isAr ? 'بلا رابط' : 'No link'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </main>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" />
      </div>
    </div>
  )
}
