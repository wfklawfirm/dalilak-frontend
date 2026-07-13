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
        icon="📋"
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
          title={isAr ? '📌 نظرة عامة' : '📌 Overview'}
          bg="#FEF2F2"
          border="rgba(139,26,26,0.15)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeFlowchart.estimatedDurationAr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>⏱️ {isAr ? 'المدة التقديرية:' : 'Est. Duration:'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>
                  {isAr ? activeFlowchart.estimatedDurationAr : activeFlowchart.estimatedDurationEn}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>🔢 {isAr ? 'عدد الخطوات:' : 'Steps:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{activeFlowchart.nodes.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>🌍 {isAr ? 'الدولة:' : 'Country:'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? 'لبنان' : 'Lebanon'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280" }}>✅ {isAr ? 'حالة التحقق:' : 'Verification:'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeFlowchart.verificationStatus === 'verified' ? '#16a34a' : '#B8860B', background: activeFlowchart.verificationStatus === 'verified' ? '#F0FDF4' : '#FFFBEB', borderRadius: 8, padding: '2px 8px' }}>
                {activeFlowchart.verificationStatus === 'verified' ? (isAr ? 'موثّق' : 'Verified') : activeFlowchart.verificationStatus === 'partially_verified' ? (isAr ? 'موثّق جزئياً' : 'Partially Verified') : (isAr ? 'مسودة' : 'Draft')}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Flowchart */}
        <SectionCard
          title={isAr ? '🗺️ خارطة الإجراء' : '🗺️ Procedure Map'}
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
            title={isAr ? '📋 المستندات المطلوبة' : '📋 Required Documents'}
            bg="#F0FDF4"
            border="#BBF7D0"
            collapsible={true}
            defaultOpen={true}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
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
              title={isAr ? '📄 وثائق كل خطوة' : '📄 Documents per Step'}
              bg="#EFF6FF"
              border="#BFDBFE"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docsNodes.map(node => (
                  <div key={node.id}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', margin: '0 0 6px' }}>
                      📄 {isAr ? node.titleAr : (node.titleEn || node.titleAr)}
                    </p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {(node.requiredDocuments || []).map((doc, di) => (
                        <span key={di} style={{ fontSize: 10.5, color: '#1E40AF', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '2px 9px' }}>{doc}</span>
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
              title={isAr ? '⚠️ المخاطر والتنبيهات' : '⚠️ Risks & Warnings'}
              bg="#FFF7ED"
              border="#FED7AA"
              collapsible={true}
              defaultOpen={true}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {riskNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
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
              title={isAr ? '🏛️ الجهات المختصة' : '🏛️ Relevant Authorities'}
              bg="#F5F3FF"
              border="#DDD6FE"
              collapsible={true}
              defaultOpen={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {authNodes.map(node => (
                  <div key={node.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 16 }}>🏛️</span>
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
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139,26,26,0.3)' }}
          >
            🚀 {isAr ? 'ابدأ المعاملة مع AI' : 'Start Transaction with AI'}
          </button>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `أنشئ ملف معاملة لـ: ${activeFlowchart.titleAr}` : `Create transaction file for: ${activeFlowchart.titleEn}`)}`)}
            style={{ width: '100%', padding: '13px', background: '#fff', color: '#8B1A1A', border: '2px solid #8B1A1A', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            🗂️ {isAr ? 'أنشئ ملف معاملة' : 'Create Transaction File'}
          </button>
          <button
            onClick={() => router.push(`/?q=${encodeURIComponent(isAr ? `أحتاج مراجعة بشرية لمعاملة: ${activeFlowchart.titleAr}` : `I need human review for: ${activeFlowchart.titleEn}`)}`)}
            style={{ width: '100%', padding: '13px', background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            👤 {isAr ? 'اطلب مراجعة بشرية' : 'Request Human Review'}
          </button>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={() => router.push(`/procedures/${slug}`)} style={{ background: 'none', border: 'none', color: '#8B1A1A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            {isAr ? '← العودة لصفحة المعاملة' : '← Back to procedure'}
          </button>
        </div>
      </div>
    </div>
  )
}
