'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProcedureFlowchartComponent from '@/components/ProcedureFlowchart'
import SaveToMyFilesButton from '@/components/SaveToMyFilesButton'
import { FLOWCHARTS } from '@/lib/flowchartData'
import { useFlowchart } from '@/lib/useFlowchart'
import { useFlowchartProgress } from '@/lib/useFlowchartProgress'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { PageHeader, SectionCard, EmptyState } from '@/components/ui'
import BottomNav from '@/components/BottomNav'
import { useLanguage } from '@/lib/LanguageContext'

export default function PlaybookPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const { isAr, toggleLang } = useLanguage()

  // Find procedure - EnrichedProcedure uses 'code' field as identifier
  const proc = ENRICHED_PROCEDURES.find(p => p.code === slug || p.code.includes(slug.replace(/-/g, '')))

  // مصدر بيانات توليد الخارطة بالذكاء الاصطناعي — يُستخدم فقط إذا لم توجد خارطة مُوثّقة يدوياً لهذا الـ slug
  const flowchartSource = useMemo(() => ({
    slug,
    titleAr: proc?.title || 'إجراء',
    titleEn: proc?.title_en || proc?.title,
    authority: proc?.ministry,
    fees: proc?.fees,
    processingTime: proc?.processingTime,
    requiredDocuments: proc?.requiredDocuments,
    descriptionAr: proc?.description,
    knownSteps: proc?.steps,
  }), [slug, proc])

  const { flowchart: aiFlowchart, loading: fcLoading, error: fcError, isAiGenerated, generate: retryFlowchart } = useFlowchart(flowchartSource, true)

  // خارطة مُوثّقة يدوياً لهذا الـ slug إن وُجدت (أعلى جودة)، وإلا الخارطة المولّدة بالذكاء الاصطناعي
  const activeFlowchart = FLOWCHARTS[slug] || aiFlowchart

  // حفظ واستكمال التقدم — أي خطوات أنجزها المستخدم وأي مستندات جهّزها، محفوظة محلياً حسب الـ slug
  const progress = useFlowchartProgress(slug)

  const langToggle = (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={isAr ? 'تغيير اللغة' : 'Switch language'}
      style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #E6E2DC; }`}</style>

      <PageHeader
        titleAr={`دليل التنفيذ${proc ? `: ${proc.title}` : ''}`}
        titleEn={`Playbook${proc ? `: ${proc.title_en || proc.title}` : ''}`}
        subtitleAr="خطوات تفصيلية لإتمام المعاملة"
        subtitleEn="Step-by-step guide to complete the procedure"
        isAr={isAr}
        onBack={() => router.push(`/procedures/${slug}`)}
        rightSlot={langToggle}
      />

      <div id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 120px' }}>

        {activeFlowchart ? (
          <>
            {/* Overview */}
            <SectionCard
              title={isAr ? 'نظرة عامة' : 'Overview'}
              icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
              bg="#F8EDEF"
              border="rgba(143,29,44,0.15)"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeFlowchart.estimatedDurationAr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#69645C', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{isAr ? 'المدة التقديرية:' : 'Est. Duration:'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>
                      {isAr ? activeFlowchart.estimatedDurationAr : activeFlowchart.estimatedDurationEn}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#69645C', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>{isAr ? 'عدد الخطوات:' : 'Steps:'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>{activeFlowchart.nodes.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#69645C', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>{isAr ? 'الدولة:' : 'Country:'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>{isAr ? 'لبنان' : 'Lebanon'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#69645C", display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{isAr ? 'حالة التحقق:' : 'Verification:'}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: activeFlowchart.verificationStatus === 'verified' ? '#78350F' : '#B8860B', background: activeFlowchart.verificationStatus === 'verified' ? '#FFFBEB' : '#FFFBEB', borderRadius: 8, padding: '2px 8px' }}>
                    {activeFlowchart.verificationStatus === 'verified' ? (isAr ? 'موثّق' : 'Verified') : activeFlowchart.verificationStatus === 'partially_verified' ? (isAr ? 'موثّق جزئياً' : 'Partially Verified') : (isAr ? 'مسودة بالذكاء الاصطناعي' : 'AI Draft')}
                  </span>
                </div>
                {isAiGenerated && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '6px 10px', marginTop: 2 }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <span style={{ fontSize: 10.5, color: '#B8860B', fontWeight: 700 }}>
                      {isAr ? 'خارطة مولّدة تلقائياً بالذكاء الاصطناعي — راجعها قبل الاعتماد الكامل' : 'AI-generated map — review before relying on it fully'}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Flowchart */}
            <SectionCard
              title={isAr ? 'خارطة الإجراء' : 'Procedure Map'}
              icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
              bg="#fff"
              border="#E6E2DC"
            >
              <ProcedureFlowchartComponent
                flowchart={activeFlowchart}
                isAr={isAr}
                completedNodeIds={progress.completedNodes}
                onToggleNode={progress.toggleNode}
              />
              {progress.completedNodes.length > 0 && (
                <div style={{ textAlign: isAr ? 'left' : 'right', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={progress.reset}
                    style={{ background: 'none', border: 'none', color: '#918B82', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                  >
                    {isAr ? 'إعادة ضبط التقدم' : 'Reset progress'}
                  </button>
                </div>
              )}
              <SaveToMyFilesButton slug={slug} titleAr={proc?.title || activeFlowchart.titleAr} flowchart={activeFlowchart} isAr={isAr} />
            </SectionCard>
          </>
        ) : (
          <SectionCard
            title={isAr ? 'خارطة الإجراء' : 'Procedure Map'}
            icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
            bg="#fff"
            border="#E6E2DC"
          >
            {fcError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: 12.5, color: '#8F1D2C', margin: 0 }}>{isAr ? 'تعذّر توليد خارطة الإجراء بالذكاء الاصطناعي.' : 'Could not generate the AI procedure map.'}</p>
                <button
                  type="button"
                  onClick={retryFlowchart}
                  style={{ background: '#8F1D2C', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 8px' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2.5px solid #E6E2DC', borderTopColor: '#8F1D2C', animation: 'pfcSpin 0.8s linear infinite' }} />
                <style>{`@keyframes pfcSpin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: 12, color: '#918B82', margin: 0 }}>{isAr ? 'جارٍ توليد خارطة الإجراء بالذكاء الاصطناعي...' : 'Generating AI procedure map...'}</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* Required documents from proc */}
        {proc && proc.requiredDocuments && proc.requiredDocuments.length > 0 && (
          <SectionCard
            title={isAr ? 'المستندات المطلوبة' : 'Required Documents'}
            icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}
            bg="#F8EDEF"
            border="rgba(143,29,44,0.15)"
            collapsible={true}
            defaultOpen={true}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isAr ? proc.requiredDocuments : (proc.requiredDocuments_en?.length ? proc.requiredDocuments_en : proc.requiredDocuments)).map((doc, i) => {
                const checked = progress.isDocChecked(doc)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => progress.toggleDoc(doc)}
                    aria-pressed={checked}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, background: checked ? '#F5FBF8' : 'transparent',
                      border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', textAlign: isAr ? 'right' : 'left', width: '100%', fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      border: `1.5px solid ${checked ? '#065F46' : 'rgba(143,29,44,0.4)'}`, background: checked ? '#065F46' : 'transparent',
                    }}>
                      {checked && <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </span>
                    <span style={{ fontSize: 13, color: checked ? '#065F46' : '#191713', textDecoration: checked ? 'line-through' : 'none' }}>{doc}</span>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        )}

        {/* Flowchart nodes with docs (from flowchart data) */}
        {(() => {
          if (!activeFlowchart) return null
          const docsNodes = activeFlowchart.nodes.filter(n => n.requiredDocuments && n.requiredDocuments.length > 0)
          if (docsNodes.length === 0) return null
          return (
            <SectionCard
              title={isAr ? 'وثائق كل خطوة' : 'Documents per Step'}
              icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
              bg="#F8EDEF"
              border="rgba(143,29,44,0.2)"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docsNodes.map(node => (
                  <div key={node.id}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#8F1D2C', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                    </p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(node.requiredDocuments || []).map((doc, di) => (
                        <span key={di} style={{ fontSize: 10.5, color: '#8F1D2C', background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)', borderRadius: 8, padding: '2px 9px' }}>{doc}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )
        })()}

        {/* Risks section */}
        {(() => {
          if (!activeFlowchart) return null
          const riskNodes = activeFlowchart.nodes.filter(n => n.type === 'risk' || n.riskLevel === 'high' || n.riskLevel === 'critical')
          if (riskNodes.length === 0) return null
          return (
            <SectionCard
              title={isAr ? 'المخاطر والتنبيهات' : 'Risks & Warnings'}
              icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
              bg="#FFFBEB"
              border="#FDE68A"
              collapsible={true}
              defaultOpen={true}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {riskNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, color: '#B45309', display: 'flex', marginTop: 2 }}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#191713', margin: '0 0 2px' }}>
                        {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                      </p>
                      {node.descriptionAr && (
                        <p style={{ fontSize: 11.5, color: '#69645C', margin: 0 }}>{isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )
        })()}

        {/* Authority */}
        {(proc?.authority || activeFlowchart?.authorityAr) && (
          <SectionCard
            title={isAr ? 'الجهة المختصة' : 'Competent Authority'}
            icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
            bg="#FEF9EC"
            border="#FDE68A"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#191713', margin: 0 }}>
                  {isAr ? (proc?.authority || activeFlowchart.authorityAr || '') : (proc?.authority || activeFlowchart.authorityEn || activeFlowchart.authorityAr || '')}
                </p>
                <p style={{ fontSize: 11, color: '#918B82', margin: '2px 0 0' }}>
                  {isAr ? 'الجهة المخوّلة بإتمام هذه المعاملة' : 'Authority responsible for this procedure'}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Ask AI CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)',
          borderRadius: 18, padding: '20px 20px',
          display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(80,10,10,0.2)',
        }}>
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: '0 0 4px' }}>
              {isAr ? 'لديك سؤال عن هذا المسار؟' : 'Questions about this playbook?'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0 }}>
              {isAr ? 'اسأل دليلك وسيجيبك فوراً' : 'Ask Dalilak for an instant answer'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const q = isAr
                ? `اشرح لي إجراء: ${proc?.title ?? slug}`
                : `Explain this procedure: ${(proc?.title_en || proc?.title) ?? slug}`
              router.push(`/?q=${encodeURIComponent(q)}`)
            }}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.26)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 12, padding: '10px 24px', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
        </div>

        {/* Back to procedure */}
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <button
            type="button"
            onClick={() => router.push(`/procedures/${slug}`)}
            style={{ background: 'none', border: 'none', color: '#918B82', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
            </svg>
            {isAr ? 'العودة إلى صفحة الإجراء' : 'Back to Procedure'}
          </button>
        </div>

      </div>{/* end content */}

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="procedures" /></div>
    </div>
  )
}
