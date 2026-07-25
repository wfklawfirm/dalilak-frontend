'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProcedureBySlug, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'
import BottomNav from '@/components/BottomNav'
import SectionCollapseToggle from '@/components/SectionCollapseToggle'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useLanguage } from '@/lib/LanguageContext'

export default function ProcedureDetailClient() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const { isAr } = useLanguage()

  const proc = getProcedureBySlug(slug)

  if (!proc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg></div>
          {/* h1, not h2 — this state is the entire page content, so it needs
              its own top-level heading (WCAG 2.2 AA heading-hierarchy audit,
              UX_AUDIT.md). Tag change only, same visual size via inline style. */}
          <h1 style={{ fontSize: 18, color: '#191713', marginBottom: 8, fontWeight: 700 }}>{isAr ? 'المعاملة غير موجودة' : 'Procedure not found'}</h1>
          <button type="button" aria-label={isAr ? 'العودة للمعاملات' : 'Back to procedures'} onClick={() => router.push('/procedures')} className="btn-primary" style={{ padding: '10px 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
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

      {/* Header — v4.0: flat surface header matching /procedures and the
          homepage (was a gradient banner with translucent white chrome +
          an inline language toggle, now reachable via MobileMenu). */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: 'var(--header-padding)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 'var(--container-md)', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" aria-label={isAr ? 'العودة للمعاملات' : 'Back to procedures'} onClick={() => router.push('/procedures')}
            style={{ background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text-1)', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display:'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAr ? proc.title_ar : proc.title_en}
          </span>
        </div>
      </header>

      <main id="main-content" style={{ maxWidth: 'var(--container-md)', margin: '0 auto', padding: '16px 14px var(--bottom-nav-clearance)' }}>

        <Breadcrumbs items={[
          { label_ar: 'الرئيسية', label_en: 'Home', href: '/' },
          { label_ar: 'الإجراءات', label_en: 'Procedures', href: '/procedures' },
          { label_ar: proc.title_ar, label_en: proc.title_en },
        ]} />

        {/* Hero card — v4.0: flat surface, no shadow/gradient icon tile.
            Title is no longer duplicated here as an <h1> since the sticky
            header now shows it (avoids two h1-weight titles stacked). */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
              <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  {isAr ? proc.title_ar : proc.title_en}
                </h1>
                <span style={{ fontSize: 11, fontWeight: 600, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '2px 8px' }}>
                  {getComplexityLabel(proc.complexity, isAr)}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '0 0 10px', lineHeight: 1.6 }}>
                {isAr ? proc.description_ar : proc.description_en}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
                  {isAr ? proc.category_ar : proc.category_en}
                </span>
                {proc.estimatedDuration_ar && (
                  <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>
                    {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                  </span>
                )}
                {proc.lastReviewed && (
                  <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 8, padding: '2px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {isAr ? `آخر مراجعة: ${proc.lastReviewed}` : `Last reviewed: ${proc.lastReviewed}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* One primary CTA + one secondary, per spec ("one primary button"). */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button type="button" aria-label={isAr ? 'اسأل دليلك عن هذه المعاملة' : 'Ask Dalilak about this procedure'} onClick={askAI} className="btn-primary" style={{ flex: 1, padding: '12px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
          {/* batch #352 clarity fix: this button's onClick always navigated to '/' (homepage),
              but was labeled "المعالج"/"Wizard" — implying it launches a guided wizard for this
              specific procedure, which it never did. Relabeled to match its real behavior
              instead of silently leaving a misleading control; no wizard-deep-link route exists
              yet to make the old label true (GuidedFlow is a homepage-only modal with no
              per-procedure entry point), so honest relabeling is the correct minimal fix here. */}
          <button type="button" aria-label={isAr ? 'العودة إلى الصفحة الرئيسية' : 'Back to homepage'} onClick={() => router.push('/')} style={{ padding: '12px 16px', background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button type="button" onClick={() => router.push(`/procedures/${slug}/playbook`)} style={{ width: '100%', padding: '11px 16px', background: 'var(--surface)', color: 'var(--text-1)', border: '1px solid var(--border)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            {isAr ? 'دليل التنفيذ — خارطة الإجراء' : 'Playbook — Procedure Map'}
          </button>
        </div>

        {proc.requiredDocuments.length > 0 && (
          <Section title={isAr ? `المستندات المطلوبة (${proc.requiredDocuments.length})` : `Required Documents (${proc.requiredDocuments.length})`} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>} bg="var(--surface)" border="var(--border)">
            <div style={{ borderRadius: 9, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 12px',
                  background: 'var(--surface)',
                  borderBottom: i < proc.requiredDocuments.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 5 }}>
                    <svg aria-hidden="true" width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="currentColor"/></svg>
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.5 }}>{isAr ? doc.name_ar : doc.name_en}</span>
                    <span style={{ display: 'inline-flex', gap: 4, marginRight: 6, verticalAlign: 'middle' }}>
                      {doc.original_required && <span style={{ fontSize: 10, color: 'var(--brand)', background: 'var(--brand-soft)', borderRadius: 6, padding: '0 5px' }}>{isAr ? 'أصل' : 'orig'}</span>}
                      {doc.copies_required && <span style={{ fontSize: 10, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 6, padding: '0 5px' }}>×{doc.copies_required}</span>}
                    </span>
                    {(isAr ? doc.notes_ar : doc.notes_en) && <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '2px 0 0', lineHeight: 1.4 }}>{isAr ? doc.notes_ar : doc.notes_en}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {proc.steps.length > 0 && (
          <Section title={isAr ? `خطوات الإجراء (${proc.steps.length})` : `Steps (${proc.steps.length})`} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>} bg="var(--surface)" border="var(--border)">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {proc.steps.map((step, idx) => {
                const isLastStep = idx === proc.steps.length - 1
                return (
                  <div key={step.step} style={{ display: 'flex', gap: 12, paddingBottom: isLastStep ? 0 : 14, alignItems: 'stretch' }}>
                    {/* Number + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {step.step}
                      </div>
                      {!isLastStep && <div style={{ width: 1.5, flex: 1, background: 'var(--border)', marginTop: 4, borderRadius: 1 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: 3, paddingBottom: isLastStep ? 0 : 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 3px', lineHeight: 1.4 }}>{isAr ? step.title_ar : step.title_en}</p>
                      {(isAr ? step.description_ar : step.description_en) && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: '0 0 5px', lineHeight: 1.55 }}>{isAr ? step.description_ar : step.description_en}</p>
                      )}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {step.authority && <span style={{ fontSize: 10, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 6, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>{step.authority}</span>}
                        {step.duration && <span style={{ fontSize: 10, color: 'var(--text-2)', background: 'var(--bg)', borderRadius: 6, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{step.duration}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        <div style={{ marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px' }}>
            <SectionCollapseToggle
              titleAr="تفاصيل إضافية — الجهة والرسوم والمزيد"
              titleEn="More details — authority, fees & more"
              icon="ℹ️"
              defaultOpen={false}
              storageKey={`dalilak_pdc_more_${slug}`}
            >
              <div style={{ paddingTop: 8 }}>
                {proc.authority && (
                  <Section title={isAr ? 'الجهة المختصة' : 'Responsible Authority'} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} bg="var(--surface)" border="var(--border)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 2px' }}>
                        {isAr ? proc.authority.name_ar : proc.authority.name_en}
                      </p>
                      {proc.authority.website && (
                        <a href={proc.authority.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          {isAr ? 'الموقع الرسمي' : 'Official Website'}
                        </a>
                      )}
                    </div>
                  </Section>
                )}

                {proc.fees && proc.fees.length > 0 && (
                  <Section title={isAr ? 'الرسوم' : 'Fees'} icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} bg="var(--surface)" border="var(--border)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {proc.fees.map((fee, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 500 }}>{isAr ? fee.label_ar : fee.label_en}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>{isAr ? fee.amount : (fee.amount_en || fee.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                <div style={{ marginTop: 4, padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center' }}>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {isAr ? 'لديك سؤال محدد حول هذه المعاملة؟' : 'Have a specific question about this procedure?'}
                  </p>
                  <button type="button" onClick={askAI} className="btn-primary" style={{ padding: '11px 24px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                    {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                  </button>
                </div>
              </div>
            </SectionCollapseToggle>
        </div>

      </main>
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
    <div style={{ marginBottom: 16, background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{ color: 'var(--brand)', display: 'inline-flex' }}>{icon}</span>
        {/* h2, not h3 — these are the page's primary content sections
            (Documents/Steps/Authority/Fees), sitting directly under the
            page's single h1 with nothing in between (WCAG heading-hierarchy
            audit, UX_AUDIT.md). Tag change only, same visual size via
            inline style. */}
        <h2 style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
