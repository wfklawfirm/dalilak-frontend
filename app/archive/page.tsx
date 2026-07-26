'use client'

/**
 * /archive — أرشيف الوثائق الرسمية
 *
 * صفحة بحث/تصفح لأكثر من 5200 وثيقة حكومية لبنانية حقيقية (قرارات مصرف
 * لبنان، تعاميم جمركية، قرارات وزارية، تقارير رسمية، محاضر، نماذج طلبات)
 * مستخرجة من أرشيف فعلي وليست بيانات تجريبية. كل سجل مرتبط بملف PDF/XLSX
 * أصلي قابل للتحميل (مستضاف على مستودع GitHub منفصل — راجع
 * lib/archiveDocuments.ts للتفاصيل).
 *
 * يتبع نفس نمط /forms و/procedures (MobileHeader + SearchInput + StatsRow
 * + بطاقات) بدل بناء تصميم منفصل، حفاظاً على الاتساق البصري لـ"Calm
 * Government Digital Service".
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MobileHeader from '@/components/MobileHeader'
import SearchInput from '@/components/SearchInput'
import StatsRow from '@/components/StatsRow'
import ArchiveAISearch from '@/components/ArchiveAISearch'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { ArchiveDoc } from '@/lib/archiveDocuments'
import { useLanguage } from '@/lib/LanguageContext'
import { isLoggedIn } from '@/lib/auth'

const PAGE_SIZE = 60

// batch #521 (Big Track 3): lib/archiveDocuments.ts embeds the full 5,234-doc
// archive as an inline JSON string (~3.9MB parsed) -- a *static* top-level
// import of ARCHIVE_DOCS here (as this file used to have) bundles that whole
// payload into /archive's initial client JS, which Big Track 2's real
// Resource Timing measurement confirmed as this app's single heaviest page
// (4.75MB decoded JS). app/page.tsx and app/procedures/page.tsx already avoid
// this via `await import('@/lib/archiveDocuments')` after mount instead of a
// static import (see their own batch #497/#504 comments) -- same fix applied
// here. Only the TYPE import above is static: TS type-only imports are
// erased entirely at compile time and carry zero runtime/bundle cost.
interface ArchiveLoaded {
  docs: ArchiveDoc[]
  institutions: string[]
  categories: string[]
  categoryLabels: Record<string, { ar: string; en: string }>
}

export default function ArchivePage() {
  const router = useRouter()
  const { isAr, toggleLang } = useLanguage()
  const [archive, setArchive] = useState<ArchiveLoaded | null>(null)
  useEffect(() => {
    let cancelled = false
    import('@/lib/archiveDocuments').then(m => {
      if (cancelled) return
      setArchive({
        docs: m.ARCHIVE_DOCS,
        institutions: m.ARCHIVE_INSTITUTIONS,
        categories: m.ARCHIVE_CATEGORIES,
        categoryLabels: m.ARCHIVE_CATEGORY_LABELS,
      })
    })
    return () => { cancelled = true }
  }, [])
  const docs = archive?.docs ?? []
  const institutions = archive?.institutions ?? []
  const categories = archive?.categories ?? []
  const categoryLabels = archive?.categoryLabels ?? {}
  const [search, setSearch] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('all')
  // batch #505: بطلب المستخدم "قم بتصنيفها" — كل وثيقة الآن مصنَّفة فعلياً
  // (عبر AI) ضمن 10 أنواع ثابتة (قانون/مرسوم/قرار/تعميم/نموذج/تقرير/بيان/
  // دراسة/اتفاقية/أخرى). فلتر ثانوي اختياري بجانب فلتر الجهة الموجود أصلاً،
  // بنفس أسلوب الشرائح (chips) المُتَّبع في /procedures (ministryFilter).
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // البحث بالذكاء الاصطناعي هو الوضع الأساسي بطلب المستخدم ("اجعل البحث عبر
  // الذكاء الاصطناعي و ليس محرك بحث عادة") — لكنه يتطلب تسجيل دخول (نفس شرط
  // /chat/stream)، فلا نفتح الصفحة بجدار تسجيل دخول أمام زائر لم يسبق له
  // استخدام بحث نصي بلا حساب: الزوار غير المسجّلين يبدؤون بالبحث السريع
  // (يحافظ على الوظيفة الموجودة أصلاً بلا أي قيد جديد)، والمسجّلون يبدؤون
  // مباشرة بالبحث الذكي.
  const [searchMode, setSearchMode] = useState<'ai' | 'quick'>(() => (isLoggedIn() ? 'ai' : 'quick'))

  const topInstitutions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of docs) counts.set(d.institution, (counts.get(d.institution) || 0) + 1)
    return institutions
      .slice()
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
      .slice(0, 14)
  }, [docs, institutions])

  // batch #505: توزيع الفئات الفعلي عبر كل الأرشيف — تُعرَض الشرائح مرتّبة
  // حسب العدد (الأكثر أولاً)، فقط للفئات التي لها وثيقة واحدة على الأقل.
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of docs) counts.set(d.category, (counts.get(d.category) || 0) + 1)
    return counts
  }, [docs])
  const topCategories = useMemo(
    () => categories.filter(c => (categoryCounts.get(c) || 0) > 0),
    [categories, categoryCounts]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return docs.filter(d => {
      if (institutionFilter !== 'all' && d.institution !== institutionFilter) return false
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
      if (!q) return true
      return (
        d.displayTitle.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.snippet.toLowerCase().includes(q) ||
        d.institutionAr.toLowerCase().includes(q) ||
        d.institution.toLowerCase().includes(q) ||
        (d.year ? String(d.year).includes(q) : false)
      )
    })
  }, [docs, search, institutionFilter, categoryFilter])

  const askAI = (prompt: string) => router.push(`/?q=${encodeURIComponent(prompt)}`)

  const institutionLabel = (d: ArchiveDoc) => isAr ? d.institutionAr : d.institution

  // batch #521: archive data (docs) loads async (see effect above) -- until
  // it resolves, show the same header/bottom-nav shell with a spinner
  // instead of the real content, rather than briefly rendering a misleading
  // "0 documents / no results" empty state with docs defaulted to [].
  if (!archive) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
        <MobileHeader
          titleAr="أرشيف الوثائق الرسمية" titleEn="Official Documents Archive"
          isAr={isAr} onBack={() => router.push('/')} toggleLang={toggleLang}
        />
        <main id="main-content" style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '60px 14px' }}>
          <LoadingSpinner isAr={isAr} />
        </main>
        <div className="bottom-nav-wrapper">
          <BottomNav isAr={isAr} activeTab="procedures" />
        </div>
      </div>
    )
  }

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
            { value: docs.length.toLocaleString('en-US'), label: isAr ? 'وثيقة موثّقة' : 'Documents' },
            { value: String(institutions.length), label: isAr ? 'جهة رسمية' : 'Institutions' },
            { value: '1950–2026', label: isAr ? 'المدى الزمني' : 'Time span' },
          ]}
        />

        <div style={{ display: 'flex', gap: 5, margin: '0 0 10px' }}>
          <button type="button" aria-pressed={searchMode === 'ai'} onClick={() => setSearchMode('ai')}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              borderColor: searchMode === 'ai' ? 'var(--brand)' : 'var(--border)',
              background: searchMode === 'ai' ? 'var(--brand-soft)' : '#fff',
              color: searchMode === 'ai' ? 'var(--brand)' : 'var(--text-2)',
            }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.9 4.5L18 9l-4.1 1.5L12 15l-1.9-4.5L6 9l4.1-1.5L12 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M18 15l1 2.5L21.5 18l-2.5 1L18 21.5 17 19l-2.5-1L17 17l1-2z"/></svg>
            {isAr ? 'بحث بالذكاء الاصطناعي' : 'AI search'}
          </button>
          <button type="button" aria-pressed={searchMode === 'quick'} onClick={() => setSearchMode('quick')}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 10, border: '1.5px solid', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              borderColor: searchMode === 'quick' ? 'var(--brand)' : 'var(--border)',
              background: searchMode === 'quick' ? 'var(--brand-soft)' : '#fff',
              color: searchMode === 'quick' ? 'var(--brand)' : 'var(--text-2)',
            }}>
            {isAr ? 'بحث نصي سريع' : 'Quick text search'}
          </button>
        </div>

        {searchMode === 'ai' && (
          <ArchiveAISearch isAr={isAr} docs={docs} onAskFull={askAI} />
        )}

        {searchMode === 'quick' && (
        <>
        <SearchInput
          value={search} onChange={setSearch} isAr={isAr}
          ariaLabel={isAr ? 'ابحث في أرشيف الوثائق الرسمية' : 'Search official documents archive'}
          placeholder={isAr ? `ابحث في ${docs.length.toLocaleString('en-US')} وثيقة...` : `Search ${docs.length.toLocaleString('en-US')} documents...`}
        />

        <div className="archive-filter-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, margin: '10px 0 12px' }}>
          <button type="button" aria-pressed={institutionFilter === 'all'} onClick={() => { setInstitutionFilter('all'); setVisibleCount(PAGE_SIZE) }}
            style={{
              padding: '4px 12px', borderRadius: 999, border: '1.5px solid', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: institutionFilter === 'all' ? 'var(--brand)' : 'var(--border)',
              background: institutionFilter === 'all' ? 'var(--brand-soft)' : '#fff',
              color: institutionFilter === 'all' ? 'var(--brand)' : 'var(--text-2)',
            }}>
            {isAr ? 'الكل' : 'All'} ({docs.length.toLocaleString('en-US')})
          </button>
          {topInstitutions.map(inst => {
            const doc = docs.find(d => d.institution === inst)
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

        {/* batch #505: فلتر التصنيف — ثانوي وأصغر من فلتر الجهة، لتجنّب عجقة
            بصرية (شريطان بنفس الحجم) مع إبقاء التصنيف مرئياً وقابلاً للتصفية. */}
        <div className="archive-filter-row" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4, margin: '0 0 12px' }}>
          <button type="button" aria-pressed={categoryFilter === 'all'} onClick={() => { setCategoryFilter('all'); setVisibleCount(PAGE_SIZE) }}
            style={{
              padding: '3px 10px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              borderColor: categoryFilter === 'all' ? 'var(--text-2)' : 'var(--border)',
              background: categoryFilter === 'all' ? 'var(--bg)' : '#fff',
              color: categoryFilter === 'all' ? 'var(--text-1)' : 'var(--text-3)',
            }}>
            {isAr ? 'كل الأنواع' : 'All types'}
          </button>
          {topCategories.map(cat => {
            const label = categoryLabels[cat] ? (isAr ? categoryLabels[cat].ar : categoryLabels[cat].en) : cat
            return (
              <button type="button" key={cat} aria-pressed={categoryFilter === cat}
                onClick={() => { setCategoryFilter(cat); setVisibleCount(PAGE_SIZE) }}
                style={{
                  padding: '3px 10px', borderRadius: 999, border: '1px solid', whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  borderColor: categoryFilter === cat ? 'var(--text-2)' : 'var(--border)',
                  background: categoryFilter === cat ? 'var(--bg)' : '#fff',
                  color: categoryFilter === cat ? 'var(--text-1)' : 'var(--text-3)',
                }}>
                {label} ({(categoryCounts.get(cat) || 0).toLocaleString('en-US')})
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
                      {/* batch #505: العنوان المُحسَّن بالذكاء الاصطناعي (displayTitle)
                          بدل title الخام — title الأصلي لا يزال محفوظاً للمطابقة
                          الداخلية فقط (findArchiveDocByTitle)، لا للعرض. */}
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 3 }}>{d.displayTitle}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: 10.5, color: 'var(--brand)', fontWeight: 600 }}>{institutionLabel(d)}</span>
                        <span style={{ fontSize: 9.5, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 6, padding: '1px 7px', border: '1px solid var(--border)' }}>
                          {categoryLabels[d.category] ? (isAr ? categoryLabels[d.category].ar : categoryLabels[d.category].en) : d.category}
                        </span>
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
                    <button type="button" onClick={() => askAI(isAr ? `لخّص لي هذه الوثيقة الرسمية: ${d.displayTitle}` : `Summarize this official document: ${d.displayTitle}`)}
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
        </>
        )}
      </main>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" />
      </div>
    </div>
  )
}
