'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProcedureBySlug, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import BottomNav from '@/components/BottomNav'
import { useLanguage } from '@/lib/LanguageContext'

export default function ProcedureDetailClient() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const { isAr, toggleLang } = useLanguage()

  const proc = getProcedureBySlug(slug)

  if (!proc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
          <h2 style={{ fontSize: 18, color: '#191713', marginBottom: 8 }}>{isAr ? 'المعاملة غير موجودة' : 'Procedure not found'}</h2>
          <button type="button" aria-label={isAr ? 'العودة للمعاملات' : 'Back to procedures'} onClick={() => router.push('/procedures')} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, boxShadow: '0 2px 8px rgba(143,29,44,0.25)' }}>
            {isAr ? 'عودة للدليل' : 'Back to directory'}
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
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #E6E2DC; } @keyframes pdcHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <header style={{ background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 24px rgba(80,10,10,0.3)', animation: 'pdcHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" aria-label={isAr ? 'العودة للمعاملات' : 'Back to procedures'} onClick={() => router.push('/procedures')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display:'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            {isAr ? 'الدليل' : 'Directory'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></span>
          <button type="button" onClick={toggleLang} aria-label={isAr ? 'تغيير اللغة' : 'Switch language'} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        <div style={{ background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 20, padding: '20px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #F8EDEF 0%, #FDE8E8 100%)', border: '1.5px solid rgba(143,29,44,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F1D2C', flexShrink: 0 }}>
              <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: '#191713', margin: 0 }}>
                  {isAr ? proc.title_ar : proc.title_en}
                </h1>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '2px 8px' }}>
                  {getComplexityLabel(proc.complexity, isAr)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#918B82', margin: '0 0 10px', lineHeight: 1.6 }}>
                {isAr ? proc.description_ar : proc.description_en}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, color: '#69645C', background: '#E6E2DC', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
                  {isAr ? proc.category_ar : proc.category_en}
                </span>
                {proc.estimatedDuration_ar && (
                  <span style={{ fontSize: 10.5, color: '#69645C', background: '#E6E2DC', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>
                    {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                  </span>
                )}
                {proc.lastReviewed && (
                  <span style={{ fontSize: 10.5, color: '#918B82', background: '#E6E2DC', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {isAr ? `آخر مراجعة: ${proc.lastReviewed}` : `Last reviewed: ${proc.lastReviewed}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button type="button" aria-label={isAr ? 'اسأل دليلك عن هذه المعاملة' : 'Ask Dalilak about this procedure'} onClick={askAI} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(143,29,44,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
          <button type="button" onClick={() => router.push('/')} style={{ padding: '12px 16px', background: '#fff', color: '#8F1D2C', border: '1.5px solid #8F1D2C', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            {isAr ? 'المعالج' : 'Wizard'}
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button type="button" onClick={() => router.push(`/procedures/${slug}/playbook`)} style={{ width: '100%', padding: '11px 16px', background: '#FAFAF8', color: '#2D1B0E', border: '1.5px solid #D5CEC4', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            {isAr ? 'دليل التنفيذ — خارطة الإجراء' : 'Playbook — Procedure Map'}
          </button>
        </div>

        {proc.requiredDocuments.length > 0 && (
          <Section title={isAr ? `المستندات المطلوبة (${proc.requiredDocuments.length})` : `Required Documents (${proc.requiredDocuments.length})`} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>} bg="#F8EDEF" border="rgba(143,29,44,0.15)">
            <div style={{ borderRadius: 9, border: '1px solid rgba(143,29,44,0.12)', overflow: 'hidden' }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 12px',
                  background: i % 2 === 0 ? '#fff' : '#FEF7F7',
                  borderBottom: i < proc.requiredDocuments.length - 1 ? '1px solid rgba(143,29,44,0.08)' : 'none',
                }}>
                  <span style={{ color: '#8F1D2C', flexShrink: 0, marginTop: 5 }}>
                    <svg aria-hidden="true" width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="#8F1D2C" opacity="0.7"/></svg>
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#191713', lineHeight: 1.5 }}>{isAr ? doc.name_ar : doc.name_en}</span>
                    <span style={{ display: 'inline-flex', gap: 4, marginRight: 6, verticalAlign: 'middle' }}>
                      {doc.original_required && <span style={{ fontSize: 9.5, color: '#8F1D2C', background: 'rgba(143,29,44,0.08)', border: '1px solid rgba(143,29,44,0.15)', borderRadius: 6, padding: '0 5px' }}>{isAr ? 'أصل' : 'orig'}</span>}
                      {doc.copies_required && <span style={{ fontSize: 9.5, color: '#69645C', background: '#E6E2DC', borderRadius: 6, padding: '0 5px' }}>×{doc.copies_required}</span>}
                    </span>
                    {(isAr ? doc.notes_ar : doc.notes_en) && <p style={{ fontSize: 11, color: '#918B82', margin: '2px 0 0', lineHeight: 1.4 }}>{isAr ? doc.notes_ar : doc.notes_en}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {proc.steps.length > 0 && (
          <Section title={isAr ? `خطوات الإجراء (${proc.steps.length})` : `Steps (${proc.steps.length})`} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>} bg="#fff" border="#E6E2DC">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {proc.steps.map((step, idx) => {
                const isLastStep = idx === proc.steps.length - 1
                return (
                  <div key={step.step} style={{ display: 'flex', gap: 12, paddingBottom: isLastStep ? 0 : 14, alignItems: 'stretch' }}>
                    {/* Number + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(143,29,44,0.25)' }}>
                        {step.step}
                      </div>
                      {!isLastStep && <div style={{ width: 1.5, flex: 1, background: 'rgba(143,29,44,0.15)', marginTop: 4, borderRadius: 1 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: 3, paddingBottom: isLastStep ? 0 : 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#191713', margin: '0 0 3px', lineHeight: 1.4 }}>{isAr ? step.title_ar : step.title_en}</p>
                      {(isAr ? step.description_ar : step.description_en) && (
                        <p style={{ fontSize: 11.5, color: '#69645C', margin: '0 0 5px', lineHeight: 1.55 }}>{isAr ? step.description_ar : step.description_en}</p>
                      )}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {step.authority && <span style={{ fontSize: 10, color: '#69645C', background: '#E6E2DC', borderRadius: 6, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>{step.authority}</span>}
                        {step.duration && <span style={{ fontSize: 10, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{step.duration}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {proc.authority && (
          <Section title={isAr ? 'الجهة المختصة' : 'Responsible Authority'} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} bg="#FAFAF8" border="#E6E2DC">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#191713', margin: '0 0 2px' }}>
                {isAr ? proc.authority.name_ar : proc.authority.name_en}
              </p>
              {proc.authority.website && (
                <a href={proc.authority.website} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#8F1D2C', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  {isAr ? 'الموقع الرسمي' : 'Official Website'}
                </a>
              )}
            </div>
          </Section>
        )}

        {proc.fees && proc.fees.length > 0 && (
          <Section title={isAr ? 'الرسوم' : 'Fees'} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} bg="#FFFBEB" border="#FDE68A">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proc.fees.map((fee, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: '#191713', fontWeight: 500 }}>{isAr ? fee.label_ar : fee.label_en}</span>
                  <span style={{ fontSize: 13, color: '#B45309', fontWeight: 700 }}>{isAr ? fee.amount : (fee.amount_en || fee.amount)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <div style={{ marginTop: 4, padding: '16px', background: 'linear-gradient(135deg, #F8EDEF 0%, #FDE8E8 100%)', border: '1.5px solid rgba(143,29,44,0.15)', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12.5, color: '#69645C', margin: '0 0 12px', lineHeight: 1.5 }}>
            {isAr ? 'لديك سؤال محدد حول هذه المعاملة؟' : 'Have a specific question about this procedure?'}
          </p>
          <button type="button" onClick={askAI} style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, boxShadow: '0 3px 12px rgba(143,29,44,0.3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
        </div>

      </div>
      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="procedures" onHomeClick={() => router.push('/')} /></div>
    </div>
  )
}

function Section({
  title, icon, bg, border, children,
}: {
  title: string
  icon: React.ReactNode
  bg: string
  border: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 16, background: bg, border: `1.5px solid ${border}`, borderRadius: 16, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{ color: '#8F1D2C', display: 'inline-flex' }}>{icon}</span>
        <h3 style={{ fontSize: 12.5, fontWeight: 800, color: '#191713', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}
