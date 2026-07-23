// ── Universal Document Intelligence — Types + Draft Map ──────────────────────
// Phase: Universal Document Intelligence Engine
// All TypeScript contracts for document analysis, draft generation, and the
// configurable document-type → recommended-drafts map.

// ── Core Types ────────────────────────────────────────────────────────────────

export type DocCategory =
  | 'contract'
  | 'property'
  | 'civil_status'
  | 'notarial'
  | 'company'
  | 'tax'
  | 'judicial'
  | 'administrative'
  | 'expat_consular'
  | 'unknown'

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown'
export type Priority        = 'low' | 'medium' | 'high' | 'critical'
export type SourceType      = 'user_uploaded_document' | 'official' | 'internal' | 'ai_inferred' | 'unknown'

export type DraftCategory =
  | 'notice'
  | 'request'
  | 'objection'
  | 'declaration'
  | 'undertaking'
  | 'settlement'
  | 'contract_addendum'
  | 'administrative_letter'
  | 'legal_letter'
  | 'checklist'
  | 'form_draft'

export type NextActionType =
  | 'create_transaction_file'
  | 'generate_checklist'
  | 'generate_draft'
  | 'upload_missing_document'
  | 'start_guided_flow'
  | 'ask_followup'
  | 'request_human_review'
  | 'compare_with_template'
  | 'none'

// ── Main Analysis Schema ───────────────────────────────────────────────────────

export interface ExtractedFact {
  label: string
  value: string
  normalizedKey?: string
  confidence: ConfidenceLevel
  sourceExcerpt?: string
}

export interface RelatedProcedure {
  procedureSlug: string
  titleAr: string
  titleEn: string
  relevance: 'high' | 'medium' | 'low'
  reason: string
}

export interface PossibleUse {
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  relatedProcedureSlug?: string
}

export interface MissingField {
  field: string
  whyItMatters: string
  requiredFor?: string
  priority: Priority
}

export interface MissingDocument {
  titleAr: string
  titleEn?: string
  reason: string
  relatedProcedureSlug?: string
  priority: Priority
  status: 'missing' | 'unclear' | 'needs_review'
}

export interface DocumentRisk {
  title: string
  level: 'low' | 'medium' | 'high' | 'critical'
  explanation: string
  recommendedAction: string
}

export interface RecommendedDraft {
  templateSlug: string
  titleAr: string
  titleEn: string
  category: DraftCategory
  recommendedBecause: string
  requiresLawyerReview: boolean
  requiredFields: string[]
}

export interface NextAction {
  labelAr: string
  labelEn: string
  actionType: NextActionType
  priority: 'primary' | 'secondary'
}

export interface Evidence {
  claim: string
  sourceType: SourceType
  sourceTitle?: string
  documentId?: string
  excerpt?: string
  verified: boolean
  reliability: ConfidenceLevel
}

export interface AnalysisConfidence {
  extraction: ConfidenceLevel
  procedureMatching: ConfidenceLevel
  legalInterpretation: ConfidenceLevel
  overall: ConfidenceLevel
  reason?: string
}

export interface UniversalDocumentAnalysis {
  kind: 'universal_document_analysis'

  documentId: string
  fileName?: string

  documentType: {
    category: DocCategory
    subtype?: string
    confidence: ConfidenceLevel
  }

  detectedCountry?: 'lebanon' | 'syria' | 'both' | 'unknown'
  detectedLanguage?: 'ar' | 'en' | 'fr' | 'mixed' | 'unknown'

  extractedFacts: ExtractedFact[]
  relatedProcedures: RelatedProcedure[]
  possibleUses: PossibleUse[]
  missingInformation: MissingField[]
  missingDocuments: MissingDocument[]
  risks: DocumentRisk[]
  recommendedDrafts: RecommendedDraft[]
  nextActions: NextAction[]
  evidence: Evidence[]

  confidence: AnalysisConfidence

  disclaimer: string
}

// ── Draft Request / Response ───────────────────────────────────────────────────

export interface UniversalDraftRequest {
  templateSlug: string
  documentId?: string
  transactionId?: string
  relatedProcedureSlug?: string
  language: 'ar' | 'en'
  extractedFacts?: Record<string, string>
  userInputs?: Record<string, string>
  redactionMode?: 'none' | 'partial' | 'full'
}

export interface UniversalDraftResponse {
  draftId: string
  title: string
  templateSlug: string
  language: 'ar' | 'en'
  draftText: string
  missingFields: string[]
  assumptions: string[]
  warnings: string[]
  requiresLawyerReview: boolean
  sourceContext?: {
    type: 'user_uploaded_document' | 'procedure' | 'internal_template'
    documentId?: string
    procedureSlug?: string
  }
  status: 'draft' | 'needs_review' | 'ready_for_review'
  disclaimer: string
}

// ── Document Category Metadata ─────────────────────────────────────────────────

export interface DocCategoryMeta {
  category: DocCategory
  titleAr: string
  titleEn: string
  icon: string
  color: string
  subtypes: string[]
}

export const DOC_CATEGORY_META: DocCategoryMeta[] = [
  { category: 'contract',        titleAr: 'عقد',                   titleEn: 'Contract',           icon: '📝', color: '#6B4226', subtypes: ['عقد إيجار','عقد بيع','عقد خدمات','عقد عمل','عقد شراكة','اتفاقية تسوية','وعد بالبيع'] },
  { category: 'property',        titleAr: 'مستند عقاري',           titleEn: 'Property Document',  icon: '🏛️', color: '#854D0E', subtypes: ['سند ملكية','إفادة عقارية','كشف مساحي','ملف بيع','ضريبة عقارية','براءة ذمة','رخصة بناء'] },
  { category: 'civil_status',    titleAr: 'قيد مدني',              titleEn: 'Civil Status',        icon: '👤', color: '#8F1D2C', subtypes: ['إخراج قيد فردي','إخراج قيد عائلي','شهادة ميلاد','عقد زواج','شهادة وفاة','طلاق','حصر إرث'] },
  { category: 'notarial',        titleAr: 'وثيقة كتابة عدل',      titleEn: 'Notarial Document',   icon: '⚖️', color: '#B8860B', subtypes: ['وكالة عامة','وكالة خاصة','وكالة بيع','إقرار','تعهد','توكيل','وكالة من الخارج'] },
  { category: 'company',         titleAr: 'مستند شركة',            titleEn: 'Company Document',    icon: '🏢', color: '#9D174D', subtypes: ['سجل تجاري','عقد تأسيس','نظام داخلي','تسجيل ضريبي','قرار مجلس إدارة','شهادة تسجيل'] },
  { category: 'tax',             titleAr: 'مستند ضريبي',           titleEn: 'Tax Document',        icon: '💰', color: '#5F3A2E', subtypes: ['براءة ذمة ضريبية','ضريبة عقارية','ضريبة دخل','ضريبة قيمة مضافة','اعتراض ضريبي'] },
  { category: 'judicial',        titleAr: 'مستند قضائي',           titleEn: 'Judicial Document',   icon: '🔨', color: '#8F1D2C', subtypes: ['إنذار قضائي','لائحة دعوى','حكم','أمر تنفيذ','إعلام','تبليغ','وثيقة تسوية'] },
  { category: 'administrative',  titleAr: 'مستند إداري',           titleEn: 'Administrative',      icon: '📋', color: '#2D1B0E', subtypes: ['طلب وزارة','طلب بلدية','رخصة','شكوى','اعتراض','رسالة رسمية','قرار إداري'] },
  { category: 'expat_consular',  titleAr: 'مستند مغترب/قنصلي',    titleEn: 'Expat / Consular',   icon: '✈️', color: '#8F1D2C', subtypes: ['وكالة من الخارج','تصديق','تسجيل واقعة','ترجمة معتمدة','وثيقة سفارة'] },
  { category: 'unknown',         titleAr: 'غير محدد',              titleEn: 'Unknown',             icon: '❓', color: '#69645C', subtypes: [] },
]

// ── Configurable Draft Templates Map ──────────────────────────────────────────
// Each entry describes a template available for generation.

export interface DraftTemplate {
  slug: string
  titleAr: string
  titleEn: string
  category: DraftCategory
  applicableDocCategories: DocCategory[]
  requiresLawyerReview: boolean
  requiredFields: string[]
  descriptionAr: string
}

export const DRAFT_TEMPLATES: DraftTemplate[] = [
  // ── Contracts ──
  { slug: 'eviction-notice',         titleAr: 'إنذار بالإخلاء',                  titleEn: 'Eviction Notice',              category: 'notice',               applicableDocCategories: ['contract'],   requiresLawyerReview: true,  requiredFields: ['اسم المستأجر','عنوان المأجور','رقم العقد'], descriptionAr: 'إنذار رسمي للمستأجر بالإخلاء' },
  { slug: 'rent-payment-notice',     titleAr: 'إنذار بدفع بدلات الإيجار',        titleEn: 'Rent Payment Notice',          category: 'notice',               applicableDocCategories: ['contract'],   requiresLawyerReview: false, requiredFields: ['اسم المستأجر','المبلغ المستحق','الفترة'],  descriptionAr: 'إنذار بسداد الإيجار المتأخر' },
  { slug: 'repair-request',          titleAr: 'طلب إصلاحات',                     titleEn: 'Repair Request Letter',        category: 'request',              applicableDocCategories: ['contract'],   requiresLawyerReview: false, requiredFields: ['وصف الأعطال','عنوان العقار'],               descriptionAr: 'طلب إجراء إصلاحات في المأجور' },
  { slug: 'deposit-return-request',  titleAr: 'طلب إعادة التأمين',               titleEn: 'Deposit Return Request',       category: 'request',              applicableDocCategories: ['contract'],   requiresLawyerReview: false, requiredFields: ['مبلغ التأمين','تاريخ انتهاء العقد'],       descriptionAr: 'طلب استرداد مبلغ التأمين عند نهاية العقد' },
  { slug: 'contract-addendum',       titleAr: 'ملحق تعديل عقد إيجار',            titleEn: 'Lease Contract Addendum',      category: 'contract_addendum',    applicableDocCategories: ['contract'],   requiresLawyerReview: false, requiredFields: ['بنود التعديل'],                             descriptionAr: 'ملحق رسمي لتعديل شروط عقد الإيجار' },
  { slug: 'final-settlement',        titleAr: 'مخالصة نهائية',                   titleEn: 'Final Settlement Receipt',     category: 'settlement',           applicableDocCategories: ['contract'],   requiresLawyerReview: false, requiredFields: ['الأطراف','تاريخ الإخلاء'],                  descriptionAr: 'مخالصة تثبت انتهاء العلاقة الإيجارية' },
  { slug: 'property-handover',       titleAr: 'محضر تسليم مأجور',                titleEn: 'Property Handover Report',     category: 'form_draft',           applicableDocCategories: ['contract','property'], requiresLawyerReview: false, requiredFields: ['حالة العقار','قوائم المرافق'],          descriptionAr: 'وثيقة استلام وتسليم العقار بين الطرفين' },

  // ── Property ──
  { slug: 'property-statement-req',  titleAr: 'طلب إفادة عقارية',                titleEn: 'Property Statement Request',   category: 'request',              applicableDocCategories: ['property'],   requiresLawyerReview: false, requiredFields: ['رقم القطعة','اسم المنطقة'],                 descriptionAr: 'طلب استخراج إفادة من الدائرة العقارية' },
  { slug: 'municipal-clearance-req', titleAr: 'طلب براءة ذمة بلدية',             titleEn: 'Municipal Clearance Request',  category: 'request',              applicableDocCategories: ['property'],   requiresLawyerReview: false, requiredFields: ['رقم العقار','اسم المالك'],                  descriptionAr: 'طلب تثبيت خلو الذمة من الرسوم البلدية' },
  { slug: 'property-sale-poa',       titleAr: 'وكالة بيع عقار',                  titleEn: 'Property Sale POA',            category: 'declaration',          applicableDocCategories: ['property','notarial'], requiresLawyerReview: true,  requiredFields: ['الموكّل','الوكيل','رقم القطعة','المنطقة'], descriptionAr: 'وكالة خاصة لبيع عقار أمام كاتب العدل' },
  { slug: 'property-sale-checklist', titleAr: 'Checklist بيع عقار',              titleEn: 'Property Sale Checklist',      category: 'checklist',            applicableDocCategories: ['property'],   requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة تدقيق شاملة لمعاملة بيع العقار' },
  { slug: 'lawyer-referral-letter',  titleAr: 'رسالة إلى محامٍ لمراجعة ملف البيع', titleEn: 'Attorney Referral Letter',  category: 'legal_letter',         applicableDocCategories: ['property'],   requiresLawyerReview: false, requiredFields: ['اسم المحامي','وصف الملف'],                  descriptionAr: 'رسالة إحالة لمراجعة ملف البيع من محامٍ' },
  { slug: 'docs-handover-report',    titleAr: 'محضر تسليم مستندات عقارية',       titleEn: 'Property Docs Handover',       category: 'form_draft',           applicableDocCategories: ['property'],   requiresLawyerReview: false, requiredFields: ['قائمة المستندات','الأطراف'],                descriptionAr: 'محضر يوثّق تسليم المستندات العقارية' },

  // ── Power of Attorney ──
  { slug: 'poa-scope-review',        titleAr: 'مراجعة صلاحيات الوكالة',          titleEn: 'POA Scope Review',             category: 'checklist',            applicableDocCategories: ['notarial'],   requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة للتحقق من اكتمال صلاحيات الوكالة' },
  { slug: 'poa-amendment-request',   titleAr: 'طلب تعديل وكالة',                 titleEn: 'POA Amendment Request',        category: 'request',              applicableDocCategories: ['notarial'],   requiresLawyerReview: true,  requiredFields: ['البنود المطلوب تعديلها'],                   descriptionAr: 'طلب تعديل أو توسيع صلاحيات الوكالة' },
  { slug: 'follow-up-poa',           titleAr: 'وكالة متابعة معاملة',             titleEn: 'Follow-up POA',                category: 'declaration',          applicableDocCategories: ['notarial'],   requiresLawyerReview: false, requiredFields: ['الموكّل','الوكيل','نوع المعاملة'],          descriptionAr: 'وكالة لمتابعة معاملة إدارية أو قانونية' },
  { slug: 'notary-letter',           titleAr: 'كتاب إلى كاتب عدل',               titleEn: 'Notary Letter',                category: 'administrative_letter', applicableDocCategories: ['notarial'],  requiresLawyerReview: false, requiredFields: ['اسم كاتب العدل','موضوع الرسالة'],           descriptionAr: 'رسالة رسمية موجّهة إلى كاتب العدل' },
  { slug: 'agent-letter',            titleAr: 'رسالة إلى الوكيل',                titleEn: 'Letter to Agent',              category: 'administrative_letter', applicableDocCategories: ['notarial'],  requiresLawyerReview: false, requiredFields: ['اسم الوكيل','التعليمات'],                   descriptionAr: 'رسالة توجيهية للوكيل بالتعليمات المطلوبة' },
  { slug: 'poa-validity-checklist',  titleAr: 'Checklist صلاحية وكالة',          titleEn: 'POA Validity Checklist',       category: 'checklist',            applicableDocCategories: ['notarial'],   requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة للتحقق من صحة وسريان الوكالة' },

  // ── Civil Status ──
  { slug: 'civil-record-request',    titleAr: 'طلب إخراج قيد',                   titleEn: 'Civil Record Request',         category: 'request',              applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['الاسم الكامل','رقم القيد','المنطقة'],     descriptionAr: 'طلب استخراج إخراج قيد من دائرة النفوس' },
  { slug: 'event-registration-req',  titleAr: 'طلب تسجيل واقعة',                titleEn: 'Event Registration Request',   category: 'request',              applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['نوع الواقعة','التاريخ','الأطراف'],        descriptionAr: 'طلب تسجيل ولادة أو زواج أو وفاة' },
  { slug: 'record-correction-req',   titleAr: 'طلب تصحيح قيد',                  titleEn: 'Record Correction Request',    category: 'request',              applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['الخطأ الحالي','التصحيح المطلوب'],         descriptionAr: 'طلب تصحيح بيانات في القيد المدني' },
  { slug: 'doc-certification-req',   titleAr: 'طلب تصديق مستند',                titleEn: 'Document Certification Request', category: 'request',            applicableDocCategories: ['civil_status','expat_consular'], requiresLawyerReview: false, requiredFields: ['نوع المستند','الجهة المطلوب التصديق منها'], descriptionAr: 'طلب تصديق مستند رسمي' },
  { slug: 'civil-checklist',         titleAr: 'Checklist معاملة نفوس',           titleEn: 'Civil Status Checklist',       category: 'checklist',            applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: [],                                         descriptionAr: 'قائمة مستندات لمعاملة الأحوال المدنية' },
  { slug: 'mukhtar-letter',          titleAr: 'رسالة إلى مختار أو دائرة نفوس',  titleEn: 'Letter to Mukhtar / Registry', category: 'administrative_letter', applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['موضوع الرسالة'],                          descriptionAr: 'رسالة رسمية إلى المختار أو دائرة النفوس' },

  // ── Inheritance ──
  { slug: 'inheritance-checklist',   titleAr: 'Checklist حصر إرث',               titleEn: 'Inheritance Checklist',        category: 'checklist',            applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة شاملة لمستندات حصر الإرث' },
  { slug: 'inheritance-request',     titleAr: 'طلب حصر إرث',                     titleEn: 'Inheritance Petition',         category: 'request',              applicableDocCategories: ['civil_status'], requiresLawyerReview: true,  requiredFields: ['اسم المتوفى','الورثة'],                     descriptionAr: 'طلب رسمي لتحديد حصص الإرث' },
  { slug: 'heirs-letter',            titleAr: 'رسالة إلى الورثة',                titleEn: 'Letter to Heirs',              category: 'administrative_letter', applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['أسماء الورثة','موضوع الرسالة'],            descriptionAr: 'رسالة إخطار للورثة بشأن التركة' },
  { slug: 'heirs-docs-table',        titleAr: 'جدول مستندات الورثة',             titleEn: 'Heirs Documents Table',        category: 'checklist',            applicableDocCategories: ['civil_status'], requiresLawyerReview: false, requiredFields: ['أسماء الورثة'],                            descriptionAr: 'جدول بالمستندات المطلوبة من كل وارث' },

  // ── Company ──
  { slug: 'commercial-registry-req', titleAr: 'طلب سجل تجاري',                   titleEn: 'Commercial Registry Request',  category: 'request',              applicableDocCategories: ['company'],     requiresLawyerReview: false, requiredFields: ['اسم الشركة'],                               descriptionAr: 'طلب استخراج سجل تجاري' },
  { slug: 'board-resolution',        titleAr: 'محضر جمعية / قرار شركاء',         titleEn: 'Board Resolution / Partners Decision', category: 'declaration', applicableDocCategories: ['company'],    requiresLawyerReview: false, requiredFields: ['قرارات المجلس/الشركاء'],                    descriptionAr: 'محضر اجتماع مجلس الإدارة أو الشركاء' },
  { slug: 'tax-ministry-letter',     titleAr: 'كتاب إلى وزارة المالية',          titleEn: 'Letter to Ministry of Finance', category: 'administrative_letter', applicableDocCategories: ['company','tax'], requiresLawyerReview: false, requiredFields: ['موضوع الكتاب','اسم الشركة'],             descriptionAr: 'رسالة رسمية لوزارة المالية' },
  { slug: 'tax-registration-req',    titleAr: 'طلب تسجيل ضريبي',                 titleEn: 'Tax Registration Request',     category: 'request',              applicableDocCategories: ['company','tax'], requiresLawyerReview: false, requiredFields: ['اسم الشركة','النشاط التجاري'],            descriptionAr: 'طلب تسجيل لدى الإدارة الضريبية' },
  { slug: 'nssf-registration-req',   titleAr: 'طلب تسجيل ضمان',                  titleEn: 'NSSF Registration Request',    category: 'request',              applicableDocCategories: ['company'],     requiresLawyerReview: false, requiredFields: ['اسم الشركة','عدد الموظفين'],                descriptionAr: 'طلب تسجيل في الضمان الاجتماعي' },
  { slug: 'company-setup-checklist', titleAr: 'Checklist تأسيس شركة',            titleEn: 'Company Setup Checklist',      category: 'checklist',            applicableDocCategories: ['company'],     requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة متطلبات تأسيس الشركة' },

  // ── Tax ──
  { slug: 'tax-assessment-objection', titleAr: 'اعتراض على تكليف أو غرامة',    titleEn: 'Tax Assessment Objection',     category: 'objection',            applicableDocCategories: ['tax'],         requiresLawyerReview: true,  requiredFields: ['رقم التكليف','أسباب الاعتراض'],            descriptionAr: 'اعتراض رسمي على تكليف ضريبي أو غرامة' },
  { slug: 'tax-clearance-req',        titleAr: 'طلب براءة ذمة',               titleEn: 'Tax Clearance Request',        category: 'request',              applicableDocCategories: ['tax'],         requiresLawyerReview: false, requiredFields: ['اسم المكلّف','رقم الملف الضريبي'],         descriptionAr: 'طلب شهادة براءة الذمة الضريبية' },
  { slug: 'installment-request',      titleAr: 'طلب تقسيط',                   titleEn: 'Installment Request',          category: 'request',              applicableDocCategories: ['tax'],         requiresLawyerReview: false, requiredFields: ['المبلغ','عدد الأقساط المقترحة'],           descriptionAr: 'طلب تسديد الضريبة بالتقسيط' },
  { slug: 'tax-docs-checklist',       titleAr: 'Checklist مستندات ضريبية',    titleEn: 'Tax Documents Checklist',      category: 'checklist',            applicableDocCategories: ['tax'],         requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة المستندات الضريبية المطلوبة' },

  // ── Judicial ──
  { slug: 'notice-reply',            titleAr: 'جواب على إنذار',                  titleEn: 'Notice Reply',                 category: 'legal_letter',         applicableDocCategories: ['judicial'],    requiresLawyerReview: true,  requiredFields: ['رقم الإنذار','أسباب الجواب'],              descriptionAr: 'جواب رسمي على إنذار قضائي استلامه' },
  { slug: 'extension-request',       titleAr: 'طلب مهلة',                        titleEn: 'Extension Request',            category: 'request',              applicableDocCategories: ['judicial'],    requiresLawyerReview: false, requiredFields: ['المهلة المطلوبة','السبب'],                  descriptionAr: 'طلب تمديد مهلة للامتثال لقرار قضائي' },
  { slug: 'legal-objection',         titleAr: 'كتاب اعتراض',                     titleEn: 'Legal Objection Letter',       category: 'objection',            applicableDocCategories: ['judicial'],    requiresLawyerReview: true,  requiredFields: ['موضوع الاعتراض','أسباب الرفض'],            descriptionAr: 'كتاب اعتراض رسمي على قرار أو إجراء قضائي' },
  { slug: 'lawyer-review-request',   titleAr: 'طلب مراجعة محامٍ',               titleEn: 'Request Legal Review',         category: 'request',              applicableDocCategories: ['judicial','contract','property'], requiresLawyerReview: false, requiredFields: ['وصف القضية'],  descriptionAr: 'طلب رسمي لمراجعة محامٍ للملف' },
  { slug: 'case-summary',            titleAr: 'ملخص ملف قضائي',                  titleEn: 'Case File Summary',            category: 'form_draft',           applicableDocCategories: ['judicial'],    requiresLawyerReview: false, requiredFields: ['وصف القضية','الأطراف'],                    descriptionAr: 'ملخص منظّم للملف القضائي' },
  { slug: 'legal-docs-checklist',    titleAr: 'Checklist للمستندات القانونية',   titleEn: 'Legal Documents Checklist',    category: 'checklist',            applicableDocCategories: ['judicial'],    requiresLawyerReview: false, requiredFields: [],                                           descriptionAr: 'قائمة المستندات اللازمة للقضية' },

  // ── Administrative ──
  { slug: 'admin-objection',         titleAr: 'اعتراض إداري',                    titleEn: 'Administrative Objection',     category: 'objection',            applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: ['القرار المعترض عليه','أسباب الاعتراض'], descriptionAr: 'اعتراض رسمي على قرار أو إجراء إداري' },
  { slug: 'review-request',          titleAr: 'طلب إعادة نظر',                   titleEn: 'Reconsideration Request',      category: 'request',              applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: ['الموضوع','المبررات'],                    descriptionAr: 'طلب إعادة دراسة قرار إداري' },
  { slug: 'transaction-follow-up',   titleAr: 'طلب متابعة معاملة',               titleEn: 'Transaction Follow-up Request', category: 'request',             applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: ['رقم المعاملة','تاريخ التقديم'],         descriptionAr: 'طلب تحديث حول سير معاملة مقدّمة' },
  { slug: 'reminder-letter',         titleAr: 'كتاب تذكير',                      titleEn: 'Reminder Letter',              category: 'administrative_letter', applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: ['موضوع التذكير','الجهة'],               descriptionAr: 'كتاب تذكير موجّه لجهة إدارية' },
  { slug: 'admin-complaint',         titleAr: 'شكوى إدارية',                     titleEn: 'Administrative Complaint',     category: 'objection',            applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: ['موضوع الشكوى','الجهة المشكو منها'],     descriptionAr: 'شكوى رسمية إلى جهة إدارية' },
  { slug: 'admin-review-checklist',  titleAr: 'Checklist للمراجعة',              titleEn: 'Review Checklist',             category: 'checklist',            applicableDocCategories: ['administrative'], requiresLawyerReview: false, requiredFields: [],                                        descriptionAr: 'قائمة تدقيق لمراجعة ملف إداري' },

  // ── Expat / Consular ──
  { slug: 'consular-poa',            titleAr: 'وكالة من الخارج',                 titleEn: 'Consular Power of Attorney',   category: 'declaration',          applicableDocCategories: ['expat_consular','notarial'], requiresLawyerReview: false, requiredFields: ['الموكّل','الوكيل','الصلاحيات'], descriptionAr: 'وكالة موثّقة من قنصلية في الخارج' },
  { slug: 'certification-request',   titleAr: 'طلب تصديق',                       titleEn: 'Certification Request',        category: 'request',              applicableDocCategories: ['expat_consular'], requiresLawyerReview: false, requiredFields: ['نوع المستند','الجهة المصدّقة'],        descriptionAr: 'طلب تصديق مستند من الجهة المختصة' },
  { slug: 'consulate-letter',        titleAr: 'رسالة إلى القنصلية',              titleEn: 'Consulate Letter',             category: 'administrative_letter', applicableDocCategories: ['expat_consular'], requiresLawyerReview: false, requiredFields: ['موضوع الرسالة','اسم القنصلية'],        descriptionAr: 'رسالة رسمية موجّهة للقنصلية' },
  { slug: 'expat-checklist',         titleAr: 'Checklist تصديق وترجمة',          titleEn: 'Certification & Translation Checklist', category: 'checklist', applicableDocCategories: ['expat_consular'], requiresLawyerReview: false, requiredFields: [],                              descriptionAr: 'قائمة متطلبات التصديق والترجمة للمغتربين' },
  { slug: 'local-agent-letter',      titleAr: 'رسالة إلى وكيل داخل لبنان/سوريا', titleEn: 'Letter to Local Agent',       category: 'administrative_letter', applicableDocCategories: ['expat_consular'], requiresLawyerReview: false, requiredFields: ['اسم الوكيل','التعليمات'],             descriptionAr: 'رسالة للوكيل داخل البلد لمتابعة المعاملة' },
  { slug: 'expat-transaction-file',  titleAr: 'ملف متابعة معاملة مغترب',         titleEn: 'Expat Transaction File',       category: 'form_draft',           applicableDocCategories: ['expat_consular'], requiresLawyerReview: false, requiredFields: ['نوع المعاملة'],                        descriptionAr: 'ملف منظّم لمتابعة معاملة مغترب عن بُعد' },
]

// ── Helper Functions ───────────────────────────────────────────────────────────

/** Get all draft templates applicable for a given document category */
export function getDraftsForCategory(category: DocCategory): DraftTemplate[] {
  return DRAFT_TEMPLATES.filter(t => t.applicableDocCategories.includes(category))
}

/** Get a single template by slug */
export function getDraftTemplate(slug: string): DraftTemplate | undefined {
  return DRAFT_TEMPLATES.find(t => t.slug === slug)
}

/** Get category metadata */
export function getDocCategoryMeta(category: DocCategory): DocCategoryMeta {
  return DOC_CATEGORY_META.find(m => m.category === category) ?? DOC_CATEGORY_META[DOC_CATEGORY_META.length - 1]
}

/** Summarize overall risk level from array of risks */
export function summarizeRiskLevel(risks: DocumentRisk[]): 'low' | 'medium' | 'high' | 'critical' {
  if (risks.some(r => r.level === 'critical')) return 'critical'
  if (risks.some(r => r.level === 'high'))     return 'high'
  if (risks.some(r => r.level === 'medium'))   return 'medium'
  return 'low'
}

/** Risk level → badge colors */
export function riskColors(level: string): [string, string] {
  const map: Record<string, [string, string]> = {
    critical: ['#F8EDEF', '#8F1D2C'],
    high:     ['#F8EDEF', '#8F1D2C'],
    medium:   ['#FFFBEB', '#B45309'],
    low:      ['#FFFBEB', '#78350F'],
    unknown:  ['#E6E2DC', '#69645C'],
  }
  return map[level] ?? map.unknown
}

/** Confidence → Arabic label */
export function confidenceLabel(level: ConfidenceLevel, isAr = true): string {
  const map: Record<ConfidenceLevel, [string, string]> = {
    high:    ['عالية',    'High'],
    medium:  ['متوسطة',  'Medium'],
    low:     ['منخفضة',  'Low'],
    unknown: ['غير محددة','Unknown'],
  }
  return isAr ? map[level][0] : map[level][1]
}

/** Priority → Arabic label */
export function priorityLabel(priority: Priority, isAr = true): string {
  const map: Record<Priority, [string, string]> = {
    critical: ['حرج',    'Critical'],
    high:     ['عالٍ',   'High'],
    medium:   ['متوسط',  'Medium'],
    low:      ['منخفض',  'Low'],
  }
  return isAr ? map[priority][0] : map[priority][1]
}

/** Source type → Arabic label */
export function sourceTypeLabel(st: SourceType, isAr = true): string {
  const map: Record<SourceType, [string, string]> = {
    user_uploaded_document: ['مستند مرفوع من المستخدم', 'User-uploaded document'],
    official:               ['مصدر رسمي',                'Official source'],
    internal:               ['معرفة داخلية دليلك',       'Dalilak internal knowledge'],
    ai_inferred:            ['استنتاج AI',                'AI inference'],
    unknown:                ['غير معروف',                 'Unknown'],
  }
  return isAr ? map[st][0] : map[st][1]
}