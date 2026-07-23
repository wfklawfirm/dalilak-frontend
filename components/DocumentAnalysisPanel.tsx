'use client'

import React from 'react'
import { DocumentAnalysis, ContractRiskReview, ActionType } from '@/lib/types'
import RiskScoreCard from './RiskScoreCard'
import MissingDocumentsChecklist from './MissingDocumentsChecklist'
import { useLanguage } from '@/lib/LanguageContext'

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

const DOC_TYPE_EN: Record<string, string> = {
  lease_contract:    'Lease Contract',
  sale_contract:     'Sale Contract',
  power_of_attorney: 'Power of Attorney',
  civil_record:      'Civil Record',
  property_document: 'Property Document',
  company_document:  'Company Document',
  identity_document: 'Identity Document',
  invoice:           'Invoice',
  certificate:       'Certificate',
  correspondence:    'Official Correspondence',
  unknown:           'Document',
}

const CONF_STYLE: Record<string, React.CSSProperties> = {
  high:    { color: '#78350F', background: '#FFFBEB', border: '1px solid #FDE68A' },
  medium:  { color: '#B8860B', background: '#FFFBEB', border: '1px solid #FDE68A' },
  low:     { color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A' },
  unknown: { color: '#69645C', background: '#E6E2DC', border: '1px solid #D5CEC4' },
}

const CONF_AR: Record<string, string> = {
  high: 'عالية', medium: 'متوسطة', low: 'منخفضة', unknown: 'غير محدد',
}

const CONF_EN: Record<string, string> = {
  high: 'High', medium: 'Medium', low: 'Low', unknown: 'Unknown',
}

const WARN_CSS: Record<string, React.CSSProperties> = {
  critical: { background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.3)', color: '#8F1D2C' },
  warning:  { background: '#FFFBEB', border: '1px solid rgba(184,134,11,0.3)', color: '#92400E' },
  info:     { background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)', color: '#8F1D2C' },
}

const RISK_CLAUSE_STYLE: Record<string, React.CSSProperties> = {
  critical: { color: '#8F1D2C', background: '#F8EDEF' },
  high:     { color: '#92400E', background: '#FFFBEB' },
  medium:   { color: '#B8860B', background: '#FFFBEB' },
  low:      { color: '#69645C', background: '#E6E2DC' },
}

const RISK_AR: Record<string, string> = {
  critical: 'حرج', high: 'عالٍ', medium: 'متوسط', low: 'منخفض',
}

const RISK_EN: Record<string, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
}

const STRENGTH_STYLE: Record<string, React.CSSProperties> = {
  strong:     { color: '#78350F' },
  acceptable: { color: '#8F1D2C' },
  weak:       { color: '#B8860B' },
  missing:    { color: '#8F1D2C' },
  unclear:    { color: '#69645C' },
}

const STRENGTH_AR: Record<string, string> = {
  strong: 'قوية', acceptable: 'مقبولة', weak: 'ضعيفة', missing: 'مفقودة', unclear: 'غير واضحة',
}

const STRENGTH_EN: Record<string, string> = {
  strong: 'Strong', acceptable: 'Acceptable', weak: 'Weak', missing: 'Missing', unclear: 'Unclear',
}

function actionLabel(type: ActionType, isAr: boolean): string {
  const MAP_AR: Record<string, string> = {
    upload_document:       'رفع وثيقة',
    request_human_review:  'طلب مراجعة بشرية',
    verify_source:         'تحقق من المصدر',
    download_checklist:    'تحميل القائمة',
    ask_followup:          'اسأل سؤالاً متابعاً',
    analyze_document:      'تحليل الوثيقة',
    contract_review:       'مراجعة العقد',
  }
  const MAP_EN: Record<string, string> = {
    upload_document:       'Upload Document',
    request_human_review:  'Request Human Review',
    verify_source:         'Verify Source',
    download_checklist:    'Download Checklist',
    ask_followup:          'Ask Follow-up Question',
    analyze_document:      'Analyze Document',
    contract_review:       'Contract Review',
  }
  return (isAr ? MAP_AR[type] : MAP_EN[type]) || type
}

const ROW_S: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }
const LABEL_S: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#918B82', marginBottom: 6 }

export default function DocumentAnalysisPanel({ analysis, reviewResult, fileName, onRequestReview }: Props) {
  const { isAr } = useLanguage()
  const confLevel = analysis.confidence?.level || 'unknown'

  return (
    <>
    <style>{`@keyframes dapItem { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }`}</style>
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'Cairo','Inter',sans-serif", animation: 'fadeUp 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#741622' }}>
              {(isAr ? DOC_TYPE_AR[analysis.document_type] : DOC_TYPE_EN[analysis.document_type]) || analysis.document_type}
            </span>
            {analysis.detected_country && analysis.detected_country !== 'unknown' && (
              <span style={{ fontSize: 11, background: '#E6E2DC', color: '#69645C', padding: '2px 8px', borderRadius: 99 }}>
                {analysis.detected_country === 'lebanon' ? (isAr ? 'لبنان' : 'Lebanon') : analysis.detected_country}
              </span>
            )}
            {analysis.detected_language && (
              <span style={{ fontSize: 11, background: '#E6E2DC', color: '#69645C', padding: '2px 8px', borderRadius: 99 }}>
                {analysis.detected_language === 'ar' ? (isAr ? 'عربي' : 'Arabic') : analysis.detected_language === 'en' ? (isAr ? 'إنجليزي' : 'English') : analysis.detected_language}
              </span>
            )}
          </div>
          {fileName && <p style={{ fontSize: 11, color: '#918B82', margin: '3px 0 0' }}>{fileName}</p>}
        </div>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap', ...CONF_STYLE[confLevel] }}>
          {isAr ? `دقة ${CONF_AR[confLevel]}` : `${CONF_EN[confLevel]} accuracy`}
        </span>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', border: '1px solid #E6E2DC' }}>
          <p style={LABEL_S}>{isAr ? 'الملخص' : 'Summary'}</p>
          <p style={{ fontSize: 13, color: '#191713', lineHeight: 1.7, margin: 0 }}>{analysis.summary}</p>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analysis.warnings.map((w, i) => (
            <div key={i} style={{ borderRadius: 12, padding: '10px 14px', fontSize: 13, ...(WARN_CSS[w.level] || WARN_CSS.info), animation: 'dapItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 6) * 0.07}s` }}>
              <span style={{ fontWeight: 700, marginLeft: 4 }}>
                {isAr
                  ? (w.level === 'critical' ? 'تحذير حرج:' : w.level === 'warning' ? 'تنبيه:' : 'معلومة:')
                  : (w.level === 'critical' ? 'Critical Warning:' : w.level === 'warning' ? 'Warning:' : 'Info:')}
              </span>
              {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Extracted fields */}
      {analysis.extracted_fields?.length > 0 && (
        <div>
          <p style={LABEL_S}>{isAr ? 'البيانات المستخرجة' : 'Extracted Data'}</p>
          <div style={{ borderRadius: 12, border: '1px solid #E6E2DC', overflow: 'hidden' }}>
            {analysis.extracted_fields.map((f, i) => (
              <div key={i} style={{ ...ROW_S, padding: '9px 14px', borderBottom: i < analysis.extracted_fields.length - 1 ? '1px solid #E6E2DC' : 'none' }}>
                <span style={{ fontSize: 11, color: '#918B82', width: 110, flexShrink: 0 }}>{f.label}</span>
                <span style={{ fontSize: 13, color: '#191713', flex: 1 }}>{f.value}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {f.confidence === 'high'
                    ? <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#B45309"/></svg>
                    : f.confidence === 'medium'
                    ? <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#CA8A04"/></svg>
                    : <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#918B82" strokeWidth="1.5"/></svg>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties */}
      {analysis.parties && analysis.parties.length > 0 && (
        <div>
          <p style={LABEL_S}>{isAr ? 'الأطراف' : 'Parties'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {analysis.parties.map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 10, padding: '6px 12px', animation: 'dapItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                <p style={{ fontSize: 11, color: '#918B82', margin: 0 }}>{p.role}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#191713', margin: 0 }}>{p.name || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key facts */}
      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <div>
          <p style={LABEL_S}>{isAr ? 'الحقائق الأساسية' : 'Key Facts'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {analysis.key_facts.map((fact, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#2D1B0E' }}>
                <svg aria-hidden="true" width="5" height="5" viewBox="0 0 10 10" style={{ flexShrink: 0, marginTop: 5 }}><circle cx="5" cy="5" r="3.5" fill="#B8860B"/></svg>
                {fact}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing documents */}
      {analysis.missing_documents?.length > 0 && (
        <div>
          <p style={LABEL_S}>{isAr ? 'الوثائق الناقصة' : 'Missing Documents'}</p>
          <MissingDocumentsChecklist missingDocs={analysis.missing_documents} />
        </div>
      )}

      {/* Suggested actions */}
      {analysis.suggested_next_actions?.length > 0 && (
        <div>
          <p style={LABEL_S}>{isAr ? 'الإجراءات المقترحة' : 'Suggested Actions'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {analysis.suggested_next_actions.map((a, i) => (
              <button
                type="button"
                key={i}
                onClick={a.action_type === 'request_human_review' ? onRequestReview : undefined}
                onTouchStart={e => { e.currentTarget.style.background = 'rgba(107,39,55,0.16)'; e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.background = 'rgba(107,39,55,0.08)'; e.currentTarget.style.transform = 'scale(1)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,39,55,0.14)'; e.currentTarget.style.borderColor = 'rgba(107,39,55,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(107,39,55,0.08)'; e.currentTarget.style.borderColor = 'rgba(107,39,55,0.2)' }}
                style={{
                  fontSize: 13, background: 'rgba(107,39,55,0.08)', color: '#741622',
                  border: '1px solid rgba(107,39,55,0.2)', padding: '6px 12px', borderRadius: 10,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.14s, border-color 0.14s',
                  animation: 'dapItem 0.18s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 8) * 0.05}s`,
                }}
              >
                {a.label || actionLabel(a.action_type, isAr)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Contract Review Section ── */}
      {reviewResult && (
        <div style={{ borderTop: '1px solid #E6E2DC', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#741622', margin: 0 }}>{isAr ? 'مراجعة العقد' : 'Contract Review'}</p>

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
              <p style={LABEL_S}>{isAr ? 'بيانات العقد' : 'Contract Data'}</p>
              <div style={{ borderRadius: 12, border: '1px solid #E6E2DC', overflow: 'hidden' }}>
                {(Object.entries(reviewResult.extracted_facts) as [string, string | string[] | null | undefined][]).map(([k, v], idx, arr) => {
                  if (!v) return null
                  const label: Record<string, string> = isAr ? {
                    parties: 'الأطراف', subject: 'الموضوع', property: 'العقار',
                    duration: 'المدة', amount: 'المبلغ', currency: 'العملة',
                    payment_terms: 'الدفع', start_date: 'تاريخ البداية', end_date: 'تاريخ النهاية',
                  } : {
                    parties: 'Parties', subject: 'Subject', property: 'Property',
                    duration: 'Duration', amount: 'Amount', currency: 'Currency',
                    payment_terms: 'Payment', start_date: 'Start Date', end_date: 'End Date',
                  }
                  const display = Array.isArray(v) ? v.join('، ') : String(v)
                  return (
                    <div key={k} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: idx < arr.length - 1 ? '1px solid #E6E2DC' : 'none' }}>
                      <span style={{ fontSize: 11, color: '#918B82', width: 100, flexShrink: 0 }}>{label[k] || k}</span>
                      <span style={{ fontSize: 13, color: '#191713' }}>{display}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Party risk balance */}
          {reviewResult.party_risk_balance?.favors && (
            <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '12px 14px', border: '1px solid #E6E2DC' }}>
              <p style={LABEL_S}>{isAr ? 'توازن العقد' : 'Contract Balance'}</p>
              <p style={{ fontSize: 13, color: '#191713', margin: 0 }}>
                {reviewResult.party_risk_balance.favors === 'balanced'
                  ? (isAr ? 'العقد متوازن بين الطرفين' : 'The contract is balanced between both parties')
                  : reviewResult.party_risk_balance.favors === 'party_one'
                  ? (isAr ? 'العقد يميل لصالح الطرف الأول' : 'The contract favors party one')
                  : reviewResult.party_risk_balance.favors === 'party_two'
                  ? (isAr ? 'العقد يميل لصالح الطرف الثاني' : 'The contract favors party two')
                  : (isAr ? 'التوازن غير واضح' : 'Balance unclear')}
              </p>
              {reviewResult.party_risk_balance.notes && (
                <p style={{ fontSize: 11, color: '#918B82', margin: '4px 0 0' }}>{reviewResult.party_risk_balance.notes}</p>
              )}
            </div>
          )}

          {/* Key clauses */}
          {reviewResult.key_clauses_found?.length > 0 && (
            <div>
              <p style={LABEL_S}>{isAr ? 'البنود الأساسية' : 'Key Clauses'}</p>
              <div style={{ borderRadius: 12, border: '1px solid #E6E2DC', overflow: 'hidden' }}>
                {reviewResult.key_clauses_found.slice(0, 10).map((c, i) => (
                  <div key={i} style={{ ...ROW_S, padding: '9px 14px', borderBottom: i < Math.min(reviewResult.key_clauses_found.length, 10) - 1 ? '1px solid #E6E2DC' : 'none' }}>
                    <span style={{
                      flexShrink: 0, width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: c.found ? '#B45309' : '#F8EDEF', color: c.found ? '#fff' : '#8F1D2C',
                    }}>
                      {c.found
                        ? <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        : <svg aria-hidden="true" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>}
                    </span>
                    <span style={{ fontSize: 13, color: '#191713', flex: 1 }}>{c.clause}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, ...(STRENGTH_STYLE[c.strength] || {}) }}>
                      {(isAr ? STRENGTH_AR[c.strength] : STRENGTH_EN[c.strength]) || c.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing/weak clauses */}
          {reviewResult.missing_or_weak_clauses?.length > 0 && (
            <div>
              <p style={LABEL_S}>{isAr ? `بنود ناقصة أو ضعيفة (${reviewResult.missing_or_weak_clauses.length})` : `Missing or Weak Clauses (${reviewResult.missing_or_weak_clauses.length})`}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reviewResult.missing_or_weak_clauses.map((c, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #E6E2DC', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, animation: 'dapItem 0.2s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#191713', margin: 0 }}>{c.clause}</p>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap', ...(RISK_CLAUSE_STYLE[c.risk_level] || {}) }}>
                        {(isAr ? RISK_AR[c.risk_level] : RISK_EN[c.risk_level]) || c.risk_level}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#69645C', margin: 0 }}>{c.why_it_matters}</p>
                    <div style={{ background: '#F8EDEF', borderRadius: 10, padding: '10px 12px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8F1D2C', margin: '0 0 3px' }}>{isAr ? 'التوصية' : 'Recommendation'}</p>
                      <p style={{ fontSize: 11.5, color: '#69645C', margin: 0, lineHeight: 1.5 }}>{c.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall recommendation */}
          {reviewResult.overall_recommendation && (
            <div style={{ background: 'rgba(107,39,55,0.06)', border: '1.5px solid rgba(107,39,55,0.2)', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#741622', margin: '0 0 6px' }}>
                {reviewResult.overall_verdict === 'safe'
                  ? (isAr ? 'العقد آمن للمراجعة' : 'Contract is safe to review')
                  : reviewResult.overall_verdict === 'caution'
                  ? (isAr ? 'يحتاج تعديلات' : 'Needs amendments')
                  : (isAr ? 'مخاطر عالية' : 'High risk')}
              </p>
              <p style={{ fontSize: 12.5, color: '#69645C', margin: 0, lineHeight: 1.6 }}>
                {reviewResult.overall_recommendation}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
    </>
  )
}
