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
  border: '1.5px solid #F0F0F0',
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
  borderTop: '1px solid #F3F4F6',
  padding: '14px 16px',
}

// ── CollapsibleSection ─────────────────────────────────────────────────────────

function CollapsibleSection({
  icon, title, count, badgeColor, defaultOpen = false, children,
}: {
  icon: string
  title: string
  count?: number
  badgeColor?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={card}>
      <button onClick={() => setOpen(o => !o)} style={sectionHeader(open)}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: badgeColor ? `${badgeColor}18` : '#F3F4F6',
            color: badgeColor ?? '#6B7280',
          }}>{count}</span>
        )}
        <span style={{ color: '#9CA3AF', fontSize: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && <div style={sectionBody}>{children}</div>}
    </div>
  )
}

// ── DocumentTypeBadge ──────────────────────────────────────────────────────────

export function DocumentTypeBadge({ category, subtype, confidence, isAr }: {
  category: DocCategory
  subtype?: string
  confidence: 'high' | 'medium' | 'low' | 'unknown'
  isAr: boolean
}) {
  const meta = getDocCategoryMeta(category)
  const confColor = confidence === 'high' ? '#16A34A' : confidence === 'medium' ? '#B45309' : '#9CA3AF'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '6px 13px', borderRadius: 20,
        background: `${meta.color}14`, border: `1.5px solid ${meta.color}30`,
      }}>
        <span style={{ fontSize: 15 }}>{meta.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
          {isAr ? meta.titleAr : meta.titleEn}
        </span>
      </div>
      {subtype && (
        <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 12, padding: '3px 10px' }}>
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
    <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
      {isAr ? 'لم يتم استخراج بيانات محددة.' : 'No specific facts extracted.'}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {facts.map((f, i) => {
        const confColor = f.confidence === 'high' ? '#16A34A' : f.confidence === 'medium' ? '#B45309' : '#9CA3AF'
        return (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '9px 12px',
            background: '#FAFAF9', borderRadius: 10, border: '1px solid #F0F0F0',
            flexDirection: isAr ? 'row' : 'row',
          }}>
            <div style={{ flex: '0 0 120px', fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>{f.label}</div>
            <div style={{ flex: 1, fontSize: 12, color: '#111827', fontWeight: 600 }}>{f.value}</div>
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
    <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
      {isAr ? 'لا توجد معاملات مرتبطة محددة.' : 'No related procedures identified.'}
    </p>
  )
  const relevColor = (r: string) => r === 'high' ? '#16A34A' : r === 'medium' ? '#B45309' : '#9CA3AF'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {procedures.map((p, i) => (
        <div key={i} style={{
          padding: '11px 13px', borderRadius: 12, border: '1.5px solid #F0F0F0',
          background: '#FAFAF9', display: 'flex', alignItems: 'flex-start', gap: 10,
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
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>
              {isAr ? p.titleAr : p.titleEn}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{p.reason}</div>
          </div>
          {onStartFlow && (
            <button
              onClick={() => onStartFlow(p.procedureSlug)}
              style={{
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: '#8B1A1A', color: '#fff', fontSize: 10.5,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              {isAr ? 'ابدأ ←' : '→ Start'}
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
    return ['#F3F4F6', '#6B7280']
  }
  if (!fields.length && !documents.length) return (
    <p style={{ fontSize: 11.5, color: '#16A34A', margin: 0, fontWeight: 600 }}>
      ✅ {isAr ? 'لا نواقص واضحة تم اكتشافها.' : 'No obvious missing items detected.'}
    </p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {fields.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{f.field}</span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{f.whyItMatters}</div>
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
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginTop: fields.length ? 10 : 0, marginBottom: 4 }}>
            {isAr ? 'مستندات ناقصة:' : 'Missing Documents:'}
          </div>
          {documents.map((d, i) => {
            const [bg, fg] = priColor(d.priority)
            const statusIcon = d.status === 'missing' ? '❌' : d.status === 'unclear' ? '⚠️' : '🔍'
            return (
              <div key={i} style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${fg}25`, background: bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 13 }}>{statusIcon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                    {isAr ? d.titleAr : (d.titleEn ?? d.titleAr)}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: fg, background: `${fg}18`, borderRadius: 10, padding: '2px 7px', marginRight: 'auto' }}>
                    {priorityLabel(d.priority, isAr)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{d.reason}</div>
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
    <p style={{ fontSize: 11.5, color: '#16A34A', margin: 0, fontWeight: 600 }}>
      ✅ {isAr ? 'لم تُكتشف مخاطر واضحة.' : 'No obvious risks detected.'}
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
              <span style={{ fontSize: 10, fontWeight: 800, color: fg, background: `${fg}20`, borderRadius: 10, padding: '3px 9px' }}>
                ⚠ {levelLabel}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>{r.title}</span>
            </div>
            <p style={{ fontSize: 11, color: '#374151', margin: '0 0 7px', lineHeight: 1.55 }}>{r.explanation}</p>
            <div style={{ fontSize: 11, color: fg, fontWeight: 600 }}>
              {isAr ? '→ ' : '→ '}{r.recommendedAction}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── RecommendedDraftsPanel ─────────────────────────────────────────────────────

export function RecommendedDraftsPanel({ drafts, isAr, onGenerate }: {
  drafts: RecommendedDraft[]
  isAr: boolean
  onGenerate: (draft: RecommendedDraft) => void
}) {
  if (!drafts.length) return (
    <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
      {isAr ? 'لا توجد نماذج مقترحة.' : 'No draft recommendations.'}
    </p>
  )
  const catIcon: Record<string, string> = {
    notice: '📢', request: '📤', objection: '⚠️', declaration: '📋',
    undertaking: '✍️', settlement: '🤝', contract_addendum: '📝',
    administrative_letter: '🏛️', legal_letter: '⚖️', checklist: '✅', form_draft: '📄',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {drafts.map((d, i) => (
        <div key={i} style={{
          padding: '12px 13px', borderRadius: 12, border: '1.5px solid #F0F0F0',
          background: '#FAFAF9', display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>
            {catIcon[d.category] ?? '📄'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
              {isAr ? d.titleAr : d.titleEn}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.45 }}>{d.recommendedBecause}</div>
            {d.requiresLawyerReview && (
              <div style={{ fontSize: 10, color: '#B45309', fontWeight: 600, marginTop: 4 }}>
                ⚠ {isAr ? 'يوصى بمراجعة محامٍ قبل الاستخدام' : 'Lawyer review recommended before use'}
              </div>
            )}
          </div>
          <button
            onClick={() => onGenerate(d)}
            style={{
              padding: '7px 13px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,#8B1A1A,#6b2737)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {isAr ? 'أنشئ ←' : '→ Create'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── EvidencePanel ──────────────────────────────────────────────────────────────

export function EvidencePanel({ evidence, confidence, isAr }: {
  evidence: Evidence[]
  confidence: UniversalDocumentAnalysis['confidence']
  isAr: boolean
}) {
  const confColor = (c: string) => c === 'high' ? '#16A34A' : c === 'medium' ? '#B45309' : '#9CA3AF'
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
          <div key={i} style={{ padding: '8px 11px', borderRadius: 10, background: '#F9FAFB', border: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 3 }}>{row.label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: confColor(row.level) }}>
              {confidenceLabel(row.level, isAr)}
            </div>
          </div>
        ))}
      </div>
      {/* Trust statement */}
      <div style={{ padding: '10px 12px', background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE', marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
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
              <div key={i} style={{ padding: '8px 12px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #F0F0F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#6B7280', background: '#F3F4F6', borderRadius: 10, padding: '2px 7px' }}>
                    {sourceTypeLabel(e.sourceType, isAr)}
                  </span>
                  {e.verified && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', borderRadius: 10, padding: '2px 7px' }}>
                      ✓ {isAr ? 'موثّق' : 'Verified'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: '#111827' }}>{e.claim}</div>
                {e.excerpt && (
                  <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 5, fontStyle: 'italic', borderRight: '3px solid #E5E7EB', paddingRight: 8 }}>
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

  const actionIcon = (type: NextAction['actionType']) => {
    const map: Record<string, string> = {
      create_transaction_file: '📁', generate_checklist: '✅',
      generate_draft: '📝', upload_missing_document: '📎',
      start_guided_flow: '▶', ask_followup: '💬',
      request_human_review: '👨‍💼', compare_with_template: '🔍', none: '·',
    }
    return map[type] ?? '→'
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
                ? 'linear-gradient(135deg,#1E40AF,#1e3a8a)'
                : '#F3F4F6',
              color: i < 2 ? '#fff' : '#374151',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              textAlign: isAr ? 'right' : 'left',
            }}
          >
            <span style={{ fontSize: 16 }}>{actionIcon(a.actionType)}</span>
            <span>{isAr ? a.labelAr : a.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Human review always visible */}
      <button
        onClick={onRequestHumanReview}
        style={{
          marginTop: 10, width: '100%', padding: '10px 16px', borderRadius: 12,
          border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span>👨‍💼</span>
        <span>{isAr ? 'اطلب مراجعة بشرية من مختص' : 'Request human expert review'}</span>
      </button>

      {/* Secondary actions collapse */}
      {secondary.length > 0 && (
        <>
          <button
            onClick={() => setShowSecondary(s => !s)}
            style={{
              marginTop: 8, width: '100%', padding: '8px 12px',
              border: 'none', background: 'none', color: '#6B7280',
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {showSecondary
              ? (isAr ? '▲ إخفاء الإجراءات الإضافية' : '▲ Hide more actions')
              : (isAr ? `▼ المزيد (${secondary.length})` : `▼ More (${secondary.length})`)}
          </button>
          {showSecondary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {secondary.map((a, i) => (
                <button
                  key={i}
                  onClick={() => a.actionType === 'request_human_review' ? onRequestHumanReview() : onAction(a)}
                  style={{
                    padding: '9px 14px', borderRadius: 10,
                    border: '1.5px solid #F0F0F0', background: '#FAFAF9',
                    color: '#374151', fontSize: 11.5, fontWeight: 600,
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
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB', margin: '0 auto 16px' }} />

        <div style={{ fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
          📝 {isAr ? draft.titleAr : draft.titleEn}
        </div>
        <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 16 }}>
          {isAr ? 'مسودة أولية — تحقق قبل الاستخدام' : 'Draft only — verify before use'}
        </div>

        {draft.requiresLawyerReview && (
          <div style={{ padding: '10px 12px', background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A', marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#B45309', margin: 0, fontWeight: 600 }}>
              ⚠ {isAr
                ? 'يوصى بمراجعة محامٍ قبل استعمال هذه المسودة.'
                : 'Lawyer review recommended before using this draft.'}
            </p>
          </div>
        )}

        {/* Fields */}
        {template && template.requiredFields.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>
              {isAr ? 'تأكد أو أضف البيانات التالية:' : 'Confirm or add the following:'}
            </div>
            {template.requiredFields.map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>{f}</label>
                <input
                  type="text"
                  value={fields[f] ?? ''}
                  onChange={e => setFields(prev => ({ ...prev, [f]: e.target.value }))}
                  placeholder={isAr ? `أدخل ${f}` : `Enter ${f}`}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10,
                    border: `1.5px solid ${fields[f]?.trim() ? '#D1FAE5' : '#FEE2E2'}`,
                    background: fields[f]?.trim() ? '#F0FDF4' : '#FFF',
                    fontSize: 12, color: '#111827', fontFamily: 'inherit',
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
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {isAr ? '✨ أنشئ المسودة الآن' : '✨ Generate Draft Now'}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: 'none', background: 'none', color: '#9CA3AF',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
          }}
        >
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  )
}

// ── Main View ──────────────────────────────────────────────────────────────────

export default function UniversalDocumentAnalysisView({
  analysis,
  isAr,
  onSendMessage,
  onStartFlow,
  onUploadFile,
}: {
  analysis: UniversalDocumentAnalysis
  isAr: boolean
  onSendMessage: (msg: string) => void
  onStartFlow?: (slug: string) => void
  onUploadFile?: () => void
}) {
  const [activeDraft, setActiveDraft] = useState<RecommendedDraft | null>(null)
  const meta = getDocCategoryMeta(analysis.documentType.category)
  const overallRisk = summarizeRiskLevel(analysis.risks)
  const [riskBg, riskFg] = riskColors(overallRisk)

  const handleAction = (action: NextAction) => {
    if (action.actionType === 'upload_missing_document') {
      onUploadFile?.()
    } else if (action.actionType === 'start_guided_flow') {
      onStartFlow?.('')
    } else if (action.actionType === 'generate_checklist') {
      const prompt = isAr
        ? `أعطني قائمة مراجعة شاملة للمعاملة المرتبطة بالمستند: ${analysis.fileName ?? 'المستند المرفوع'}`
        : `Generate a comprehensive checklist for the transaction related to: ${analysis.fileName ?? 'uploaded document'}`
      onSendMessage(prompt)
    } else if (action.actionType === 'generate_draft') {
      const first = analysis.recommendedDrafts[0]
      if (first) setActiveDraft(first)
    } else if (action.actionType === 'ask_followup') {
      const prompt = isAr
        ? `لديّ سؤال إضافي عن المستند: `
        : 'I have a follow-up question about the document: '
      onSendMessage(prompt)
    }
  }

  const handleHumanReview = () => {
    const prompt = isAr
      ? `أريد طلب مراجعة بشرية من مختص قانوني لملف المستند: ${analysis.fileName ?? ''} (${isAr ? meta.titleAr : meta.titleEn})`
      : `I want to request a human legal review for document: ${analysis.fileName ?? ''} (${meta.titleEn})`
    onSendMessage(prompt)
  }

  return (
    <div style={{
      fontFamily: "'Cairo','Inter',sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
      maxWidth: 680, width: '100%',
    }}>
      <style>{`
        .di-section-btn:hover { background: #FAFAF9 !important; }
      `}</style>

      {/* ── Header card ── */}
      <div style={{
        ...card,
        padding: '16px',
        background: 'linear-gradient(135deg, #FAFAF8, #FFFFFF)',
        borderColor: `${meta.color}30`,
      }}>
        {/* File name */}
        {analysis.fileName && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
            📄 {analysis.fileName}
          </div>
        )}
        {/* Document type badge */}
        <DocumentTypeBadge
          category={analysis.documentType.category}
          subtype={analysis.documentType.subtype}
          confidence={analysis.documentType.confidence}
          isAr={isAr}
        />

        {/* Quick stats row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {analysis.extractedFacts.length > 0 && (
            <span style={{ fontSize: 10.5, color: '#374151', background: '#F3F4F6', borderRadius: 20, padding: '3px 10px' }}>
              📊 {analysis.extractedFacts.length} {isAr ? 'بيانات' : 'facts'}
            </span>
          )}
          {analysis.relatedProcedures.length > 0 && (
            <span style={{ fontSize: 10.5, color: '#1D4ED8', background: '#EFF6FF', borderRadius: 20, padding: '3px 10px' }}>
              🔗 {analysis.relatedProcedures.length} {isAr ? 'معاملة' : 'procedures'}
            </span>
          )}
          {analysis.risks.length > 0 && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: riskFg, background: riskBg, borderRadius: 20, padding: '3px 10px' }}>
              ⚠ {isAr ? 'خطر ' : 'Risk: '}{isAr
                ? overallRisk === 'critical' ? 'حرج' : overallRisk === 'high' ? 'عالٍ' : overallRisk === 'medium' ? 'متوسط' : 'منخفض'
                : overallRisk}
            </span>
          )}
          {analysis.recommendedDrafts.length > 0 && (
            <span style={{ fontSize: 10.5, color: '#7C3AED', background: '#F5F3FF', borderRadius: 20, padding: '3px 10px' }}>
              📝 {analysis.recommendedDrafts.length} {isAr ? 'نماذج' : 'drafts'}
            </span>
          )}
        </div>

        {/* Language / country chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {analysis.detectedLanguage && analysis.detectedLanguage !== 'unknown' && (
            <span style={{ fontSize: 9.5, color: '#6B7280', background: '#F3F4F6', borderRadius: 10, padding: '2px 8px' }}>
              🌐 {analysis.detectedLanguage.toUpperCase()}
            </span>
          )}
          {analysis.detectedCountry && analysis.detectedCountry !== 'unknown' && (
            <span style={{ fontSize: 9.5, color: '#6B7280', background: '#F3F4F6', borderRadius: 10, padding: '2px 8px' }}>
              📍 {analysis.detectedCountry === 'lebanon' ? 'لبنان' : analysis.detectedCountry === 'syria' ? 'سوريا' : 'لبنان/سوريا'}
            </span>
          )}
        </div>
      </div>

      {/* ── Section 1: Extracted Facts ── */}
      <CollapsibleSection
        icon="📊"
        title={isAr ? 'البيانات المستخرجة' : 'Extracted Facts'}
        count={analysis.extractedFacts.length}
        badgeColor="#1D4ED8"
        defaultOpen={true}
      >
        <ExtractedFactsTable facts={analysis.extractedFacts} isAr={isAr} />
      </CollapsibleSection>

      {/* ── Section 2: Related Procedures ── */}
      <CollapsibleSection
        icon="🔗"
        title={isAr ? 'المعاملات المرتبطة' : 'Related Procedures'}
        count={analysis.relatedProcedures.length}
        badgeColor="#1E40AF"
        defaultOpen={analysis.relatedProcedures.length > 0}
      >
        <RelatedProceduresPanel
          procedures={analysis.relatedProcedures}
          isAr={isAr}
          onStartFlow={onStartFlow}
        />
      </CollapsibleSection>

      {/* ── Section 3: Missing Requirements ── */}
      <CollapsibleSection
        icon="❗"
        title={isAr ? 'النواقص' : 'Missing Requirements'}
        count={analysis.missingInformation.length + analysis.missingDocuments.length}
        badgeColor="#DC2626"
        defaultOpen={analysis.missingInformation.length > 0 || analysis.missingDocuments.length > 0}
      >
        <MissingRequirementsPanel
          fields={analysis.missingInformation}
          documents={analysis.missingDocuments}
          isAr={isAr}
        />
      </CollapsibleSection>

      {/* ── Section 4: Risks ── */}
      <CollapsibleSection
        icon="⚠️"
        title={isAr ? 'المخاطر والتنبيهات' : 'Risks & Warnings'}
        count={analysis.risks.length}
        badgeColor={riskFg}
        defaultOpen={analysis.risks.some(r => r.level === 'high' || r.level === 'critical')}
      >
        <DocumentRiskPanel risks={analysis.risks} isAr={isAr} />
      </CollapsibleSection>

      {/* ── Section 5: Recommended Drafts ── */}
      <CollapsibleSection
        icon="📝"
        title={isAr ? 'النماذج والمسودات المقترحة' : 'Recommended Drafts'}
        count={analysis.recommendedDrafts.length}
        badgeColor="#7C3AED"
        defaultOpen={analysis.recommendedDrafts.length > 0}
      >
        <RecommendedDraftsPanel
          drafts={analysis.recommendedDrafts}
          isAr={isAr}
          onGenerate={setActiveDraft}
        />
      </CollapsibleSection>

      {/* ── Section 6: Next Actions ── */}
      <CollapsibleSection
        icon="🎯"
        title={isAr ? 'الخطوة التالية' : 'Next Steps'}
        defaultOpen={true}
      >
        <DocumentNextActions
          actions={analysis.nextActions}
          isAr={isAr}
          onAction={handleAction}
          onRequestHumanReview={handleHumanReview}
        />
      </CollapsibleSection>

      {/* ── Section 7: Evidence & Trust ── */}
      <CollapsibleSection
        icon="🔍"
        title={isAr ? 'المصادر والثقة' : 'Sources & Confidence'}
        defaultOpen={false}
      >
        <EvidencePanel
          evidence={analysis.evidence}
          confidence={analysis.confidence}
          isAr={isAr}
        />
      </CollapsibleSection>

      {/* ── Disclaimer ── */}
      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB', marginTop: 4 }}>
        <p style={{ fontSize: 10.5, color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
          ⚖️ {analysis.disclaimer}
        </p>
      </div>

      {/* Draft Modal */}
      {activeDraft && (
        <GenerateDraftModal
          draft={activeDraft}
          extractedFacts={analysis.extractedFacts}
          isAr={isAr}
          onClose={() => setActiveDraft(null)}
          onSend={onSendMessage}
        />
      )}
    </div>
  )
}
