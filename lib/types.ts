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

export type Country = 'lebanon' | 'syria' | 'both'
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
