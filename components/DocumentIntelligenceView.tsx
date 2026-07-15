'use client'

/**
 * Universal Document Intelligence View
 * Phase: Document Intelligence Engine
 *
 * Renders the full analysis of any uploaded document:
 * 1. تشخيص المستند  (DocumentTypeBadge + header)
 * 2. البيانات المستخرجة (ExtractedFactsTable)
 * 3. المعاملات المرتبطة (RelatedProceduresPanel)
 * 4. النواقص (MissingRequirementsPanel)
 * 5. المخاطر (DocumentRiskPanel)
 * 6. النماذج المقترحة (RecommendedDraftsPanel)
 * 7. الخطوة التالية (DocumentNextActions)
 * 8. المصادر والثقة (EvidencePanel)
 */

import React, { useState } from 'react'
import type {
  UniversalDocumentAnalysis,
  ExtractedFact,
  RelatedProcedure,
  MissingField,
  MissingDocument,
  DocumentRisk,
  RecommendedDraft,
  NextAction,
  Evidence,
  DocCategory,
} from '@/lib/documentIntelligence'
import {
  getDocCategoryMeta,
  summarizeRiskLevel,
  riskColors,
  confidenceLabel,
  priorityLabel,
  sourceTypeLabel,
  getDraftTemplate,
} from '@/lib/documentIntelligence'

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1.5px solid #EAE4D9',
  overflow: 'hidden',
  marginBottom: 10,
}

const sectionHeader = (expanded: boolean): React.CSSProperties => ({
  width: '100%', padding: '13px 16px',
  background: '#fff', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 10,
  fontFamily: 'inherit', textAlign: 'right' as const,
  transition: 'background 0.15s',
})

const sectionBody: React.CSSProperties = {
  borderTop: '1px solid #EAE4D9',
  padding: '14px 16px',
}

// ── DocumentTypeBadge ──────────────────────────────────────────────────────────

export function DocumentTypeBadge({ category, subtype, confidence, isAr }: {
  category: DocCategory
  subtype?: string
  confidence: 'high' | 'medium' | 'low' | 'unknown'
  isAr: boolean
}) {
  const meta = getDocCategoryMeta(category)
  const confColor = confidence === 'high' ? '#78350F' : confidence === 'medium' ? '#B45309' : '#9C8E80'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '6px 13px', borderRadius: 20,
        background: `${meta.color}14`, border: `1.5px solid ${meta.color}30`,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
          {isAr ? meta.titleAr : meta.titleEn}
        </span>
      </div>
      {subtype && (
        <span style={{ fontSize: 11, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 12, padding: '3px 10px' }}>
          {subtype}
        </span>
      )}
      <span style={{ fontSize: 10, color: confColor, background: `${confColor}14`, borderRadius: 12, padding: '3px 9px', fontWeight: 600 }}>
        {isAr ? 'الثقة: ' : 'Confidence: '}{confidenceLabel(confidence, isAr)}
      </span>
    </div>
  )
}

// ── ExtractedFactsTable ────────────────────────────────────────────────────────

export function ExtractedFactsTable({ facts, isAr }: { facts: ExtractedFact[]; isAr: boolean }) {
  if (!facts.length) return (
    <p style={{ fontSize: 11.5, color: '#9C8E80', margin: 0 }}>
      {isAr ? 'لم يتم استخراج بيانات محددة.' : 'No specific facts extracted.'}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {facts.map((f, i) => {
        const confColor = f.confidence === 'high' ? '#78350F' : f.confidence === 'medium' ? '#B45309' : '#9C8E80'
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '9px 12px',
            background: '#FAFAF8', borderRadius: 10, border: '1px solid #EAE4D9',
            flexDirection: isAr ? 'row' : 'row',
          }}>
            <div style={{ flex: '0 0 120px', fontSize: 11.5, color: '#5C4A3A', fontWeight: 600 }}>{f.label}</div>
            <div style={{ flex: 1, fontSize: 12, color: '#1A1208', fontWeight: 600 }}>{f.value}</div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: confColor, background: `${confColor}14`, borderRadius: 10, padding: '2px 7px', fontWeight: 700 }}>
                {confidenceLabel(f.confidence, isAr)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── RelatedProceduresPanel ─────────────────────────────────────────────────────

export function RelatedProceduresPanel({ procedures, isAr, onStartFlow }: {
  procedures: RelatedProcedure[]
  isAr: boolean
  onStartFlow?: (slug: string) => void
}) {
  if (!procedures.length) return (
    <p style={{ fontSize: 11.5, color: '#9C8E80', margin: 0 }}>
      {isAr ? 'لا توجد معاملات مرتبطة محددة.' : 'No related procedures identified.'}
    </p>
  )
  const relevColor = (r: string) => r === 'high' ? '#78350F' : r === 'medium' ? '#B45309' : '#9C8E80'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {procedures.map((p, i) => (
        <div key={i} style={{
          padding: '11px 13px', borderRadius: 12, border: '1.5px solid #EAE4D9',
          background: '#FAFAF8', display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: relevColor(p.relevance),
            background: `${relevColor(p.relevance)}14`, borderRadius: 10,
            padding: '3px 8px', flexShrink: 0, marginTop: 2,
          }}>
            {isAr
              ? (p.relevance === 'high' ? 'صلة عالية' : p.relevance === 'medium' ? 'صلة متوسطة' : 'صلة منخفضة')
              : (p.relevance === 'high' ? 'High' : p.relevance === 'medium' ? 'Medium' : 'Low')}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208' }}>
              {isAr ? p.titleAr : p.titleEn}
            </div>
            <div style={{ fontSize: 11, color: '#5C4A3A', marginTop: 3 }}>{p.reason}</div>
          </div>
          {onStartFlow && (
            <button
              onClick={() => onStartFlow(p.procedureSlug)}
              style={{
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #8B1A1A, #6b2737)', color: '#fff', fontSize: 10.5,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                boxShadow: '0 1px 4px rgba(139,26,26,0.2)',
              }}
            >
              <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                {!isAr && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>}
                {isAr ? 'ابدأ' : 'Start'}
                {isAr && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>}
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ── MissingRequirementsPanel ────────────────────────────────────────────────────

export function MissingRequirementsPanel({ fields, documents, isAr }: {
  fields: MissingField[]
  documents: MissingDocument[]
  isAr: boolean
}) {
  const priColor = (p: string): [string, string] => {
    if (p === 'critical') return ['#FEE2E2', '#B91C1C']
    if (p === 'high')     return ['#FEE2E2', '#DC2626']
    if (p === 'medium')   return ['#FEF3C7', '#B45309']
    return ['#EAE4D9', '#5C4A3A']
  }
  if (!fields.length && !documents.length) return (
    <p style={{ fontSize: 11.5, color: '#78350F', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      {isAr ? 'لا نواقص واضحة تم اكتشافها.' : 'No obvious missing items detected.'}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {fields.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2D1B0E', marginBottom: 4 }}>
            {isAr ? 'معلومات ناقصة:' : 'Missing Information:'}
          </div>
          {fields.map((f, i) => {
            const [bg, fg] = priColor(f.priority)
            return (
              <div key={i} style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${fg}25`, background: bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: fg, background: `${fg}18`, borderRadius: 10, padding: '2px 7px' }}>
                    {priorityLabel(f.priority, isAr)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1208' }}>{f.field}</span>
                </div>
                <div style={{ fontSize: 11, color: '#5C4A3A' }}>{f.whyItMatters}</div>
                {f.requiredFor && (
                  <div style={{ fontSize: 10, color: fg, marginTop: 3, fontWeight: 600 }}>
                    {isAr ? 'مطلوب لـ: ' : 'Required for: '}{f.requiredFor}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
      {documents.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2D1B0E', marginTop: fields.length ? 10 : 0, marginBottom: 4 }}>
            {isAr ? 'مستندات ناقصة:' : 'Missing Documents:'}
          </div>
          {documents.map((d, i) => {
            const [bg, fg] = priColor(d.priority)
            const statusIcon: React.ReactNode = d.status === 'missing'
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6"/></svg>
              : d.status === 'unclear'
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5C4A3A" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            return (
              <div key={i} style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${fg}25`, background: bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ display: 'flex', flexShrink: 0 }}>{statusIcon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1208' }}>
                    {isAr ? d.titleAr : (d.titleEn ?? d.titleAr)}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: fg, background: `${fg}18`, borderRadius: 10, padding: '2px 7px', marginRight: 'auto' }}>
                    {priorityLabel(d.priority, isAr)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#5C4A3A' }}>{d.reason}</div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// ── DocumentRiskPanel ──────────────────────────────────────────────────────────

export function DocumentRiskPanel({ risks, isAr }: { risks: DocumentRisk[]; isAr: boolean }) {
  if (!risks.length) return (
    <p style={{ fontSize: 11.5, color: '#78350F', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      {isAr ? 'لم تُكتشف مخاطر واضحة.' : 'No obvious risks detected.'}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {risks.map((r, i) => {
        const [bg, fg] = riskColors(r.level)
        const levelLabel = r.level === 'critical' ? (isAr ? 'حرج' : 'Critical')
          : r.level === 'high' ? (isAr ? 'عالٍ' : 'High')
          : r.level === 'medium' ? (isAr ? 'متوسط' : 'Medium')
          : (isAr ? 'منخفض' : 'Low')
        return (
          <div key={i} style={{ padding: '12px 13px', borderRadius: 12, background: bg, border: `1.5px solid ${fg}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: fg, background: `${fg}20`, borderRadius: 10, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                {levelLabel}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208' }}>{r.title}</span>
            </div>
            <p style={{ fontSize: 11, color: '#2D1B0E', margin: '0 0 7px', lineHeight: 1.55 }}>{r.explanation}</p>
            <div style={{ fontSize: 11, color: fg, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.5" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>{r.recommendedAction}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── EvidencePanel ──────────────────────────────────────────────────────────────

export function EvidencePanel({ evidence, confidence, isAr }: {
  evidence: Evidence[]
  confidence: UniversalDocumentAnalysis['confidence']
  isAr: boolean
}) {
  const confColor = (c: string) => c === 'high' ? '#78350F' : c === 'medium' ? '#B45309' : '#9C8E80'
  return (
    <div>
      {/* Confidence summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
        {[
          { label: isAr ? 'استخراج البيانات' : 'Data Extraction',  level: confidence.extraction },
          { label: isAr ? 'مطابقة المعاملات' : 'Procedure Match',  level: confidence.procedureMatching },
          { label: isAr ? 'التفسير القانوني' : 'Legal Interpretation', level: confidence.legalInterpretation },
          { label: isAr ? 'الإجمالي' : 'Overall',                   level: confidence.overall },
        ].map((row, i) => (
          <div key={i} style={{ padding: '8px 11px', borderRadius: 10, background: '#FAFAF8', border: '1px solid #EAE4D9' }}>
            <div style={{ fontSize: 10, color: '#5C4A3A', marginBottom: 3 }}>{row.label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: confColor(row.level) }}>
              {confidenceLabel(row.level, isAr)}
            </div>
          </div>
        ))}
      </div>
      {/* Trust statement */}
      <div style={{ padding: '10px 12px', background: '#FDF8F0', borderRadius: 10, border: '1px solid #EAE4D9', marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#7C5C1C', margin: 0, lineHeight: 1.6 }}>
          {isAr
            ? 'تم التحليل بناءً على المستند المرفوع وربطه بقاعدة دليلك للمعاملات. بعض النتائج إرشادية وقد تحتاج إلى تحقق من الجهة المختصة أو مراجعة محامٍ.'
            : 'Analysis is based on the uploaded document linked to Dalilak\'s procedures database. Some findings are advisory and may need verification with the competent authority or a lawyer.'}
        </p>
      </div>
      {/* Evidence items */}
      {evidence.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {evidence.map((e, i) => {
            const [bg, fg] = riskColors(e.reliability === 'high' ? 'low' : e.reliability === 'medium' ? 'medium' : 'high')
            return (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 10, background: '#FAFAF8', border: '1px solid #EAE4D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#5C4A3A', background: '#EAE4D9', borderRadius: 10, padding: '2px 7px' }}>
                    {sourceTypeLabel(e.sourceType, isAr)}
                  </span>
                  {e.verified && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#78350F', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {isAr ? 'موثّق' : 'Verified'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#1A1208' }}>{e.claim}</div>
                {e.excerpt && (
                  <div style={{ fontSize: 10.5, color: '#5C4A3A', marginTop: 5, fontStyle: 'italic', borderRight: '3px solid #D5CEC4', paddingRight: 8 }}>
                    "{e.excerpt}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── DocumentNextActions ────────────────────────────────────────────────────────

export function DocumentNextActions({ actions, isAr, onAction, onRequestHumanReview }: {
  actions: NextAction[]
  isAr: boolean
  onAction: (action: NextAction) => void
  onRequestHumanReview: () => void
}) {
  const [showSecondary, setShowSecondary] = useState(false)
  const primary   = actions.filter(a => a.priority === 'primary').slice(0, 3)
  const secondary = actions.filter(a => a.priority === 'secondary')

  const actionIcon = (type: NextAction['actionType']): React.ReactNode => {
    if (type === 'create_transaction_file') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.17a2 2 0 011.41.59l1.83 1.83A2 2 0 0012.83 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
    if (type === 'generate_checklist') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
    if (type === 'generate_draft') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    if (type === 'upload_missing_document') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
    if (type === 'start_guided_flow') return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
    if (type === 'ask_followup') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
    if (type === 'request_human_review') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
    if (type === 'compare_with_template') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    return <span>·</span>
  }

  return (
    <div>
      {/* Primary actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {primary.map((a, i) => (
          <button
            key={i}
            onClick={() => a.actionType === 'request_human_review' ? onRequestHumanReview() : onAction(a)}
            style={{
              padding: '12px 16px', borderRadius: 12, border: 'none',
              background: i === 0
                ? 'linear-gradient(135deg,#8B1A1A,#6b2737)'
                : i === 1
                ? 'linear-gradient(135deg,#6b2737,#8B1A1A)'
                : '#EAE4D9',
              color: i < 2 ? '#fff' : '#2D1B0E',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              textAlign: isAr ? 'right' : 'left',
            }}
          >
            <span style={{ display: 'flex', flexShrink: 0 }}>{actionIcon(a.actionType)}</span>
            <span>{isAr ? a.labelAr : a.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Human review always visible */}
      <button
        onClick={onRequestHumanReview}
        style={{
          marginTop: 10, width: '100%', padding: '10px 16px', borderRadius: 12,
          border: '1.5px solid #EAE4D9', background: '#fff', color: '#2D1B0E',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ display: 'flex', flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></span>
        <span>{isAr ? 'اطلب مراجعة بشرية من مختص' : 'Request human expert review'}</span>
      </button>

      {/* Secondary actions collapse */}
      {secondary.length > 0 && (
        <>
          <button
            onClick={() => setShowSecondary(s => !s)}
            style={{
              marginTop: 8, width: '100%', padding: '8px 12px',
              border: 'none', background: 'none', color: '#5C4A3A',
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transition:'transform 0.2s',transform:showSecondary?'rotate(180deg)':'none'}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
              {showSecondary
                ? (isAr ? 'إخفاء الإجراءات الإضافية' : 'Hide more actions')
                : (isAr ? `المزيد (${secondary.length})` : `More (${secondary.length})`)}
            </span>
          </button>
          {showSecondary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {secondary.map((a, i) => (
                <button
                  key={i}
                  onClick={() => a.actionType === 'request_human_review' ? onRequestHumanReview() : onAction(a)}
                  style={{
                    padding: '9px 14px', borderRadius: 10,
                    border: '1.5px solid #EAE4D9', background: '#FAFAF8',
                    color: '#2D1B0E', fontSize: 11.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span>{actionIcon(a.actionType)}</span>
                  <span>{isAr ? a.labelAr : a.labelEn}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── GenerateDraftModal ─────────────────────────────────────────────────────────

export function GenerateDraftModal({
  draft, extractedFacts, isAr, onClose, onSend,
}: {
  draft: RecommendedDraft
  extractedFacts: ExtractedFact[]
  isAr: boolean
  onClose: () => void
  onSend: (prompt: string) => void
}) {
  const template = getDraftTemplate(draft.templateSlug)

  // Pre-fill from extracted facts
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (template) {
      for (const f of template.requiredFields) {
        const match = extractedFacts.find(ef =>
          ef.normalizedKey === f || ef.label.includes(f) || f.includes(ef.label)
        )
        initial[f] = match?.value ?? ''
      }
    }
    return initial
  })

  const missingFields = template?.requiredFields.filter(f => !fields[f]?.trim()) ?? []

  const handleGenerate = () => {
    const factsStr = extractedFacts
      .map(f => `${f.label}: ${f.value}`)
      .join('\n')
    const userFields = Object.entries(fields)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')

    const prompt = isAr
      ? `أنشئ مسودة "${draft.titleAr}" بناءً على البيانات التالية:

**بيانات المستند:**
${factsStr}

**بيانات إضافية:**
${userFields || '(لا يوجد)'}

المتطلبات:
- اكتب المسودة باللغة العربية الرسمية
- وضّح بوضوح أن هذا مسودة أولية فقط
- استخدم صيغة رسمية مناسبة
- ضع [PLACEHOLDER] لأي بيانات غير متوفرة
${template?.requiresLawyerReview ? '- أضف في النهاية: "يوصى بمراجعة محامٍ قبل استعمال هذه المسودة."' : ''}`
      : `Generate a draft "${draft.titleEn}" based on the following data:

**Document facts:**
${factsStr}

**Additional inputs:**
${userFields || '(none)'}

Requirements:
- Write in formal Arabic (or English as requested)
- Clearly label this as a preliminary draft only
- Use formal appropriate language
- Use [PLACEHOLDER] for any unavailable data
${template?.requiresLawyerReview ? '- End with: "Lawyer review is recommended before using this draft."' : ''}`

    onSend(prompt)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '20px 16px 32px',
        fontFamily: "'Cairo','Inter',sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#EAE4D9', margin: '0 auto 16px' }} />

        <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1208', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          {isAr ? draft.titleAr : draft.titleEn}
        </div>
        <div style={{ fontSize: 11.5, color: '#5C4A3A', marginBottom: 16 }}>
          {isAr ? 'مسودة أولية — تحقق قبل الاستخدام' : 'Draft only — verify before use'}
        </div>

        {draft.requiresLawyerReview && (
          <div style={{ padding: '10px 12px', background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A', marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#B45309', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              {isAr
                ? 'يوصى بمراجعة محامٍ قبل استعمال هذه المسودة.'
                : 'Lawyer review recommended before using this draft.'}
            </p>
          </div>
        )}

        {/* Fields */}
        {template && template.requiredFields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2D1B0E' }}>
              {isAr ? 'تأكد أو أضف البيانات التالية:' : 'Confirm or add the following:'}
            </div>
            {template.requiredFields.map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#5C4A3A', display: 'block', marginBottom: 4 }}>{f}</label>
                <input
                  type="text"
                  value={fields[f] ?? ''}
                  onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                  placeholder={isAr ? `أدخل ${f}` : `Enter ${f}`}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10,
                    border: `1.5px solid ${fields[f]?.trim() ? '#FDE68A' : '#FEE2E2'}`,
                    background: fields[f]?.trim() ? '#FFFBEB' : '#FFF',
                    fontSize: 12, color: '#1A1208', fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {missingFields.length > 0 && (
          <div style={{ padding: '9px 12px', background: '#FEF2F2', borderRadius: 10, border: '1px solid rgba(139,26,26,0.1)', marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#8B1A1A', margin: 0 }}>
              {isAr
                ? `${missingFields.length} حقل ناقص — سيتم وضع [PLACEHOLDER] بدلاً عنه.`
                : `${missingFields.length} field(s) empty — [PLACEHOLDER] will be used.`}
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          style={{
            width: '100%', padding: '13px', borderRadius: 13,
            background: 'linear-gradient(135deg,#8B1A1A,#6b2737)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(139,26,26,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          {isAr ? 'توليد المسودة' : 'Generate Draft'}
        </button>
      </div>
    </div>
  )
}

// ── RecommendedDraftsPanel ─────────────────────────────────────────────────────

export function RecommendedDraftsPanel({
  drafts, extractedFacts, isAr, onSend,
}: {
  drafts: RecommendedDraft[]
  extractedFacts: ExtractedFact[]
  isAr: boolean
  onSend: (prompt: string) => void
}) {
  const [activeDraft, setActiveDraft] = useState<RecommendedDraft | null>(null)

  if (!drafts.length) return null
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {drafts.map((d, i) => (
          <button key={i} onClick={() => setActiveDraft(d)} style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: '1.5px solid #EAE4D9', background: '#fff',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 10,
            textAlign: isAr ? 'right' : 'left', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FEF9F9' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.background = '#fff' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{isAr ? d.titleAr : d.titleEn}</div>
              {d.requiresLawyerReview && (
                <div style={{ fontSize: 10, color: '#B45309', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                  {isAr ? 'يُنصح بمراجعة محامٍ' : 'Lawyer review recommended'}
                </div>
              )}
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C4B8A8" strokeWidth="2" style={{ flexShrink: 0, transform: isAr ? 'rotate(180deg)' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {activeDraft && (
        <GenerateDraftModal
          draft={activeDraft}
          extractedFacts={extractedFacts}
          isAr={isAr}
          onClose={() => setActiveDraft(null)}
          onSend={p => { onSend(p); setActiveDraft(null) }}
        />
      )}
    </>
  )
}

// ── Main DocumentIntelligenceView ──────────────────────────────────────────────

interface DocumentIntelligenceViewProps {
  analysis: UniversalDocumentAnalysis
  isAr: boolean
  onAction?: (action: NextAction) => void
  onRequestHumanReview?: () => void
  onSend?: (prompt: string) => void
}

function CollapsibleSection({
  title, icon, children, defaultOpen = true,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ ...card }}>
      <button style={sectionHeader(open)} onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', color: '#8B1A1A' }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', flex: 1 }}>{title}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9C8E80" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div style={sectionBody}>{children}</div>}
    </div>
  )
}

export default function DocumentIntelligenceView({
  analysis, isAr, onAction, onRequestHumanReview, onSend,
}: DocumentIntelligenceViewProps) {
  const meta = getDocCategoryMeta(analysis.category as DocCategory)
  const riskSummary = summarizeRiskLevel(analysis.risks)

  const handleAction = (action: NextAction) => { if (onAction) onAction(action) }
  const handleHumanReview = () => { if (onRequestHumanReview) onRequestHumanReview() }
  const handleSend = (prompt: string) => { if (onSend) onSend(prompt) }

  return (
    <div style={{ fontFamily: "'Cairo','Inter',sans-serif", direction: isAr ? 'rtl' : 'ltr' }}>

      {/* Document type header */}
      <div style={{ padding: '14px 16px', background: `${meta.color}10`, border: `1.5px solid ${meta.color}30`, borderRadius: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1208' }}>{isAr ? meta.labelAr : meta.labelEn}</div>
          <div style={{ fontSize: 11, color: '#5C4A3A', marginTop: 2 }}>
            {isAr
              ? `${analysis.extractedFacts.length} بيانات مستخرجة · ${analysis.relatedProcedures.length} معاملات مرتبطة`
              : `${analysis.extractedFacts.length} facts extracted · ${analysis.relatedProcedures.length} related procedures`}
          </div>
        </div>
        <div style={{ marginRight: 'auto', marginLeft: 'auto' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: riskSummary === 'high' || riskSummary === 'critical' ? '#DC2626' : riskSummary === 'medium' ? '#B45309' : '#78350F', background: riskSummary === 'high' || riskSummary === 'critical' ? '#FEF2F2' : riskSummary === 'medium' ? '#FFFBEB' : '#FFFBEB', borderRadius: 20, padding: '3px 10px' }}>
          {isAr ? (riskSummary === 'low' ? 'مخاطر منخفضة' : riskSummary === 'medium' ? 'مخاطر متوسطة' : 'مخاطر عالية') : (riskSummary === 'low' ? 'Low Risk' : riskSummary === 'medium' ? 'Medium Risk' : 'High Risk')}
        </span>
      </div>

      {/* Extracted facts */}
      {analysis.extractedFacts.length > 0 && (
        <CollapsibleSection
          title={isAr ? 'البيانات المستخرجة' : 'Extracted Data'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analysis.extractedFacts.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < analysis.extractedFacts.length - 1 ? '1px solid #EAE4D9' : 'none' }}>
                <span style={{ fontSize: 11, color: '#9C8E80', flex: '0 0 120px', paddingTop: 1 }}>{f.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1208', flex: 1 }}>{f.value}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Related procedures */}
      {analysis.relatedProcedures.length > 0 && (
        <CollapsibleSection
          title={isAr ? 'المعاملات المرتبطة' : 'Related Procedures'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analysis.relatedProcedures.map((p, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 10, background: '#FAFAF8', border: '1px solid #EAE4D9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208' }}>{isAr ? p.titleAr : p.titleEn}</div>
                  <div style={{ fontSize: 10.5, color: '#9C8E80', marginTop: 2 }}>{isAr ? p.ministry : p.ministry}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#8B1A1A', background: '#FEF2F2', borderRadius: 20, padding: '2px 8px' }}>
                  {Math.round(p.relevanceScore * 100)}%
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Missing requirements */}
      {(analysis.missingFields.length > 0 || analysis.missingDocuments.length > 0) && (
        <CollapsibleSection
          title={isAr ? 'النواقص' : 'Missing Requirements'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analysis.missingFields.map((f, i) => (
              <div key={i} style={{ padding: '7px 10px', background: '#FFF7ED', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12, color: '#854D0E' }}>
                {isAr ? f.labelAr : f.labelEn}
              </div>
            ))}
            {analysis.missingDocuments.map((d, i) => (
              <div key={i} style={{ padding: '7px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#991B1B' }}>
                {isAr ? d.labelAr : d.labelEn}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Risks */}
      {analysis.risks.length > 0 && (
        <CollapsibleSection
          title={isAr ? 'المخاطر المحتملة' : 'Potential Risks'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6"/></svg>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {analysis.risks.map((r, i) => {
              const [bg, fg] = riskColors(r.level)
              return (
                <div key={i} style={{ padding: '8px 10px', background: bg, border: `1px solid ${fg}30`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: fg, marginBottom: 3 }}>{isAr ? r.titleAr : r.titleEn}</div>
                  <div style={{ fontSize: 11, color: '#5C4A3A' }}>{isAr ? r.descriptionAr : r.descriptionEn}</div>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Recommended drafts */}
      {analysis.recommendedDrafts.length > 0 && onSend && (
        <CollapsibleSection
          title={isAr ? 'النماذج المقترحة' : 'Suggested Templates'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>}
        >
          <RecommendedDraftsPanel
            drafts={analysis.recommendedDrafts}
            extractedFacts={analysis.extractedFacts}
            isAr={isAr}
            onSend={handleSend}
          />
        </CollapsibleSection>
      )}

      {/* Next actions */}
      {analysis.nextActions.length > 0 && (
        <CollapsibleSection
          title={isAr ? 'الخطوات التالية' : 'Next Steps'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>}
        >
          <DocumentNextActions
            actions={analysis.nextActions}
            isAr={isAr}
            onAction={handleAction}
            onRequestHumanReview={handleHumanReview}
          />
        </CollapsibleSection>
      )}

      {/* Evidence & confidence */}
      <CollapsibleSection
        title={isAr ? 'المصادر والثقة' : 'Sources & Confidence'}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
        defaultOpen={false}
      >
        <EvidencePanel
          evidence={analysis.evidence}
          confidence={analysis.confidence}
          isAr={isAr}
        />
      </CollapsibleSection>

    </div>
  )
}
