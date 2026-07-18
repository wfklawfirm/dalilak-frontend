// ProcedureFlowchart types
export type NodeType = 'start' | 'question' | 'document' | 'action' | 'authority' | 'risk' | 'draft' | 'human_review' | 'completion' | 'warning'
export type NodeStatus = 'not_started' | 'current' | 'completed' | 'blocked' | 'needs_review'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type VerificationStatus = 'verified' | 'partially_verified' | 'draft' | 'outdated'
export type ReadinessStatus = 'ready_for_review' | 'partially_ready' | 'not_ready'

export type NodeConfidence = 'low' | 'medium' | 'high'

export interface FlowchartSourceRef {
  title: string
  website?: string | null
}

export interface ProcedureFlowNode {
  id: string
  type: NodeType
  titleAr: string
  titleEn?: string
  descriptionAr?: string
  descriptionEn?: string
  status?: NodeStatus
  riskLevel?: RiskLevel
  requiredDocuments?: string[]
  relatedAuthority?: string
  estimatedDuration?: string
  tips?: string[]
  // أدلة الأصل (فقط للخرائط المولّدة بالذكاء الاصطناعي — lib/useFlowchart.ts):
  // المصادر الحقيقية المسترجعة من قاعدة المعرفة التي استند إليها توليد هذه الخطوة، ودرجة الثقة بها
  sourceRefs?: FlowchartSourceRef[] | null
  confidence?: NodeConfidence | null
}

export interface ProcedureFlowEdge {
  id: string
  from: string
  to: string
  labelAr?: string
  labelEn?: string
  condition?: string
}

export interface ProcedureFlowchart {
  procedureSlug: string
  titleAr: string
  titleEn: string
  country: string
  version: string
  verificationStatus: VerificationStatus
  estimatedDurationAr?: string
  estimatedDurationEn?: string
  nodes: ProcedureFlowNode[]
  edges: ProcedureFlowEdge[]
  // موجودة فقط في الخرائط المولّدة بالذكاء الاصطناعي (POST /flowchart/generate):
  // هل تم العثور على مصادر حقيقية في قاعدة المعرفة عند التوليد؟ إن كانت false، فالخارطة
  // اعتمدت فقط على المعطيات العامة المُرسلة من الواجهة دون أدلة مسترجعة — يجب عرض تنبيه للمستخدم.
  groundedInSources?: boolean
  generatedBy?: 'ai' | string
}

// TransactionCompletionScore types
export interface ScoreBreakdown {
  documentsScore: number
  dataScore: number
  consistencyScore: number
  riskScore: number
}

export interface TransactionCompletionScore {
  transactionId: string
  score: number
  status: ReadinessStatus
  breakdown: ScoreBreakdown
  missingCriticalItems: string[]
  blockingIssues: string[]
  recommendedNextAction: string
  lastUpdated?: string
}

// DraftTemplateDetail types
export type DraftFieldType = 'text' | 'textarea' | 'date' | 'select' | 'number'

export interface DraftField {
  key: string
  labelAr: string
  labelEn?: string
  type: DraftFieldType
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface DraftTemplateDetail {
  slug: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  icon: string
  fields: DraftField[]
}

export interface GeneratedDraft {
  templateSlug: string
  content: string
  disclaimer: string
  generatedAt: string
  requiresReview: boolean
}

// ActionPackage, AutopilotSession, AuthorityRecord
export interface ActionPackage {
  id: string
  titleAr: string
  titleEn: string
  steps: string[]
  estimatedTime: string
  requiredDocuments: string[]
}

export interface AutopilotSession {
  sessionId: string
  procedureSlug: string
  status: 'waiting_answer' | 'processing' | 'complete' | 'error'
  currentStepIndex: number
  totalSteps: number
  answers: Record<string, string>
  uploadedDocIds: string[]
  nextQuestion?: {
    questionAr: string
    questionEn: string
    key: string
    type: 'text' | 'select' | 'file' | 'boolean'
    options?: string[]
  }
}

export interface AuthorityRecord {
  slug: string
  nameAr: string
  nameEn: string
  country: string
  type: 'ministry' | 'registry' | 'notary' | 'court' | 'municipality' | 'other'
  proceduresHandled: string[]
  formsLinked: string[]
  confidence: 'high' | 'medium' | 'low'
  website?: string
  phone?: string
  address?: string
}

// HumanReviewRequest, SharePackage
export type ReviewUrgency = 'low' | 'normal' | 'high' | 'urgent'
export type ReviewStatus = 'pending' | 'assigned' | 'in_review' | 'completed' | 'cancelled'

export interface HumanReviewRequest {
  id: string
  userId: string
  requestType: string
  urgency: ReviewUrgency
  summary: string
  status: ReviewStatus
  createdAt: string
  transactionId?: string
  documentIds?: string[]
  message?: string
}

export type SharePackageType = 'checklist' | 'document_bundle' | 'procedure_guide' | 'draft'

export interface SharePackage {
  shareId: string
  type: SharePackageType
  titleAr: string
  titleEn?: string
  transactionId?: string
  expiresAt?: string
  message?: string
}
