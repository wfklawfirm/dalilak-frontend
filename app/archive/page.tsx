'use client'

/**
 * /archive — أرشيف الوثائق الرسمية
 *
 * صفحة بحث/تصفح لأكثر من 5300 وثيقة حكومية لبنانية حقيقية (قرارات مصرف
 * لبنان، تعاميم جمركية، قرارات وزارية، تقارير رسمية، محاضر، نماذج طلبات)
 * مستخرجة من أرشيف فعلي وليست بيانات تجريبية. كل سجل مرتبط بملف PDF/XLSX
 * أصلي قابل للتحميل (مستضاف على مستودع GitHub منفصل — راجع
 * lib/archiveDocuments.ts للتفاصيل).
 *
 * يتبع نفس نمط /forms و/procedures (MobileHeader + SearchInput + StatsRow
 * + بطاقات) بدل بناء تصميم منفصل، حفاظاً على الاتساق البصري لـ"Calm
 * Government Digital Service".
 */

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MobileHeader from '@/components/MobileHeader'
import SearchInput from '@/components/SearchInput'
import StatsRow from '@/components/StatsRow'
import { ARCHIVE_DOCS, ARCHIVE_INSTITUTIONS, type ArchiveDoc } from '@/lib/archiveDocuments'
import { useLanguage } from '@/lib/LanguageContext'

const PAGE_SIZE = 60

export default function ArchivePage() {
  const router = useRouter()
  const { isAr, toggleLang } = useLanguage()
  const [search, setSearch] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const topInstitutions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of ARCHIVE_DOCS) counts.set(d.institution, (counts.get(d.institution) || 0) + 1)
    return ARCHIVE_INSTITUTIONS
      .slice()
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
      .slice(0, 14)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ARCHIVE_DOCS.filter(d => {
      if (institutionFilter !== 'all' && d.institution !== institutionFilter) return false
      if (!q) return true
      return (
        d.title.toLowerCase().includes(q) ||
        d.snippet.toLowerCase().includes(q) ||
        d.institutionAr.toLowerCase().includes(q) ||
        d.institution.toLowerCase().includes(q) ||
        (d.year ? String(d.year).includes(q) : false)
      )
    })
  }, [search, institutionFilter])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  const institutionLabel = (d: ArchiveDoc) => isAr ? d.institutionAr : d.institution

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        .archive-card:hover { border-color: var(--brand) !important; }
        .archive-filter-row { -ms-overflow-style: none; scrollbar-width: none; }
        .archive-filter-row::-webkit-scrollbar { display: none; }
        @keyframes archiveEnter { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <MobileHeader
        titleAr="أرشيف الوثائق الرسمية" titleEn="Official Documents Archive"
        isAr={isAr} onBack={() => router.push('/')} toggleLang={toggleLang}
      />

      <main id="main-content" style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '16px 14px var(--bottom-nav-clearance)' }}>

        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 14px' }}>
          {isAr
            ? 'أرشيف بحثي لوثائق حكومية لبنانية حقيقية — قرارات، تعاميم، تقارير، ومحاضر من 19 جهة رسمية. كل وثيقة هنا مستخرجة من ملف أصلي قابل للتحميل.'
            : 'A searchable archive of real Lebanese government documents — decisions, circulars, reports, and minutes from 19 official bodies. Every document here is extracted from a downloadable original file.'}
        </p>

        <StatsRow
          columns={3}
          stats={[
            { value: ARCHIVE_DOCS.length.toLocaleString('en-US'), label: isAr ? 'وثيقة موثّقة' : 'Documents' },
            { value: String(ARCHIVE_INSTITUTIONS.length), label: isAr ? 'جهة رسمية' : 'Institutions' },
            { value: '1950–2026', label: isAr ? 'المدى الزمني' : 'Time span' },
          ]}
        />

        <SearchInput
          value={search} onChange={setSearch} isAr={isAr}
          ariaLabel={isAr ? 'ابحث في أرشيف الوثائق الرسمية' : 'Search official documents archive'}
          placeholder={isAr ? `ابحث في ${ARCHIVE_DOCS.length.toLocaleString('en-US')} وثيقة...` : `Search ${ARCHIVE_DOCS.length.toLocaleString('en-US')} documents...`}
        />

        <div className="archive-filter-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, margin: '10px 0 12px' }}>
          <button type="button" aria-pressed={institutionFilter === 'all'} onClick={() => { setInstitutionFilter('all'); setVisibleCount(PAGE_SIZE) }}
            style={{
              padding: '4px 12px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: institutionFilter === 'all' ? 'var(--brand)' : 'var(--border)',
              background: institutionFilter === 'all' ? 'var(--brand-soft)' : '#fff',
              color: institutionFilter === 'all' ? 'var(--brand)' : 'var(--text-2)',
            }}>
            {isAr ? 'الكل' : 'All'} ({ARCHIVE_DOCS.length.toLocaleString('en-US')})
          </button>
          {topInstitutions.map(inst => {
            const doc = ARCHIVE_DOCS.find(d => d.institution === inst)
            const label = doc ? (isAr ? doc.institutionAr : inst) : inst
            return (
              <button type="button" key={inst} aria-pressed={institutionFilter === inst}
                onClick={() => { setInstitutionFilter(inst); setVisibleCount(PAGE_SIZE) }}
                style={{
                  padding: '4px 11px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  borderColor: institutionFilter === inst ? 'var(--brand)' : 'var(--border)',
                  background: institutionFilter === inst ? 'var(--brand-soft)' : '#fff',
                  color: institutionFilter === inst ? 'var(--brand)' : 'var(--text-2)',
                }}>
                {label.length > 22 ? label.slice(0, 22) + '...' : label}
              </button>
            )
          })}
        </div>

        <p aria-live="polite" aria-atomic="true" style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 10px' }}>
          {isAr ? `${filtered.length.toLocaleString('en-US')} وثيقة` : `${filtered.length.toLocaleString('en-US')} documents`}
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
            <div style={{ marginBottom: 8, color: 'var(--text-3)' }}><svg aria-hidden="true" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
            <p style={{ fontSize: 14, margin: 0 }}>{isAr ? 'لم يُعثر على نتائج' : 'No results found'}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.slice(0, visibleCount).map((d, idx) => (
                <div key={d.id} className="archive-card" style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '12px 14px', transition: 'border-color 0.15s', animation: 'archiveEnter 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(idx, 14) * 0.03}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-soft)', border: '1px solid var(--border-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 3 }}>{d.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: 10.5, color: 'var(--brand)', fontWeight: 600 }}>{institutionLabel(d)}</span>
                        {d.year && (
                          <span style={{ fontSize: 9.5, color: 'var(--text-3)', background: 'var(--bg)', borderRadius: 6, padding: '1px 7px', border: '1px solid var(--border)' }}>{d.year}</span>
                        )}
                      </div>
                      {d.snippet && (
                        <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {d.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <button type="button" onClick={() => askAI(isAr ? `لخّص لي هذه الوثيقة الرسمية: ${d.title}` : `Summarize this official document: ${d.title}`)}
                      style={{ flex: 1, padding: '7px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                    </button>
                    <a href={d.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '7px', background: '#fff', color: 'var(--brand)', border: '1.5px solid var(--border-brand)', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isAr ? 'عرض الملف الأصلي' : 'View original file'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length > visibleCount && (
              <button type="button" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                style={{ width: '100%', marginTop: 12, padding: '10px', background: '#fff', color: 'var(--brand)', border: '1.5px solid var(--border-brand)', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {isAr
                  ? `عرض المزيد (${(filtered.length - visibleCount).toLocaleString('en-US')} متبقّية)`
                  : `Show more (${(filtered.length - visibleCount).toLocaleString('en-US')} remaining)`}
              </button>
            )}
          </>
        )}
      </main>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" />
      </div>
    </div>
  )
}
