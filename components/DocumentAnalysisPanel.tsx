'use client'

import React from 'react'
import { DocumentAnalysis, ContractRiskReview, ActionType } from '@/lib/types'
import RiskScoreCard from './RiskScoreCard'
import MissingDocumentsChecklist from './MissingDocumentsChecklist'

interface Props {
  analysis: DocumentAnalysis
  reviewResult?: ContractRiskReview | null
  fileName?: string
  onRequestReview?: () => void
  lang?: 'ar' | 'en'
}

const DOC_TYPE_AR: Record<string, string> = {
  lease_contract:    'عقد إيجار',
  sale_contract:     'عقد بيع',
  power_of_attorney: 'وكالة قانونية',
  civil_record:      'سجل مدني',
  property_document: 'وثيقة عقارية',
  company_document:  'وثيقة شركة',
  identity_document: 'وثيقة هوية',
  invoice:           'فاتورة',
  certificate:       'شهادة',
  correspondence:    'مراسلة رسمية',
  unknown:           'وثيقة',
}

const CONF_STYLE: Record<string, React.CSSProperties> = {
  high:    { color: '#16a34a', background: '#F0FDF4', border: '1px solid #BBF7D0' },
  medium:  { color: '#B8860B', background: '#FFFBEB', border: '1px solid #FDE68A' },
  low:     { color: '#ea580c', background: '#FFF7ED', border: '1px solid #FED7AA' },
  unknown: { color: '#6B7280', background: '#F3F4F6', border: '1px solid #E5E7EB' },
}

const CONF_AR: Record<string, string> = {
  high: 'عالية', medium: 'متوسطة', low: 'منخفضة', unknown: 'غير محدد',
}

const WARN_CSS: Record<string, React.CSSProperties> = {
  critical: { background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.3)', color: '#991B1B' },
  warning:  { background: '#FFF7ED', border: '1px solid rgba(234,88,12,0.3)', color: '#9A3412' },
  info:     { background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.2)', color: '#8B1A1A' },
}

const RISK_CLAUSE_STYLE: Record<string, React.CSSProperties> = {
  critical: { color: '#991B1B', background: '#FEF2F2' },
  high:     { color: '#9A3412', background: '#FFF7ED' },
  medium:   { color: '#B8860B', background: '#FFFBEB' },
  low:      { color: '#6B7280', background: '#F3F4F6' },
}

const RISK_AR: Record<string, string> = {
  critical: 'حرج', high: 'عالٍ', medium: 'متوسط', low: 'منخفض',
}

const STRENGTH_STYLE: Record<string, React.CSSProperties> = {
  strong:     { color: '#16a34a' },
  acceptable: { color: '#8B1A1A' },
  weak:       { color: '#B8860B' },
  missing:    { color: '#991B1B' },
  unclear:    { color: '#6B7280' },
}

const STRENGTH_AR: Record<string, string> = {
  strong: 'قوية', acceptable: 'مقبولة', weak: 'ضعيفة', missing: 'مفقودة', unclear: 'غير واضحة',
}

function actionLabel(type: ActionType): string {
  const MAP: Record<string, string> = {
    upload_document:       'رفع وثيقة',
    request_human_review:  'طلب مراجعة بشرية',
    verify_source:         'تحقق من المصدر',
    download_checklist:    'تحميل القائمة',
    ask_followup:          'اسأل سؤالاً متابعاً',
    analyze_document:      'تحليل الوثيقة',
    contract_review:       'مراجعة العقد',
  }
  return MAP[type] || type
}

const ROW_S: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }
const LABEL_S: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#9C8E80', marginBottom: 6 }

export default function DocumentAnalysisPanel({ analysis, reviewResult, fileName, onRequestReview }: Props) {
  const confLevel = analysis.confidence?.level || 'unknown'

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'Cairo','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#6b2737' }}>
              {DOC_TYPE_AR[analysis.document_type] || analysis.document_type}
            </span>
            {analysis.detected_country && analysis.detected_country !== 'unknown' && (
              <span style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 99 }}>
                {analysis.detected_country === 'lebanon' ? 'لبنان' : analysis.detected_country}
              </span>
            )}
            {analysis.detected_language && (
              <span style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 99 }}>
                {analysis.detected_language === 'ar' ? 'عربي' : analysis.detected_language === 'en' ? 'إنجليزي' : analysis.detected_language}
              </span>
            )}
          </div>
          {fileName && <p style={{ fontSize: 11, color: '#9CA3AF', margin: '3px 0 0' }}>{fileName}</p>}
        </div>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap', ...CONF_STYLE[confLevel] }}>
          دقة {CONF_AR[confLevel]}
        </span>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', border: '1px solid #EAE4D9' }}>
          <p style={LABEL_S}>الملخص</p>
          <p style={{ fontSize: 13, color: '#1A1208', lineHeight: 1.7, margin: 0 }}>{analysis.summary}</p>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analysis.warnings.map((w, i) => (
            <div key={i} style={{ borderRadius: 12, padding: '10px 14px', fontSize: 13, ...(WARN_CSS[w.level] || WARN_CSS.info) }}>
              <span style={{ fontWeight: 700, marginLeft: 4 }}>
                {w.level === 'critical' ? 'تحذير حرج:' : w.level === 'warning' ? 'تنبيه:' : 'معلومة:'}
              </span>
              {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Extracted fields */}
      {analysis.extracted_fields?.length > 0 && (
        <div>
          <p style={LABEL_S}>البيانات المستخرجة</p>
          <div style={{ borderRadius: 12, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
            {analysis.extracted_fields.map((f, i) => (
              <div key={i} style={{ ...ROW_S, padding: '9px 14px', borderBottom: i < analysis.extracted_fields.length - 1 ? '1px solid #EAE4D9' : 'none' }}>
                <span style={{ fontSize: 11, color: '#9C8E80', width: 110, flexShrink: 0 }}>{f.label}</span>
                <span style={{ fontSize: 13, color: '#1A1208', flex: 1 }}>{f.value}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {f.confidence === 'high'
                    ? <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#16A34A"/></svg>
                    : f.confidence === 'medium'
                    ? <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#CA8A04"/></svg>
                    : <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/></svg>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties */}
      {analysis.parties && analysis.parties.length > 0 && (
        <div>
          <p style={LABEL_S}>الأطراف</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analysis.parties.map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #EAE4D9', borderRadius: 10, padding: '6px 12px' }}>
                <p style={{ fontSize: 11, color: '#9C8E80', margin: 0 }}>{p.role}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: 0 }}>{p.name || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key facts */}
      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <div>
          <p style={LABEL_S}>الحقائق الأساسية</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {analysis.key_facts.map((fact, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                <svg width="5" height="5" viewBox="0 0 10 10" style={{ flexShrink: 0, marginTop: 5 }}><circle cx="5" cy="5" r="3.5" fill="#B8860B"/></svg>
                {fact}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing documents */}
      {analysis.missing_documents?.length > 0 && (
        <div>
          <p style={LABEL_S}>الوثائق الناقصة</p>
          <MissingDocumentsChecklist missingDocs={analysis.missing_documents} />
        </div>
      )}

      {/* Suggested actions */}
      {analysis.suggested_next_actions?.length > 0 && (
        <div>
          <p style={LABEL_S}>الإجراءات المقترحة</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {analysis.suggested_next_actions.map((a, i) => (
              <button
                key={i}
                onClick={a.action_type === 'request_human_review' ? onRequestReview : undefined}
                style={{
                  fontSize: 13, background: 'rgba(107,39,55,0.08)', color: '#6b2737',
                  border: '1px solid rgba(107,39,55,0.2)', padding: '6px 12px', borderRadius: 10,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {a.label || actionLabel(a.action_type)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Contract Review Section ── */}
      {reviewResult && (
        <div style={{ borderTop: '1px solid #EAE4D9', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#6b2737', margin: 0 }}>مراجعة العقد</p>

          {/* Risk score */}
          {reviewResult.risk_score && (
            <RiskScoreCard
              risk={{
                level: reviewResult.risk_score.level as 'low' | 'medium' | 'high' | 'critical' | 'unknown',
                score: typeof reviewResult.risk_score.score === 'number' ? reviewResult.risk_score.score : undefined,
                reasons: reviewResult.risk_score.reasons || [],
              }}
              onRequestReview={onRequestReview}
            />
          )}

          {/* Extracted facts */}
          {reviewResult.extracted_facts && Object.values(reviewResult.extracted_facts).some(Boolean) && (
            <div>
              <p style={LABEL_S}>بيانات العقد</p>
              <div style={{ borderRadius: 12, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
                {(Object.entries(reviewResult.extracted_facts) as [string, string | string[] | null | undefined][]).map(([k, v], idx, arr) => {
                  if (!v) return null
                  const label: Record<string, string> = {
                    parties: 'الأطراف', subject: 'الموضوع', property: 'العقار',
                    duration: 'المدة', amount: 'المبلغ', currency: 'العملة',
                    payment_terms: 'الدفع', start_date: 'تاريخ البداية', end_date: 'تاريخ النهاية',
                  }
                  const display = Array.isArray(v) ? v.join('، ') : String(v)
                  return (
                    <div key={k} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: idx < arr.length - 1 ? '1px solid #EAE4D9' : 'none' }}>
                      <span style={{ fontSize: 11, color: '#9C8E80', width: 100, flexShrink: 0 }}>{label[k] || k}</span>
                      <span style={{ fontSize: 13, color: '#1A1208' }}>{display}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Party risk balance */}
          {reviewResult.party_risk_balance?.favors && (
            <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', border: '1px solid #EAE4D9' }}>
              <p style={LABEL_S}>توازن العقد</p>
              <p style={{ fontSize: 13, color: '#1A1208', margin: 0 }}>
                {reviewResult.party_risk_balance.favors === 'balanced'
                  ? 'العقد متوازن بين الطرفين'
                  : reviewResult.party_risk_balance.favors === 'party_one'
                  ? 'العقد يميل لصالح الطرف الأول'
                  : reviewResult.party_risk_balance.favors === 'party_two'
                  ? 'العقد يميل لصالح الطرف الثاني'
                  : 'التوازن غير واضح'}
              </p>
              {reviewResult.party_risk_balance.notes && (
                <p style={{ fontSize: 11, color: '#9C8E80', margin: '4px 0 0' }}>{reviewResult.party_risk_balance.notes}</p>
              )}
            </div>
          )}

          {/* Key clauses */}
          {reviewResult.key_clauses_found?.length > 0 && (
            <div>
              <p style={LABEL_S}>البنود الأساسية</p>
              <div style={{ borderRadius: 12, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
                {reviewResult.key_clauses_found.slice(0, 10).map((c, i) => (
                  <div key={i} style={{ ...ROW_S, padding: '9px 14px', borderBottom: i < Math.min(reviewResult.key_clauses_found.length, 10) - 1 ? '1px solid #EAE4D9' : 'none' }}>
                    <span style={{
                      flexShrink: 0, width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: c.found ? '#16a34a' : '#FEF2F2', color: c.found ? '#fff' : '#DC2626',
                    }}>
                      {c.found
                        ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>}
                    </span>
                    <span style={{ fontSize: 13, color: '#1A1208', flex: 1 }}>{c.clause}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, ...(STRENGTH_STYLE[c.strength] || {}) }}>
                      {STRENGTH_AR[c.strength] || c.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing/weak clauses */}
          {reviewResult.missing_or_weak_clauses?.length > 0 && (
            <div>
              <p style={LABEL_S}>بنود ناقصة أو ضعيفة ({reviewResult.missing_or_weak_clauses.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reviewResult.missing_or_weak_clauses.map((c, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #EAE4D9', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#1A1208', margin: 0 }}>{c.clause}</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap', ...(RISK_CLAUSE_STYLE[c.risk_level] || {}) }}>
                        {RISK_AR[c.risk_level] || c.risk_level}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{c.why_it_matters}</p>
                    <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8B1A1A', margin: '0 0 3px' }}>التوصية</p>
                      <p style={{ fontSize: 11, color: '#6b2737', margin: 0 }}>{c.recommendation}</p>
                    </div>
                    {c.suggested_clause_draft && (
                      <div style={{ background: '#FAFAF8', borderRadius: 10, padding: '10px 12px', border: '1px solid #EAE4D9' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#9C8E80', margin: '0 0 4px' }}>نص مقترح</p>
                        <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, margin: 0 }}>{c.suggested_clause_draft}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical recommendations */}
          {reviewResult.practical_recommendations?.length > 0 && (
            <div>
              <p style={LABEL_S}>توصيات عملية</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reviewResult.practical_recommendations.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                    <span style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(107,39,55,0.08)', color: '#6b2737',
                      fontSize: 11, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for lawyer */}
          {reviewResult.questions_for_lawyer?.length > 0 && (
            <div style={{ background: 'rgba(184,134,11,0.05)', border: '1px solid rgba(184,134,11,0.2)', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B8860B', margin: '0 0 8px' }}>أسئلة لمحاميك</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reviewResult.questions_for_lawyer.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                    <span style={{ color: '#B8860B', flexShrink: 0, display: 'inline-flex', alignItems: 'center', marginTop: 2 }}>
                      <svg width="6" height="6" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="#B8860B" transform="rotate(45 5 5)"/></svg>
                    </span>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {reviewResult.disclaimer && (
            <p style={{ fontSize: 11, color: '#9C8E80', background: '#FAFAF8', borderRadius: 10, padding: '10px 12px', lineHeight: 1.6, margin: 0 }}>
              {reviewResult.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
