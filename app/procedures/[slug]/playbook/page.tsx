'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProcedureFlowchartComponent from '@/components/ProcedureFlowchart'
import { FLOWCHARTS } from '@/lib/flowchartData'
import { ENRICHED_PROCEDURES } from '@/lib/enrichedProcedures'
import { PageHeader, SectionCard, EmptyState } from '@/components/ui'

export default function PlaybookPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

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
      onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
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

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 120px' }}>

        {/* Overview */}
        <SectionCard
          title={isAr ? 'نظرة عامة' : 'Overview'}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
          bg="#FEF2F2"
          border="rgba(139,26,26,0.15)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeFlowchart.estimatedDurationAr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/></svg>{isAr ? 'المدة التقديرية:' : 'Est. Duration:'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>
                  {isAr ? activeFlowchart.estimatedDurationAr : activeFlowchart.estimatedDurationEn}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>{isAr ? 'عدد الخطوات:' : 'Steps:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{activeFlowchart.nodes.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>{isAr ? 'الدولة:' : 'Country:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? 'لبنان' : 'Lebanon'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280", display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{isAr ? 'حالة التحقق:' : 'Verification:'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeFlowchart.verificationStatus === 'verified' ? '#16a34a' : '#B8860B', background: activeFlowchart.verificationStatus === 'verified' ? '#F0FDF4' : '#FFFBEB', borderRadius: 8, padding: '2px 8px' }}>
                {activeFlowchart.verificationStatus === 'verified' ? (isAr ? 'موثّق' : 'Verified') : activeFlowchart.verificationStatus === 'partially_verified' ? (isAr ? 'موثّق جزئياً' : 'Partially Verified') : (isAr ? 'مسودة' : 'Draft')}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Flowchart */}
        <SectionCard
          title={isAr ? 'خارطة الإجراء' : 'Procedure Map'}
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>}
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
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}
            bg="#F0FDF4"
            border="#BBF7D0"
            collapsible={true}
            defaultOpen={true}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#16a34a', flexShrink: 0, display: 'inline-flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></span>
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
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
              bg="#FEF2F2"
              border="rgba(139,26,26,0.2)"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docsNodes.map(node => (
                  <div key={node.id}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#8B1A1A', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
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
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
              bg="#FFF7ED"
              border="#FED7AA"
              collapsible={true}
              defaultOpen={true}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {riskNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, color: '#B45309', display: 'flex', marginTop: 2 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>
                        {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                      </p>
                      {node.descriptionAr && (
                        <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0 }}>{isAr ? node.descriptionAr : (node.descriptionEn || node.descriptionAr)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )
        })()}

        {/* Authority */}
        {(() => {
          const authNodes = activeFlowchart.nodes.filter(n => n.type === 'authority' && n.relatedAuthority)
          if (authNodes.length === 0) return null
          return (
            <SectionCard
              title={isAr ? 'الجهات المختصة' : 'Relevant Authorities'}
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
              bg="#F5F3FF"
              border="#DDD6FE"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {authNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#6D28D9', display: 'flex', flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></span>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#6D28D9', margin: 0 }}>
                      {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )
        })()}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `ابدأ معاملة: ${activeFlowchart.titleAr}` : `Start procedure: ${activeFlowchart.titleEn}`)}`)}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139,26,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            {isAr ? 'ابدأ المعاملة مع AI' : 'Start Transaction with AI'}
          </button>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `أنشئ ملف معاملة لـ: ${activeFlowchart.titleAr}` : `Create transaction file for: ${activeFlowchart.titleEn}`)}`)}
            style={{ width: '100%', padding: '13px', background: '#fff', color: '#8B1A1A', border: '2px solid #8B1A1A', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            {isAr ? 'أنشئ ملف معاملة' : 'Create Transaction File'}
          </button>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `أحتاج مراجعة بشرية لمعاملة: ${activeFlowchart.titleAr}` : `I need human review for: ${activeFlowchart.titleEn}`)}`)}
            style={{ width: '100%', padding: '13px', background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            {isAr ? 'اطلب مراجعة بشرية' : 'Request Human Review'}
          </button>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={() => router.push(`/procedures/${slug}`)} style={{ background: 'none', border: 'none', color: '#8B1A1A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              {isAr ? 'العودة لصفحة المعاملة' : 'Back to procedure'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
