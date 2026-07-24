'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { FormItem } from '@/lib/types'
import { getProcedureBySlug } from '@/lib/procedures'
import BottomNav from '@/components/BottomNav'
import { useLanguage } from '@/lib/LanguageContext'
import { useFlowchart } from '@/lib/useFlowchart'
import { useFlowchartProgress } from '@/lib/useFlowchartProgress'
import ProcedureFlowchartComponent from '@/components/ProcedureFlowchart'
import SaveToMyFilesButton from '@/components/SaveToMyFilesButton'
import SectionCollapseToggle from '@/components/SectionCollapseToggle'

interface Props {
  form: FormItem
}

const BRAND = '#8F1D2C'

export default function FormDetailClient({ form }: Props) {
  const router = useRouter()
  const { isAr } = useLanguage()

  const title    = isAr ? form.title_ar    : form.title_en
  const authority = isAr ? form.authority_ar : form.authority_en
  const ministry  = isAr ? form.ministry_ar  : form.ministry_en
  const category  = isAr ? form.category_ar  : form.category_en
  const dir       = isAr ? 'rtl' : 'ltr'

  const fileIcon: React.ReactNode = form.fileType === 'pdf'
    ? <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    : form.fileType === 'word'
    ? <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    : <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>

  const relatedProcedures = (form.relatedProcedures ?? [])
    .map(slug => getProcedureBySlug(slug))
    .filter(Boolean)

  const flowchartSource = useMemo(() => ({
    slug: `form-${form.slug}`,
    titleAr: form.title_ar,
    titleEn: form.title_en,
    category: isAr ? form.category_ar : form.category_en,
    authority: isAr ? (form.authority_ar || form.ministry_ar) : (form.authority_en || form.ministry_en),
  }), [form, isAr])
  const { flowchart: formFlowchart, loading: fcLoading, error: fcError, generate: generateFc } = useFlowchart(flowchartSource, false)
  const formProgress = useFlowchartProgress(flowchartSource.slug)

  const handleDownload = () => {
    if (form.url) window.open(form.url, '_blank', 'noopener,noreferrer')
  }

  const handleAskAI = () => {
    const prompt = isAr ? form.chatPrompt_ar : form.chatPrompt_en
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dalilak_prefill', prompt)
    }
    router.push('/')
  }

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: isAr ? "'Cairo',sans-serif" : "'Inter',sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #E6E2DC; border-radius: 3px; } @keyframes fdcHeaderIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <header style={{
        background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(80,10,10,0.3)',
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 50,
        animation: 'fdcHeaderIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label={isAr ? 'رجوع' : 'Back'}
            onClick={() => router.back()}
            onTouchStart={e => (e.currentTarget.style.opacity = '0.7')}
            onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', flexShrink: 0 }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 1 }}>{category}</div>
              <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
            </div>
          </div>
          {form.type === 'official' && (
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              {isAr ? 'رسمي' : 'Official'}
            </span>
          )}
        </div>
      </header>

      <main id="main-content" style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #E6E2DC', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ display: 'flex', flexShrink: 0 }}>{fileIcon}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#191713' }}>{title}</h2>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: '#69645C' }}>{authority}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#918B82' }}>{ministry}</p>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#E6E2DC', color: BRAND, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
              {form.fileType?.toUpperCase() ?? 'LINK'}
            </span>
            <span style={{ background: '#FFFBEB', color: '#78350F', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
              {form.type === 'official' ? (isAr ? 'نموذج رسمي' : 'Official Form') : isAr ? 'مسودة' : 'Draft'}
            </span>
            {form.lastReviewed && (
              <span style={{ background: '#E6E2DC', color: '#69645C', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {isAr ? `آخر مراجعة: ${form.lastReviewed}` : `Last reviewed: ${form.lastReviewed}`}
              </span>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {form.url && (
              <button
                type="button"
                onClick={handleDownload}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(143,29,44,0.2)' }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(143,29,44,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(143,29,44,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(143,29,44,0.35)' }}
                style={{ background: 'linear-gradient(135deg, #8F1D2C 0%, #741622 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s cubic-bezier(0.22,1,0.36,1)', boxShadow: '0 4px 14px rgba(143,29,44,0.35)' }}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                {isAr ? 'فتح النموذج' : 'Open Form'}
              </button>
            )}
            <button
              type="button"
              onClick={handleAskAI}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
              style={{ background: '#fff', color: BRAND, border: `1.5px solid ${BRAND}`, borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'transform 0.1s' }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
              {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 0, background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 18, padding: '12px 16px' }}>
          <SectionCollapseToggle
            titleAr="تفاصيل إضافية — طريقة الاستخدام وخارطة الإجراء"
            titleEn="More details — how to use & procedure map"
            icon="📄"
            defaultOpen={false}
            storageKey={`dalilak_fdc_more_${form.slug}`}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#191713', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                  {isAr ? 'كيفية استخدام هذا النموذج' : 'How to use this form'}
                </h3>
                {(() => {
                  const steps = isAr
                    ? ['افتح النموذج أو نزّله بالضغط على الزر أعلاه.', 'اقرأ التعليمات بعناية قبل التعبئة.', 'تأكد من صحة جميع المعلومات المُدخلة.', 'قدّم النموذج للجهة المعنية مع الوثائق المطلوبة.']
                    : ['Open or download the form using the button above.', 'Read instructions carefully before filling.', 'Verify all entered information is correct.', 'Submit the form to the relevant authority with required documents.']
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                              color: '#fff', fontSize: 12, fontWeight: 800,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 1px 4px rgba(143,29,44,0.25)',
                              flexShrink: 0,
                            }}>{i + 1}</div>
                            {i < steps.length - 1 && (
                              <div style={{ width: 2, flex: 1, minHeight: 16, background: 'linear-gradient(to bottom, rgba(143,29,44,0.4), rgba(143,29,44,0.05))', marginTop: 3 }} />
                            )}
                          </div>
                          <p style={{ fontSize: 13.5, color: '#191713', margin: '4px 0', paddingBottom: i < steps.length - 1 ? 14 : 0, lineHeight: 1.6, flex: 1 }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              <div>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#191713', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  {isAr ? 'خارطة الإجراء' : 'Procedure Map'}
                </h3>
                {formFlowchart ? (
                  <>
                    <ProcedureFlowchartComponent
                      flowchart={formFlowchart}
                      isAr={isAr}
                      compact
                      completedNodeIds={formProgress.completedNodes}
                      onToggleNode={formProgress.toggleNode}
                    />
                    <SaveToMyFilesButton slug={flowchartSource.slug} titleAr={form.title_ar} flowchart={formFlowchart} isAr={isAr} compact />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={generateFc}
                    disabled={fcLoading}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 14px', borderRadius: 12, background: fcLoading ? '#F5F0EA' : '#F8EDEF',
                      border: '1.5px dashed rgba(143,29,44,0.3)', color: '#8F1D2C', fontSize: 12.5, fontWeight: 700,
                      cursor: fcLoading ? 'default' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {fcLoading ? (
                      <>
                        <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(143,29,44,0.25)', borderTopColor: '#8F1D2C', animation: 'fdcFcSpin 0.8s linear infinite', display: 'inline-block' }} />
                        {isAr ? 'جارٍ توليد الخارطة بالذكاء الاصطناعي...' : 'Generating AI map...'}
                      </>
                    ) : (
                      <>
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        {isAr ? 'توليد خارطة الإجراء بالذكاء الاصطناعي' : 'Generate AI procedure map'}
                      </>
                    )}
                  </button>
                )}
                {fcError && (
                  <p style={{ fontSize: 10.5, color: '#8F1D2C', margin: '6px 0 0' }}>
                    {isAr ? 'تعذّر التوليد — ' : 'Generation failed — '}
                    <button type="button" onClick={generateFc} style={{ background: 'none', border: 'none', color: '#8F1D2C', textDecoration: 'underline', cursor: 'pointer', fontSize: 10.5, padding: 0, fontFamily: 'inherit' }}>
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  </p>
                )}
                <style>{`@keyframes fdcFcSpin { to { transform: rotate(360deg); } }`}</style>
              </div>

              {relatedProcedures.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#191713', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    {isAr ? 'معاملات ذات صلة' : 'Related Procedures'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {relatedProcedures.map(p => p && (
                      <button
                        type="button"
                        key={p.slug}
                        onClick={() => router.push(`/procedures/${p.slug}`)}
                        onTouchStart={e => (e.currentTarget.style.background = '#F0EBE0')}
                        onTouchEnd={e => (e.currentTarget.style.background = '#FAFAF8')}
                        style={{ background: '#FAFAF8', border: '1px solid #E6E2DC', borderRadius: 12, padding: '12px 14px', textAlign: isAr ? 'right' : 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}>
                        <span style={{ display: 'flex', flexShrink: 0 }}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></span>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#191713' }}>{isAr ? p.title_ar : p.title_en}</p>
                          <p style={{ margin: 0, fontSize: 12, color: '#918B82' }}>{isAr ? p.category_ar : p.category_en}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </SectionCollapseToggle>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '12px 16px' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#78350F', lineHeight: 1.7, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            {isAr
              ? 'هذه المعلومات للإرشاد فقط. تأكد دائماً من النموذج الحالي من الجهة الرسمية المختصة قبل الاستخدام.'
              : 'This information is for guidance only. Always confirm the current form with the competent official authority before use.'}
          </p>
        </div>

      </main>

      <div className="bottom-nav-wrapper">
        <BottomNav isAr={isAr} activeTab="procedures" onHomeClick={() => router.push('/')} />
      </div>
    </div>
  )
}
