'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProcedureFlowchartComponent from '@/components/ProcedureFlowchart'
import { FLOWCHARTS } from '@/lib/flowchartData'
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
  // Find flowchart or use generic
  const flowchart = FLOWCHARTS[slug] || Object.values(FLOWCHARTS)[0]

  const genericFlowchart = {
    procedureSlug: slug,
    titleAr: 'إجراء',
    titleEn: 'Procedure',
    country: 'lebanon',
    version: '1.0',
    verificationStatus: 'draft' as const,
    nodes: [
      { id: 'start', type: 'start' as const, titleAr: 'بداية الإجراء', titleEn: 'Start', status: 'current' as const },
      { id: 'docs', type: 'document' as const, titleAr: 'تجهيز المستندات', titleEn: 'Prepare Documents', status: 'not_started' as const },
      { id: 'authority', type: 'authority' as const, titleAr: 'مراجعة الجهة المختصة', titleEn: 'Visit Authority', status: 'not_started' as const },
      { id: 'submit', type: 'action' as const, titleAr: 'تقديم الطلب', titleEn: 'Submit Request', status: 'not_started' as const },
      { id: 'completion', type: 'completion' as const, titleAr: 'اكتمال المعاملة', titleEn: 'Complete', status: 'not_started' as const },
    ],
    edges: [
      { id: 'e1', from: 'start', to: 'docs' },
      { id: 'e2', from: 'docs', to: 'authority' },
      { id: 'e3', from: 'authority', to: 'submit' },
      { id: 'e4', from: 'submit', to: 'completion' },
    ],
  }

  const activeFlowchart = FLOWCHARTS[slug] || genericFlowchart

  const langToggle = (
    <button
      type="button"
      onClick={toggleLang}
      aria-label="تغيير اللغة"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      <PageHeader
        titleAr={`دليل التنفيذ${proc ? `: ${proc.title}` : ''}`}
        titleEn={`Playbook${proc ? `: ${proc.title}` : ''}`}
        subtitleAr="خطوات تفصيلية لإتمام المعاملة"
        subtitleEn="Step-by-step guide to complete the procedure"
        isAr={isAr}
        onBack={() => router.push(`/procedures/${slug}`)}
        rightSlot={langToggle}
      />

      <div id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 120px' }}>

        {/* Overview */}
        <SectionCard
          title={isAr ? 'نظرة عامة' : 'Overview'}
          icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
          bg="#FEF2F2"
          border="rgba(139,26,26,0.15)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeFlowchart.estimatedDurationAr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#5C4A3A', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{isAr ? 'المدة التقديرية:' : 'Est. Duration:'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>
                  {isAr ? activeFlowchart.estimatedDurationAr : activeFlowchart.estimatedDurationEn}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#5C4A3A', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>{isAr ? 'عدد الخطوات:' : 'Steps:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{activeFlowchart.nodes.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#5C4A3A', display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>{isAr ? 'الدولة:' : 'Country:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? 'لبنان' : 'Lebanon'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: "#5C4A3A", display: 'flex', alignItems: 'center', gap: 4 }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{isAr ? 'حالة التحقق:' : 'Verification:'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeFlowchart.verificationStatus === 'verified' ? '#78350F' : '#B8860B', background: activeFlowchart.verificationStatus === 'verified' ? '#FFFBEB' : '#FFFBEB', borderRadius: 8, padding: '2px 8px' }}>
                {activeFlowchart.verificationStatus === 'verified' ? (isAr ? 'موثّق' : 'Verified') : activeFlowchart.verificationStatus === 'partially_verified' ? (isAr ? 'موثّق جزئياً' : 'Partially Verified') : (isAr ? 'مسودة' : 'Draft')}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Flowchart */}
        <SectionCard
          title={isAr ? 'خارطة الإجراء' : 'Procedure Map'}
          icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
          bg="#fff"
          border="#EAE4D9"
        >
          <ProcedureFlowchartComponent
            flowchart={activeFlowchart}
            isAr={isAr}
          />
        </SectionCard>

        {/* Required documents from proc */}
        {proc && proc.requiredDocuments && proc.requiredDocuments.length > 0 && (
          <SectionCard
            title={isAr ? 'المستندات المطلوبة' : 'Required Documents'}
            icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}
            bg="#FEF2F2"
            border="rgba(139,26,26,0.15)"
            collapsible={true}
            defaultOpen={true}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#8B1A1A', flexShrink: 0, display: 'inline-flex' }}><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></span>
                  <span style={{ fontSize: 13, color: '#1A1208' }}>{doc}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Flowchart nodes with docs (from flowchart data) */}
        {(() => {
          const docsNodes = activeFlowchart.nodes.filter(n => n.requiredDocuments && n.requiredDocuments.length > 0)
          if (docsNodes.length === 0) return null
          return (
            <SectionCard
              title={isAr ? 'وثائق كل خطوة' : 'Documents per Step'}
              icon={<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
              bg="#FEF2F2"
              border="rgba(139,26,26,0.2)"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docsNodes.map(node => (
                  <div key={node.id}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#8B1A1A', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                    </p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(node.requiredDocuments || []).map((doc, di) => (
                        <span key={di} style={{ fontSize: 10.5, color: '#8B1A1A', background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', borderRadius: 8, padding: '2px 9px' }}>{doc}</span>
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
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>
                        {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                      </p>
                      {node.descriptionAr && (
                        <p style={{ fontSize: 11.5, color: '#5C4A3A', margin: 0 }}>{isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}</p>
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
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1208', margin: 0 }}>
                  {isAr ? (proc?.authority || activeFlowchart.authorityAr || '') : (proc?.authority || activeFlowchart.authorityEn || activeFlowchart.authorityAr || '')}
                </p>
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>
                  {isAr ? 'الجهة المخوّلة بإتمام هذه المعاملة' : 'Authority responsible for this procedure'}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Ask AI CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 60%, #7a1818 100%)',
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
                : `Explain this procedure: ${proc?.title ?? slug}`
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
            style={{ background: 'none', border: 'none', color: '#9C8E80', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}
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
