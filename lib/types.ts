// ── Dalilak AI — Shared TypeScript Types ──────────────────────────────────────

// ── Agent Response (structured AI output) ────────────────────────────────────

export interface AgentSource {
  title: string
  type?: 'official' | 'internal' | 'user_uploaded' | 'unknown'
  url?: string
  excerpt?: string
  lastUpdated?: string
  ministry?: string
  score?: number   // relevance score from Qdrant (0–1)
  snippet?: string // first 300 chars of source text, shown when citation is active
}

export interface AgentAuthority {
  name?: string
  description?: string
  locationNotes?: string
  phone?: string
  website?: string
  workingHours?: string
}

export interface AgentFee {
  label: string
  amount?: string
  notes?: string
}

export interface AgentForm {
  title: string
  type?: 'official' | 'draft' | 'unknown'
  url?: string
  notes?: string
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown'

/**
 * Structured AI response model.
 * The backend may return this as JSON (future), or it is parsed from markdown headers.
 * If neither works, rawTextFallback is used.
 */
export interface AgentResponse {
  summary?: string
  requiredDocuments?: string[]
  steps?: string[]
  authority?: AgentAuthority
  fees?: AgentFee[]
  forms?: AgentForm[]
  nextAction?: string
  warnings?: string[]
  sources?: AgentSource[]
  confidence: ConfidenceLevel
  lastReviewed?: string
  disclaimer?: string
  rawTextFallback?: string
}

// ── Procedure Data Model ──────────────────────────────────────────────────────

export type Country = 'lebanon' | 'syria' | 'both' | 'unknown'
export type Complexity = 'easy' | 'medium' | 'complex'
export type ProcedureStatus = 'active' | 'inactive' | 'draft'

export interface RequiredDocument {
  name_ar: string
  name_en: string
  notes_ar?: string
  notes_en?: string
  original_required?: boolean
  copies_required?: number
}

export interface ProcedureStep {
  step: number
  title_ar: string
  title_en: string
  description_ar?: string
  description_en?: string
  authority?: string
  duration?: string
  fee?: string
}

export interface Authority {
  type?: 'ministry' | 'municipality' | 'court' | 'notary' | 'registry' | 'security' | 'tax' | 'other'
  name_ar: string
  name_en: string
  ministry_ar?: string
  ministry_en?: string
  address_ar?: string
  address_en?: string
  phone?: string
  website?: string
  workingHours_ar?: string
  workingHours_en?: string
}

export interface ProcedureFee {
  label_ar: string
  label_en: string
  amount?: string
  notes_ar?: string
  notes_en?: string
}

export interface ProcedureForm {
  title_ar: string
  title_en: string
  type: 'official' | 'draft' | 'unknown'
  url?: string
  fileType?: 'pdf' | 'word' | 'link' | 'unknown'
  notes_ar?: string
  notes_en?: string
  lastReviewed?: string
}

export interface ProcedureSource {
  title: string
  type: 'official' | 'internal' | 'unknown'
  url?: string
  lastReviewed?: string
}

export interface Procedure {
  slug: string
  icon: string
  country: Country
  category_ar: string
  category_en: string
  categorySlug: string
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  complexity: Complexity
  estimatedDuration_ar?: string
  estimatedDuration_en?: string
  requiredDocuments: RequiredDocument[]
  steps: ProcedureStep[]
  authority?: Authority
  fees: ProcedureFee[]
  forms: ProcedureForm[]
  sources: ProcedureSource[]
  tags: string[]
  confidence: ConfidenceLevel
  lastReviewed?: string
  status: ProcedureStatus
  /** Chat prompt to trigger AI explanation (AR) */
  chatPrompt_ar: string
  /** Chat prompt to trigger AI explanation (EN) */
  chatPrompt_en: string
}

// ── Chat Message ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  sources?: AgentSource[]
  confidence?: ConfidenceLevel
  queryType?: string
}

// ── User Workspace (local storage) ───────────────────────────────────────────

export interface SavedChecklist {
  id: string
  procedureTitle: string
  content: string
  savedAt: number
}

export interface SavedProcedure {
  id: string
  slug: string
  title_ar: string
  title_en: string
  savedAt: number
}

// ── Form / Document Library ───────────────────────────────────────────────────

export interface FormItem {
  slug: string
  icon: string
  title_ar: string
  title_en: string
  authority_ar: string
  authority_en: string
  ministry_ar: string
  ministry_en: string
  type: 'official' | 'draft' | 'unknown'
  fileType: 'pdf' | 'word' | 'link' | 'unknown'
  url?: string
  country: Country
  category_ar: string
  category_en: string
  relatedProcedures: string[]
  lastReviewed?: string
  chatPrompt_ar: string
  chatPrompt_en: string
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export type FeedbackRating = 'up' | 'down'

export interface FeedbackEntry {
  question: string
  answer: string
  rating: FeedbackRating
  confidence?: ConfidenceLevel
  timestamp: number
}

// ═══════════════════════════════════════════════════════════════
//  Phase 1 — Transaction Intelligence Contracts
// ═══════════════════════════════════════════════════════════════

// Country is defined above (extended to include 'unknown')

export type UserType =
  | 'citizen'
  | 'lawyer'
  | 'accountant'
  | 'company'
  | 'expat'
  | 'service_office'
  | 'ngo'

export type TransactionStatus =
  | 'draft'
  | 'in_progress'
  | 'ready'
  | 'needs_review'
  | 'completed'
  | 'archived'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown'

export type RecommendedAction =
  | 'continue'
  | 'verify'
  | 'lawyer_review'
  | 'admin_review'
  | 'human_support'

export type ActionType =
  | 'upload_document'
  | 'download_checklist'
  | 'generate_pdf'
  | 'generate_docx'
  | 'start_guided_flow'
  | 'ask_followup'
  | 'request_human_review'
  | 'verify_source'
  | 'save_transaction'
  | 'continue_transaction'
  | 'analyze_document'
  | 'contract_review'
  | 'none'

export interface RiskScore {
  level: RiskLevel
  score?: number
  reasons: string[]
  recommendedAction: RecommendedAction
  factors?: string[]
}

export interface ConfidenceSummary {
  level: 'high' | 'medium' | 'low' | 'unknown'
  reason?: string | null
  sourceCoverage?: 'strong' | 'partial' | 'weak' | 'none'
}

export interface NextAction {
  id: string
  label: string
  description?: string
  actionType: ActionType
  locked?: boolean
  requiredPlan?: 'trial' | 'paid' | 'admin'
}

export interface MissingDocument {
  id: string
  title: string
  required: boolean
  reason: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'missing' | 'uploaded' | 'needs_review' | 'not_applicable'
  relatedProcedureSlug?: string
}

export interface TransactionFile {
  id: string
  user_id?: string
  title: string
  procedure_slug?: string | null
  country: string
  user_type?: string | null
  status: TransactionStatus
  summary?: string | null
  required_documents: Array<{ title: string; required: boolean; notes?: string }>
  uploaded_doc_ids: string[]
  missing_documents: MissingDocument[]
  steps: Array<{ order?: number; title: string; description?: string; authority?: string }>
  risk_level?: RiskLevel | null
  risk_score?: number | null
  risk_reasons: string[]
  next_actions: NextAction[]
  sources: Array<{ title: string; type?: string; ministry?: string }>
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type DocumentType =
  | 'lease_contract'
  | 'sale_contract'
  | 'power_of_attorney'
  | 'civil_record'
  | 'property_document'
  | 'company_document'
  | 'identity_document'
  | 'invoice'
  | 'certificate'
  | 'correspondence'
  | 'unknown'

export interface ExtractedField {
  label: string
  value: string
  confidence: 'high' | 'medium' | 'low'
}

export interface DocumentWarning {
  level: 'info' | 'warning' | 'critical'
  message: string
}

export interface DocumentAnalysis {
  document_type: DocumentType
  detected_country?: string
  detected_language?: string
  document_date?: string | null
  extracted_fields: ExtractedField[]
  parties?: Array<{ role: string; name: string | null }>
  key_facts?: string[]
  related_procedures?: string[]
  missing_documents: MissingDocument[]
  warnings: DocumentWarning[]
  suggested_next_actions: Array<{ label: string; action_type: ActionType }>
  confidence: ConfidenceSummary
  summary: string
}

export interface ContractClause {
  clause: string
  found: boolean
  strength: 'strong' | 'acceptable' | 'weak' | 'missing' | 'unclear'
  notes?: string | null
}

export interface MissingClause {
  clause: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  why_it_matters: string
  recommendation: string
  suggested_clause_draft?: string | null
}

export interface ContractRiskReview {
  document_type: string
  summary: string
  extracted_facts: {
    parties?: string[]
    subject?: string | null
    property?: string | null
    duration?: string | null
    amount?: string | null
    currency?: string | null
    payment_terms?: string | null
    start_date?: string | null
    end_date?: string | null
  }
  key_clauses_found: ContractClause[]
  missing_or_weak_clauses: MissingClause[]
  party_risk_balance: {
    favors?: 'party_one' | 'party_two' | 'balanced' | 'unclear'
    notes: string
  }
  practical_recommendations: string[]
  questions_for_lawyer: string[]
  risk_score: RiskScore
  confidence: ConfidenceSummary
  disclaimer: string
}

export interface UploadedDocumentMeta {
  id: string
  file_name: string
  file_type: string
  file_size?: number | null
  doc_type?: string | null
  detected_country?: string | null
  has_analysis: boolean
  has_risk_review: boolean
  created_at?: string
  transaction_id?: string | null
}
