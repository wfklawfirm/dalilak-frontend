'use client'

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
  lease_contract:  'عقد إيجار',
  sale_contract:   'عقد بيع',
  power_of_attorney: 'وكالة قانونية',
  civil_record:    'سجل مدني',
  property_document: 'وثيقة عقارية',
  company_document: 'وثيقة شركة',
  identity_document: 'وثيقة هوية',
  invoice:         'فاتورة',
  certificate:     'شهادة',
  correspondence:  'مراسلة رسمية',
  unknown:         'وثيقة',
}

const CONF_COLOR: Record<string, string> = {
  high:    'text-green-700 bg-green-50 border-green-200',
  medium:  'text-yellow-700 bg-yellow-50 border-yellow-200',
  low:     'text-orange-700 bg-orange-50 border-orange-200',
  unknown: 'text-gray-600 bg-gray-50 border-gray-200',
}

const CONF_AR: Record<string, string> = {
  high: 'عالية', medium: 'متوسطة', low: 'منخفضة', unknown: 'غير محدد',
}

const WARN_STYLE: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  warning:  'bg-orange-50 border-orange-200 text-orange-800',
  info:     'bg-blue-50 border-blue-200 text-blue-800',
}

const RISK_CLAUSE_COLOR: Record<string, string> = {
  critical: 'text-red-700 bg-red-50',
  high:     'text-orange-700 bg-orange-50',
  medium:   'text-yellow-700 bg-yellow-50',
  low:      'text-gray-600 bg-gray-50',
}

const RISK_AR: Record<string, string> = {
  critical: 'حرج', high: 'عالٍ', medium: 'متوسط', low: 'منخفض',
}

const STRENGTH_COLOR: Record<string, string> = {
  strong:     'text-green-700',
  acceptable: 'text-blue-700',
  weak:       'text-yellow-700',
  missing:    'text-red-700',
  unclear:    'text-gray-500',
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

export default function DocumentAnalysisPanel({ analysis, reviewResult, fileName, onRequestReview }: Props) {
  const confLevel = analysis.confidence?.level || 'unknown'

  return (
    <div dir="rtl" className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#6b2737]">
              {DOC_TYPE_AR[analysis.document_type] || analysis.document_type}
            </span>
            {analysis.detected_country && analysis.detected_country !== 'unknown' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {analysis.detected_country === 'lebanon' ? 'لبنان' : analysis.detected_country}
              </span>
            )}
            {analysis.detected_language && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {analysis.detected_language === 'ar' ? 'عربي' : analysis.detected_language === 'en' ? 'إنجليزي' : analysis.detected_language}
              </span>
            )}
          </div>
          {fileName && <p className="text-xs text-gray-400 mt-1">{fileName}</p>}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CONF_COLOR[confLevel]}`}>
          دقة {CONF_AR[confLevel]}
        </span>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">الملخص</p>
          <p className="text-sm text-gray-800 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings?.length > 0 && (
        <div className="space-y-2">
          {analysis.warnings.map((w, i) => (
            <div
              key={i}
              className={`rounded-xl border px-4 py-3 text-sm ${WARN_STYLE[w.level] || WARN_STYLE.info}`}
            >
              <span className="font-medium ml-1">
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
          <p className="text-xs font-semibold text-gray-500 mb-2">البيانات المستخرجة</p>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {analysis.extracted_fields.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs text-gray-500 w-32 flex-shrink-0">{f.label}</span>
                <span className="text-sm text-gray-900 flex-1">{f.value}</span>
                <span className={`text-xs ${f.confidence === 'high' ? 'text-green-600' : f.confidence === 'medium' ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {f.confidence === 'high' ? '●' : f.confidence === 'medium' ? '◑' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties */}
      {analysis.parties && analysis.parties.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">الأطراف</p>
          <div className="flex flex-wrap gap-2">
            {analysis.parties.map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <p className="text-xs text-gray-500">{p.role}</p>
                <p className="text-sm font-medium text-gray-900">{p.name || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key facts */}
      {analysis.key_facts && analysis.key_facts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">الحقائق الأساسية</p>
          <ul className="space-y-1">
            {analysis.key_facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] flex-shrink-0 mt-1.5" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing documents */}
      {analysis.missing_documents?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">الوثائق الناقصة</p>
          <MissingDocumentsChecklist
            missingDocs={analysis.missing_documents}
          />
        </div>
      )}

      {/* Suggested actions */}
      {analysis.suggested_next_actions?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">الإجراءات المقترحة</p>
          <div className="flex flex-wrap gap-2">
            {analysis.suggested_next_actions.map((a, i) => (
              <button
                key={i}
                onClick={a.action_type === 'request_human_review' ? onRequestReview : undefined}
                className="text-sm bg-[#6b2737]/10 text-[#6b2737] hover:bg-[#6b2737]/20 border border-[#6b2737]/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                {a.label || actionLabel(a.action_type)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Contract Review Section ── */}
      {reviewResult && (
        <div className="border-t border-gray-200 pt-5 space-y-5">
          <p className="text-sm font-bold text-[#6b2737]">مراجعة العقد</p>

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
              <p className="text-xs font-semibold text-gray-500 mb-2">بيانات العقد</p>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                {(Object.entries(reviewResult.extracted_facts) as [string, string | string[] | null | undefined][]).map(([k, v]) => {
                  if (!v) return null
                  const label: Record<string, string> = {
                    parties: 'الأطراف', subject: 'الموضوع', property: 'العقار',
                    duration: 'المدة', amount: 'المبلغ', currency: 'العملة',
                    payment_terms: 'الدفع', start_date: 'تاريخ البداية', end_date: 'تاريخ النهاية',
                  }
                  const display = Array.isArray(v) ? v.join('، ') : String(v)
                  return (
                    <div key={k} className="flex gap-3 px-4 py-2.5">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label[k] || k}</span>
                      <span className="text-sm text-gray-900">{display}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Party risk balance */}
          {reviewResult.party_risk_balance?.favors && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">توازن العقد</p>
              <p className="text-sm text-gray-800">
                {reviewResult.party_risk_balance.favors === 'balanced'
                  ? 'العقد متوازن بين الطرفين'
                  : reviewResult.party_risk_balance.favors === 'party_one'
                  ? 'العقد يميل لصالح الطرف الأول'
                  : reviewResult.party_risk_balance.favors === 'party_two'
                  ? 'العقد يميل لصالح الطرف الثاني'
                  : 'التوازن غير واضح'}
              </p>
              {reviewResult.party_risk_balance.notes && (
                <p className="text-xs text-gray-500 mt-1">{reviewResult.party_risk_balance.notes}</p>
              )}
            </div>
          )}

          {/* Key clauses */}
          {reviewResult.key_clauses_found?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">البنود الأساسية</p>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                {reviewResult.key_clauses_found.slice(0, 10).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs
                      ${c.found ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600'}`}>
                      {c.found ? '✓' : '✕'}
                    </span>
                    <span className="text-sm text-gray-900 flex-1">{c.clause}</span>
                    <span className={`text-xs font-medium ${STRENGTH_COLOR[c.strength] || ''}`}>
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
              <p className="text-xs font-semibold text-gray-500 mb-2">
                بنود ناقصة أو ضعيفة ({reviewResult.missing_or_weak_clauses.length})
              </p>
              <div className="space-y-3">
                {reviewResult.missing_or_weak_clauses.map((c, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">{c.clause}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_CLAUSE_COLOR[c.risk_level] || ''}`}>
                        {RISK_AR[c.risk_level] || c.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{c.why_it_matters}</p>
                    <div className="bg-blue-50 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">التوصية</p>
                      <p className="text-xs text-blue-800">{c.recommendation}</p>
                    </div>
                    {c.suggested_clause_draft && (
                      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1">نص مقترح</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{c.suggested_clause_draft}</p>
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
              <p className="text-xs font-semibold text-gray-500 mb-2">توصيات عملية</p>
              <ol className="space-y-1.5">
                {reviewResult.practical_recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6b2737]/10 text-[#6b2737] text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Questions for lawyer */}
          {reviewResult.questions_for_lawyer?.length > 0 && (
            <div className="bg-[#B8860B]/5 border border-[#B8860B]/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#B8860B] mb-2">أسئلة لمحاميك</p>
              <ul className="space-y-1.5">
                {reviewResult.questions_for_lawyer.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-[#B8860B] flex-shrink-0">◆</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
            {reviewResult.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
