'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProcedureBySlug, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'

export default function ProcedureDetailClient() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const proc = getProcedureBySlug(slug)

  if (!proc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
          <h2 style={{ fontSize: 18, color: '#1A1208', marginBottom: 8 }}>المعاملة غير موجودة</h2>
          <button onClick={() => router.push('/procedures')} style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
            عودة للدليل
          </button>
        </div>
      </div>
    )
  }

  const askAI = () => {
    const q = isAr ? proc.chatPrompt_ar : proc.chatPrompt_en
    router.push(`/?q=${encodeURIComponent(q)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '12px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/procedures')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            {isAr ? 'الدليل' : 'Directory'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></span>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Hero card */}
        <div style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 20, padding: '20px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)', border: '1.5px solid rgba(139,26,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A', flexShrink: 0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: 0 }}>
                  {isAr ? proc.title_ar : proc.title_en}
                </h1>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '2px 8px' }}>
                  {getComplexityLabel(proc.complexity, isAr)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#9C8E80', margin: '0 0 10px', lineHeight: 1.6 }}>
                {isAr ? proc.description_ar : proc.description_en}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
                  {isAr ? proc.category_ar : proc.category_en}
                </span>
                {proc.estimatedDuration_ar && (
                  <span style={{ fontSize: 10.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>
                    {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                  </span>
                )}
                {proc.lastReviewed && (
                  <span style={{ fontSize: 10.5, color: '#9C8E80', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {isAr ? `آخر مراجعة: ${proc.lastReviewed}` : `Last reviewed: ${proc.lastReviewed}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={askAI} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139,26,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '12px 16px', background: '#fff', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            {isAr ? 'المعالج' : 'Wizard'}
          </button>
        </div>

        {/* Playbook link */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => router.push(`/procedures/${slug}/playbook`)} style={{ width: '100%', padding: '11px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            {isAr ? 'دليل التنفيذ — خارطة الإجراء' : 'Playbook — Procedure Map'}
          </button>
        </div>

        {/* Required Documents */}
        {proc.requiredDocuments.length > 0 && (
          <Section title={isAr ? 'المستندات المطلوبة' : 'Required Documents'} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>} bg="#F0FDF4" border="#BBF7D0">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#15803D', marginTop: 3, flexShrink: 0, display: 'inline-flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1208' }}>{isAr ? doc.name_ar : doc.name_en}</span>
                    {doc.original_required && <span style={{ fontSize: 9.5, color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '0 5px', marginRight: 5 }}>{isAr ? 'أصل' : 'original'}</span>}
                    {doc.copies_required && <span style={{ fontSize: 9.5, color: '#6B7280' }}> ×{doc.copies_required}</span>}
                    {(isAr ? doc.notes_ar : doc.notes_en) && <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>{isAr ? doc.notes_ar : doc.notes_en}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Steps */}
        {proc.steps.length > 0 && (
          <Section title={isAr ? 'الخطوات' : 'Steps'} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>} bg="#FFF7ED" border="#FED7AA">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {proc.steps.map((step) => (
                <div key={step.step} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {step.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>{isAr ? step.title_ar : step.title_en}</p>
                    {(isAr ? step.description_ar : step.description_en) && (
                      <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{isAr ? step.description_ar : step.description_en}</p>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {step.authority && <span style={{ fontSize: 10, color: '#6D28D9', background: '#F5F3FF', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>{step.authority}</span>}
                      {step.duration && <span style={{ fontSize: 10, color: '#B45309', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{step.duration}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Authority */}
        {proc.authority && (
          <Section title={isAr ? 'الجهة المختصة' : 'Responsible Authority'} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} bg="#F5F3FF" border="#DDD6FE">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', margin: 0 }}>{isAr ? proc.authority.name_ar : proc.authority.name_en}</p>
              {proc.authority.ministry_ar && <p style={{ fontSize: 12, color: '#6D28D9', margin: 0 }}>{isAr ? proc.authority.ministry_ar : proc.authority.ministry_en}</p>}
              {proc.authority.address_ar && <p style={{ fontSize: 12, color: '#6B7280', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{isAr ? proc.authority.address_ar : proc.authority.address_en}</p>}
              {proc.authority.phone && <a href={`tel:${proc.authority.phone}`} style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>{proc.authority.phone}</a>}
              {proc.authority.website && <a href={proc.authority.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{proc.authority.website}</a>}
              {proc.authority.workingHours_ar && <p style={{ fontSize: 11, color: '#6B7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{isAr ? proc.authority.workingHours_ar : proc.authority.workingHours_en}</p>}
            </div>
          </Section>
        )}

        {/* Fees */}
        {proc.fees.length > 0 && (
          <Section title={isAr ? 'الرسوم' : 'Fees'} bg="#FAF5FF" border="#E9D5FF">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proc.fees.map((fee, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: i < proc.fees.length - 1 ? '1px solid #E9D5FF' : 'none', paddingBottom: i < proc.fees.length - 1 ? 8 : 0 }}>
                  <span style={{ fontSize: 13, color: '#1A1208' }}>{isAr ? fee.label_ar : fee.label_en}</span>
                  {fee.amount && <span style={{ fontSize: 13, fontWeight: 700, color: '#7E22CE' }}>{fee.amount}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Forms */}
        {proc.forms.length > 0 && (
          <Section title={isAr ? 'النماذج الرسمية' : 'Official Forms'} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} bg="#FEFCE8" border="#FEF08A">
            {proc.forms.map((form, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < proc.forms.length - 1 ? '1px solid #FEF08A' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: 0 }}>{isAr ? form.title_ar : form.title_en}</p>
                  {(isAr ? form.notes_ar : form.notes_en) && <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>{isAr ? form.notes_ar : form.notes_en}</p>}
                </div>
                {form.url && (
                  <a href={form.url} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 12px', background: '#8B1A1A', color: '#fff', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>{isAr ? 'فتح' : 'Open'}<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></span>
                  </a>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Sources */}
        {proc.sources.length > 0 && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#FAFAF8', border: '1px solid #F0EBE0', borderRadius: 12 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9C8E80', margin: '0 0 6px' }}>
              {isAr ? 'المصادر الرسمية:' : 'Official Sources:'}
            </p>
            {proc.sources.map((src, i) => (
              <div key={i}>
                {src.url ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#8B1A1A', display: 'block' }}>{src.title}</a>
                ) : (
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{src.title}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon, children, bg, border }: { title: string; icon?: React.ReactNode; children: React.ReactNode; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  )
}
