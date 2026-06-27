'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { searchForms } from '@/lib/procedures'
import type { FormItem } from '@/lib/types'

const MINISTRY_FILTERS = [
  { key: 'all', ar: 'الكل', en: 'All' },
  { key: 'general-security', ar: 'الأمن العام', en: 'General Security' },
  { key: 'interior', ar: 'وزارة الداخلية', en: 'Interior' },
  { key: 'justice', ar: 'وزارة العدل', en: 'Justice' },
  { key: 'economy', ar: 'وزارة الاقتصاد', en: 'Economy' },
  { key: 'public-works', ar: 'وزارة الأشغال', en: 'Public Works' },
  { key: 'nssf', ar: 'الضمان الاجتماعي', en: 'NSSF' },
]

const TYPE_FILTERS = [
  { key: 'all', ar: 'الكل', en: 'All' },
  { key: 'official', ar: 'رسمي', en: 'Official' },
  { key: 'draft', ar: 'مسودة', en: 'Draft' },
]

export default function FormsPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [search, setSearch] = useState('')
  const [ministryFilter, setMinistryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const isAr = lang === 'ar'

  const allForms = useMemo(() => searchForms(''), [])

  const filtered = useMemo(() => {
    let forms = search.trim() ? searchForms(search) : allForms
    if (ministryFilter !== 'all') {
      forms = forms.filter(f => {
        const m = (f.ministry_ar + f.ministry_en).toLowerCase()
        if (ministryFilter === 'general-security') return m.includes('أمن عام') || m.includes('general security')
        if (ministryFilter === 'interior') return m.includes('داخلية') || m.includes('interior')
        if (ministryFilter === 'justice') return m.includes('عدل') || m.includes('justice')
        if (ministryFilter === 'economy') return m.includes('اقتصاد') || m.includes('economy')
        if (ministryFilter === 'public-works') return m.includes('أشغال') || m.includes('public works')
        if (ministryFilter === 'nssf') return m.includes('ضمان') || m.includes('nssf')
        return true
      })
    }
    if (typeFilter !== 'all') forms = forms.filter(f => f.type === typeFilter)
    return forms
  }, [search, ministryFilter, typeFilter, allForms])

  const askAI = (form: FormItem) => {
    const q = isAr ? form.chatPrompt_ar : form.chatPrompt_en
    router.push(`/?q=${encodeURIComponent(q)}`)
  }

  const openForm = (form: FormItem) => {
    if (form.url) window.open(form.url, '_blank', 'noopener,noreferrer')
  }

  const fileTypeIcon = (ft: string) => {
    if (ft === 'pdf') return '📄'
    if (ft === 'word') return '📝'
    if (ft === 'link') return '🔗'
    return '📋'
  }

  const typeColor = (t: string) => t === 'official' ? '#15803D' : t === 'draft' ? '#B45309' : '#6B7280'
  const typeBg = (t: string) => t === 'official' ? '#F0FDF4' : t === 'draft' ? '#FFFBEB' : '#F5F5F5'
  const typeLabel = (t: string, ar: boolean) => {
    if (t === 'official') return ar ? 'رسمي' : 'Official'
    if (t === 'draft') return ar ? 'مسودة' : 'Draft'
    return ar ? 'غير محدد' : 'Unknown'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '14px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{isAr ? '📄 مكتبة النماذج' : '📄 Forms Library'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10.5, margin: 0 }}>{isAr ? 'نماذج ووثائق الجهات الرسمية' : 'Official government forms & documents'}</p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'right' : 'left']: 14, color: '#B0A090', fontSize: 15, pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن نموذج...' : 'Search forms...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: isAr ? '12px 42px 12px 36px' : '12px 36px 12px 42px', border: '1.5px solid #EAE4D9', borderRadius: 16, fontSize: 13, background: '#fff', outline: 'none', fontFamily: 'inherit', color: '#1A1208', direction: isAr ? 'rtl' : 'ltr' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isAr ? 'left' : 'right']: 12, background: '#EAE4D9', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, color: '#6B7280' }}>✕</button>
          )}
        </div>

        {/* Ministry filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10, scrollbarWidth: 'none' }}>
          {MINISTRY_FILTERS.map(f => (
            <button key={f.key} onClick={() => setMinistryFilter(f.key)} style={{ padding: '5px 12px', borderRadius: 20, border: '1.5px solid', borderColor: ministryFilter === f.key ? '#8B1A1A' : '#EAE4D9', background: ministryFilter === f.key ? '#8B1A1A' : '#fff', color: ministryFilter === f.key ? '#fff' : '#6B7280', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {isAr ? f.ar : f.en}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TYPE_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)} style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid', borderColor: typeFilter === f.key ? '#B8860B' : '#EAE4D9', background: typeFilter === f.key ? '#B8860B' : '#fff', color: typeFilter === f.key ? '#fff' : '#6B7280', fontSize: 11, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
              {isAr ? f.ar : f.en}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 11, color: '#9C8E80', margin: '0 0 12px' }}>
          {isAr ? `${filtered.length} نموذج` : `${filtered.length} form${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {/* Form cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9C8E80' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <p style={{ fontSize: 14, margin: 0 }}>{isAr ? 'لم يُعثر على نماذج' : 'No forms found'}</p>
            </div>
          ) : filtered.map((form) => (
            <div key={form.slug} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {form.icon}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? form.title_ar : form.title_en}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: typeColor(form.type), background: typeBg(form.type), borderRadius: 6, padding: '1px 6px' }}>{typeLabel(form.type, isAr)}</span>
                    <span style={{ fontSize: 10, color: '#9C8E80' }}>{fileTypeIcon(form.fileType)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 6px' }}>{isAr ? form.authority_ar : form.authority_en} · {isAr ? form.ministry_ar : form.ministry_en}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 6, padding: '1px 7px' }}>📁 {isAr ? form.category_ar : form.category_en}</span>
                    {form.lastReviewed && <span style={{ fontSize: 9.5, color: '#9C8E80', background: '#F5F5F5', borderRadius: 6, padding: '1px 7px' }}>🗓️ {form.lastReviewed}</span>}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #F0EBE0' }}>
                <button onClick={() => askAI(form)} style={{ flex: 1, padding: '8px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                  🤖 {isAr ? 'اسأل AI' : 'Ask AI'}
                </button>
                {form.url && (
                  <button onClick={() => openForm(form)} style={{ flex: 1, padding: '8px', background: '#fff', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: 10, fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                    {isAr ? 'فتح النموذج ↗' : 'Open Form ↗'}
                  </button>
                )}
                {form.relatedProcedures.length > 0 && (
                  <button onClick={() => router.push(`/procedures/${form.relatedProcedures[0]}`)} style={{ padding: '8px 12px', background: '#F5F5F5', color: '#6B7280', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 11, cursor: 'pointer' }}>
                    📋
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
