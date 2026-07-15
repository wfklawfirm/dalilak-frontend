// ── Dalilak AI — Service Groups (Phase 1 / Phase 6) ─────────────────────────
// Data contract for structured service hierarchy.
// Consumed by homepage, /services page, and API layer.

export type ServiceItemAction =
  | 'start_flow'
  | 'upload_document'
  | 'ask_ai'
  | 'create_transaction'
  | 'generate_checklist'

export type ServiceUserType =
  | 'citizen'
  | 'expat'
  | 'lawyer'
  | 'company'
  | 'service_office'
  | 'accountant'
  | 'ngo'

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'needs_review'
  | 'draft'

export interface ServiceItem {
  id: string
  slug: string
  groupSlug: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  icon?: string
  procedureSlug?: string
  defaultAction: ServiceItemAction
  requiresDocument?: boolean
  availableFor: ServiceUserType[]
  verificationStatus: VerificationStatus
  chatPromptAr?: string
  chatPromptEn?: string
}

export interface ServiceGroup {
  id: string
  slug: string
  titleAr: string
  titleEn: string
  descriptionAr?: string
  descriptionEn?: string
  icon: string
  color: string          // CSS color for accent
  priority: number
  services: ServiceItem[]
}

// ── The 8 service groups ──────────────────────────────────────────────────────

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: 'sg-1',
    slug: 'expat',
    titleAr: 'معاملات المغتربين',
    titleEn: 'Expat Services',
    icon: '✈️',
    color: '#8B1A1A',
    priority: 1,
    descriptionAr: 'إنجاز معاملات لبنانية من الخارج عبر السفارات والتوكيل',
    descriptionEn: 'Complete Lebanese procedures from abroad via embassies or power of attorney',
    services: [
      {
        id: 'si-1-1', slug: 'poa-from-abroad', groupSlug: 'expat',
        titleAr: 'وكالة من الخارج', titleEn: 'Power of Attorney from Abroad',
        icon: '📜',
        descriptionAr: 'توكيل رسمي بالبيع أو الإدارة من الخارج عبر السفارة اللبنانية',
        descriptionEn: 'Official POA for sale or management from abroad via Lebanese embassy',
        defaultAction: 'start_flow', procedureSlug: 'power-of-attorney',
        availableFor: ['expat', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف يستطيع المغترب إصدار وكالة رسمية من الخارج؟',
        chatPromptEn: 'How can an expat issue a power of attorney from abroad?',
      },
      {
        id: 'si-1-2', slug: 'property-sale-abroad', groupSlug: 'expat',
        titleAr: 'بيع عقار من الخارج', titleEn: 'Property Sale from Abroad',
        icon: '🏠',
        descriptionAr: 'خطوات بيع عقار لبناني وأنت مقيم خارج لبنان',
        descriptionEn: 'Steps to sell Lebanese property while residing abroad',
        defaultAction: 'start_flow',
        availableFor: ['expat', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف يبيع المغترب عقاره في لبنان وهو خارج البلاد؟',
        chatPromptEn: 'How can an expat sell their Lebanese property while abroad?',
      },
      {
        id: 'si-1-3', slug: 'document-attestation', groupSlug: 'expat',
        titleAr: 'تصديق مستندات', titleEn: 'Document Attestation',
        icon: '🔏',
        descriptionAr: 'تصديق الوثائق الرسمية للاستخدام في الخارج أو داخل لبنان',
        descriptionEn: 'Attest official documents for use abroad or within Lebanon',
        defaultAction: 'start_flow', procedureSlug: 'document-attestation',
        availableFor: ['expat', 'citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أصدّق وثيقة رسمية للاستخدام في الخارج؟',
        chatPromptEn: 'How do I attest an official document for use abroad?',
      },
      {
        id: 'si-1-4', slug: 'register-abroad', groupSlug: 'expat',
        titleAr: 'تسجيل زواج أو ولادة من الخارج', titleEn: 'Register Marriage/Birth from Abroad',
        icon: '📋',
        descriptionAr: 'تسجيل الزواج أو الولادة في السجلات اللبنانية من الخارج',
        descriptionEn: 'Register marriage or birth in Lebanese records from abroad',
        defaultAction: 'start_flow',
        availableFor: ['expat'], verificationStatus: 'partially_verified',
        chatPromptAr: 'كيف أسجّل زواجاً أو ولادة في لبنان وأنا في الخارج؟',
        chatPromptEn: 'How do I register a marriage or birth in Lebanon from abroad?',
      },
      {
        id: 'si-1-5', slug: 'track-via-agent', groupSlug: 'expat',
        titleAr: 'متابعة معاملة عبر وكيل', titleEn: 'Track Procedure via Agent',
        icon: '🔄',
        descriptionAr: 'متابعة سير معاملة داخل لبنان عبر وكيل مُعيَّن',
        descriptionEn: 'Track a procedure inside Lebanon through a designated agent',
        defaultAction: 'ask_ai',
        availableFor: ['expat'], verificationStatus: 'draft',
        chatPromptAr: 'كيف أتابع معاملة في لبنان عبر وكيل وأنا في الخارج؟',
        chatPromptEn: 'How do I track a Lebanese procedure via a designated agent?',
      },
    ],
  },
  {
    id: 'sg-2',
    slug: 'property',
    titleAr: 'العقارات',
    titleEn: 'Property Transactions',
    icon: '🏛️',
    color: '#92400E',
    priority: 2,
    descriptionAr: 'بيع وشراء وتسجيل العقارات والحصول على الإفادات العقارية',
    descriptionEn: 'Buy, sell, register property and obtain real estate certificates',
    services: [
      {
        id: 'si-2-1', slug: 'property-sale', groupSlug: 'property',
        titleAr: 'بيع عقار', titleEn: 'Property Sale',
        icon: '🏠', procedureSlug: 'property-transfer',
        descriptionAr: 'إجراءات بيع عقار: العقد، نقل الملكية، الرسوم',
        descriptionEn: 'Property sale steps: contract, title transfer, fees',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي إجراءات بيع عقار في لبنان؟',
        chatPromptEn: 'What are the steps for selling a property in Lebanon?',
      },
      {
        id: 'si-2-2', slug: 'property-certificate', groupSlug: 'property',
        titleAr: 'إفادة عقارية', titleEn: 'Property Certificate',
        icon: '📋',
        descriptionAr: 'استخراج إفادة عقارية من دائرة الشهر العقاري',
        descriptionEn: 'Extract property certificate from the Real Estate Registry',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أستخرج إفادة عقارية من دائرة الشهر العقاري؟',
        chatPromptEn: 'How do I obtain a property certificate from the Real Estate Registry?',
      },
      {
        id: 'si-2-3', slug: 'debt-clearance', groupSlug: 'property',
        titleAr: 'براءة ذمة', titleEn: 'Debt Clearance Certificate',
        icon: '✅',
        descriptionAr: 'الحصول على براءة ذمة لإتمام نقل الملكية',
        descriptionEn: 'Obtain a debt clearance certificate to complete title transfer',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'partially_verified',
        chatPromptAr: 'ما هي براءة الذمة وكيف أحصل عليها قبل بيع العقار؟',
        chatPromptEn: 'What is a debt clearance certificate and how do I get it before selling?',
      },
      {
        id: 'si-2-4', slug: 'property-tax', groupSlug: 'property',
        titleAr: 'ضريبة العقار والرسوم', titleEn: 'Property Tax & Fees',
        icon: '💰',
        descriptionAr: 'فهم الضرائب والرسوم المترتبة على بيع أو نقل ملكية العقار',
        descriptionEn: 'Understand taxes and fees for selling or transferring property',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer', 'company'], verificationStatus: 'partially_verified',
        chatPromptAr: 'ما هي الضرائب والرسوم المترتبة على بيع العقار في لبنان؟',
        chatPromptEn: 'What taxes and fees apply to property sale in Lebanon?',
      },
      {
        id: 'si-2-5', slug: 'inheritance-property', groupSlug: 'property',
        titleAr: 'عقار ضمن إرث', titleEn: 'Inherited Property',
        icon: '⚖️',
        descriptionAr: 'إجراءات نقل ملكية عقار وارد ضمن تركة أو حصر إرث',
        descriptionEn: 'Transfer of a property included in an inheritance estate',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف يتم نقل ملكية عقار موروث في لبنان؟',
        chatPromptEn: 'How is an inherited property title transferred in Lebanon?',
      },
      {
        id: 'si-2-6', slug: 'poa-sale', groupSlug: 'property',
        titleAr: 'وكالة للبيع', titleEn: 'Power of Attorney for Sale',
        icon: '📜', procedureSlug: 'power-of-attorney',
        descriptionAr: 'تفويض شخص للبيع عبر وكالة رسمية موثّقة',
        descriptionEn: 'Authorize someone to sell via an officially notarized power of attorney',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أصدر وكالة للبيع في لبنان؟',
        chatPromptEn: 'How do I issue a power of attorney for selling property in Lebanon?',
      },
    ],
  },
  {
    id: 'sg-3',
    slug: 'contracts',
    titleAr: 'العقود',
    titleEn: 'Contracts',
    icon: '📝',
    color: '#44403C',
    priority: 3,
    descriptionAr: 'تحليل العقود وكشف الثغرات ومراجعة البنود قبل التوقيع',
    descriptionEn: 'Analyze contracts, detect gaps, and review clauses before signing',
    services: [
      {
        id: 'si-3-1', slug: 'lease-review', groupSlug: 'contracts',
        titleAr: 'تحليل عقد إيجار', titleEn: 'Lease Contract Review',
        icon: '🔍',
        descriptionAr: 'مراجعة شاملة لعقد الإيجار وكشف الثغرات والمخاطر',
        descriptionEn: 'Comprehensive lease contract review with gap and risk detection',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'expat', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'قم بتحليل عقد الإيجار الذي رفعته واكشف الثغرات والمخاطر',
        chatPromptEn: 'Analyze the lease contract I uploaded and detect gaps and risks',
      },
      {
        id: 'si-3-2', slug: 'contract-gaps', groupSlug: 'contracts',
        titleAr: 'كشف الثغرات والمخاطر', titleEn: 'Gap & Risk Detection',
        icon: '⚠️',
        descriptionAr: 'تحديد البنود الضعيفة والثغرات القانونية في أي عقد',
        descriptionEn: 'Identify weak clauses and legal gaps in any contract',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي الثغرات والمخاطر في هذا العقد؟',
        chatPromptEn: 'What are the gaps and risks in this contract?',
      },
      {
        id: 'si-3-3', slug: 'missing-clauses', groupSlug: 'contracts',
        titleAr: 'البنود الناقصة', titleEn: 'Missing Clauses',
        icon: '✏️',
        descriptionAr: 'اكتشاف البنود المفقودة واقتراح صياغة مناسبة لها',
        descriptionEn: 'Discover missing clauses and suggest appropriate wording',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي البنود الناقصة في هذا العقد؟ واقترح صياغة لها',
        chatPromptEn: 'What clauses are missing from this contract? Suggest wording for them',
      },
      {
        id: 'si-3-4', slug: 'obligations-map', groupSlug: 'contracts',
        titleAr: 'التزامات كل طرف', titleEn: 'Party Obligations Map',
        icon: '📊',
        descriptionAr: 'تلخيص التزامات كل طرف في العقد بشكل واضح',
        descriptionEn: 'Summarize each party\'s obligations in the contract clearly',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي التزامات كل طرف في هذا العقد؟',
        chatPromptEn: 'What are each party\'s obligations in this contract?',
      },
      {
        id: 'si-3-5', slug: 'signing-checklist', groupSlug: 'contracts',
        titleAr: 'Checklist قبل التوقيع', titleEn: 'Pre-Signing Checklist',
        icon: '✅',
        descriptionAr: 'قائمة مرجعية شاملة للتحقق قبل توقيع أي عقد',
        descriptionEn: 'Comprehensive checklist to verify before signing any contract',
        defaultAction: 'generate_checklist',
        availableFor: ['citizen', 'expat', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'أعطني checklist شامل للتحقق قبل توقيع هذا العقد',
        chatPromptEn: 'Give me a comprehensive checklist to verify before signing this contract',
      },
    ],
  },
  {
    id: 'sg-4',
    slug: 'civil-records',
    titleAr: 'الأحوال الشخصية والقيود',
    titleEn: 'Civil Records',
    icon: '👨‍👩‍👦',
    color: '#166534',
    priority: 4,
    descriptionAr: 'استخراج وثائق الأحوال الشخصية وقيود السجل المدني',
    descriptionEn: 'Extract civil status documents and registry records',
    services: [
      {
        id: 'si-4-1', slug: 'civil-extract', groupSlug: 'civil-records',
        titleAr: 'إخراج قيد', titleEn: 'Civil Registry Extract',
        icon: '📋', procedureSlug: 'civil-registry-extract',
        descriptionAr: 'استخراج إخراج قيد فردي أو إجمالي من دائرة النفوس',
        descriptionEn: 'Extract individual or collective civil record from the civil registry',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أستخرج إخراج قيد من دائرة النفوس في لبنان؟',
        chatPromptEn: 'How do I extract a civil registry record in Lebanon?',
      },
      {
        id: 'si-4-2', slug: 'criminal-record', groupSlug: 'civil-records',
        titleAr: 'سجل عدلي', titleEn: 'Criminal Record',
        icon: '📌', procedureSlug: 'criminal-record',
        descriptionAr: 'استخراج شهادة عدم المحكومية من وزارة العدل',
        descriptionEn: 'Extract criminal record certificate from Ministry of Justice',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أستخرج سجلاً عدلياً في لبنان؟',
        chatPromptEn: 'How do I get a criminal record certificate in Lebanon?',
      },
      {
        id: 'si-4-3', slug: 'birth-cert', groupSlug: 'civil-records',
        titleAr: 'شهادة ميلاد', titleEn: 'Birth Certificate',
        icon: '👶', procedureSlug: 'birth-certificate',
        descriptionAr: 'تسجيل المولود أو استخراج شهادة ميلاد',
        descriptionEn: 'Register newborn or extract birth certificate',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أستخرج شهادة ميلاد في لبنان؟',
        chatPromptEn: 'How do I extract a birth certificate in Lebanon?',
      },
      {
        id: 'si-4-4', slug: 'marriage-cert', groupSlug: 'civil-records',
        titleAr: 'وثيقة زواج', titleEn: 'Marriage Certificate',
        icon: '💍', procedureSlug: 'marriage-registration',
        descriptionAr: 'تسجيل الزواج الرسمي واستخراج وثيقة الزواج',
        descriptionEn: 'Register official marriage and extract marriage certificate',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'expat'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أسجّل الزواج رسمياً في لبنان؟',
        chatPromptEn: 'How do I officially register a marriage in Lebanon?',
      },
      {
        id: 'si-4-5', slug: 'inheritance-cert', groupSlug: 'civil-records',
        titleAr: 'حصر إرث', titleEn: 'Inheritance Certificate',
        icon: '⚖️', procedureSlug: 'inheritance-certificate',
        descriptionAr: 'استخراج وثيقة حصر الإرث من المحكمة الشرعية أو المدنية',
        descriptionEn: 'Extract inheritance certificate from the sharia or civil court',
        defaultAction: 'start_flow',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أستخرج وثيقة حصر إرث في لبنان؟',
        chatPromptEn: 'How do I obtain an inheritance certificate in Lebanon?',
      },
    ],
  },
  {
    id: 'sg-5',
    slug: 'business',
    titleAr: 'الشركات والأعمال',
    titleEn: 'Business & Companies',
    icon: '🏢',
    color: '#B8860B',
    priority: 5,
    descriptionAr: 'تأسيس الشركات والتراخيص التجارية والضمان الاجتماعي',
    descriptionEn: 'Company formation, commercial licenses, and social security',
    services: [
      {
        id: 'si-5-1', slug: 'company-formation', groupSlug: 'business',
        titleAr: 'تأسيس شركة', titleEn: 'Company Formation',
        icon: '🏭', procedureSlug: 'company-registration',
        descriptionAr: 'خطوات تأسيس شركة في لبنان وتسجيلها في السجل التجاري',
        descriptionEn: 'Steps to form a company in Lebanon and register it commercially',
        defaultAction: 'start_flow',
        availableFor: ['company', 'lawyer', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أؤسّس شركة في لبنان وما هي المتطلبات؟',
        chatPromptEn: 'How do I form a company in Lebanon and what are the requirements?',
      },
      {
        id: 'si-5-2', slug: 'commercial-registry', groupSlug: 'business',
        titleAr: 'السجل التجاري', titleEn: 'Commercial Registry',
        icon: '📋',
        descriptionAr: 'التسجيل في السجل التجاري وتجديد القيد السنوي',
        descriptionEn: 'Commercial registry registration and annual renewal',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أسجّل شركتي في السجل التجاري اللبناني؟',
        chatPromptEn: 'How do I register my company in the Lebanese commercial registry?',
      },
      {
        id: 'si-5-3', slug: 'business-tax', groupSlug: 'business',
        titleAr: 'ضريبة وإلتزامات الشركات', titleEn: 'Corporate Tax & Obligations',
        icon: '💰',
        descriptionAr: 'فهم الالتزامات الضريبية والمالية للشركات في لبنان',
        descriptionEn: 'Understand tax and financial obligations for companies in Lebanon',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'accountant'], verificationStatus: 'partially_verified',
        chatPromptAr: 'ما هي الالتزامات الضريبية للشركات في لبنان؟',
        chatPromptEn: 'What are the tax obligations for companies in Lebanon?',
      },
      {
        id: 'si-5-4', slug: 'social-security-reg', groupSlug: 'business',
        titleAr: 'الضمان الاجتماعي', titleEn: 'Social Security Registration',
        icon: '🏥', procedureSlug: 'social-security',
        descriptionAr: 'تسجيل الموظفين في الضمان الاجتماعي ومتابعة الاشتراكات',
        descriptionEn: 'Employee registration in social security and contribution tracking',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أسجّل موظفيّ في الضمان الاجتماعي اللبناني؟',
        chatPromptEn: 'How do I register my employees in Lebanese social security?',
      },
    ],
  },
  {
    id: 'sg-7',
    slug: 'industry',
    titleAr: 'وزارة الصناعة',
    titleEn: 'Ministry of Industry',
    icon: '🏭',
    color: '#78350F',
    priority: 6,
    descriptionAr: 'تراخيص المنشآت الصناعية والشهادات والنماذج الرسمية',
    descriptionEn: 'Industrial facility licenses, certificates, and official forms',
    services: [
      {
        id: 'si-7-1', slug: 'industrial-license', groupSlug: 'industry',
        titleAr: 'ترخيص إنشاء منشأة صناعية', titleEn: 'Industrial Facility License',
        descriptionAr: 'الحصول على ترخيص إنشاء أو استثمار منشأة صناعية من وزارة الصناعة',
        descriptionEn: 'Obtain an industrial facility establishment or investment license',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أحصل على ترخيص إنشاء منشأة صناعية في لبنان؟',
        chatPromptEn: 'How do I obtain an industrial facility license in Lebanon?',
      },
      {
        id: 'si-7-2', slug: 'industrial-certificate', groupSlug: 'industry',
        titleAr: 'الشهادة الصناعية', titleEn: 'Industrial Certificate',
        descriptionAr: 'طلب الشهادة الصناعية من وزارة الصناعة للمنشآت المرخّصة',
        descriptionEn: 'Request the industrial certificate for licensed facilities',
        defaultAction: 'ask_ai',
        availableFor: ['company'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أحصل على الشهادة الصناعية من وزارة الصناعة في لبنان؟',
        chatPromptEn: 'How do I obtain the industrial certificate from the Ministry of Industry?',
      },
      {
        id: 'si-7-3', slug: 'export-permit', groupSlug: 'industry',
        titleAr: 'إجازة تصدير', titleEn: 'Export Permit',
        descriptionAr: 'الحصول على إجازة تصدير المنتجات الصناعية اللبنانية',
        descriptionEn: 'Obtain an export permit for Lebanese industrial products',
        defaultAction: 'ask_ai',
        availableFor: ['company'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أحصل على إجازة تصدير منتجات صناعية لبنانية؟',
        chatPromptEn: 'How do I obtain an export permit for Lebanese industrial products?',
      },
      {
        id: 'si-7-4', slug: 'origin-certificate', groupSlug: 'industry',
        titleAr: 'تصديق شهادة المنشأ', titleEn: 'Certificate of Origin',
        descriptionAr: 'تصديق شهادة المنشأ للمنتجات اللبنانية من وزارة الصناعة',
        descriptionEn: 'Certify certificate of origin for Lebanese industrial products',
        defaultAction: 'ask_ai',
        availableFor: ['company'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أصدّق شهادة منشأ المنتجات الصناعية اللبنانية؟',
        chatPromptEn: 'How do I certify a certificate of origin for Lebanese products?',
      },
      {
        id: 'si-7-5', slug: 'industry-forms', groupSlug: 'industry',
        titleAr: 'نماذج وزارة الصناعة', titleEn: 'Ministry Forms',
        descriptionAr: 'تحميل النماذج الرسمية لوزارة الصناعة والطلبات الإدارية',
        descriptionEn: 'Download official Ministry of Industry forms',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'أين يمكنني تحميل نماذج وزارة الصناعة اللبنانية؟',
        chatPromptEn: 'Where can I download Ministry of Industry forms?',
      },
    ],
  },
  {
    id: 'sg-8',
    slug: 'labor',
    titleAr: 'وزارة العمل',
    titleEn: 'Ministry of Labor',
    icon: '👷',
    color: '#1E5C3A',
    priority: 7,
    descriptionAr: 'تصاريح العمل وعقود التوظيف والضمان الاجتماعي والنزاعات العمالية',
    descriptionEn: 'Work permits, employment contracts, social security, and labor disputes',
    services: [
      {
        id: 'si-8-1', slug: 'work-permit', groupSlug: 'labor',
        titleAr: 'إجازة عمل للأجانب', titleEn: 'Work Permit for Foreigners',
        descriptionAr: 'الحصول على إجازة عمل لعامل أجنبي من وزارة العمل اللبنانية',
        descriptionEn: 'Obtain a work permit for a foreign worker from the Lebanese Ministry of Labor',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أحصل على إجازة عمل لموظف أجنبي في لبنان؟',
        chatPromptEn: 'How do I obtain a work permit for a foreign employee in Lebanon?',
      },
      {
        id: 'si-8-2', slug: 'employment-contract', groupSlug: 'labor',
        titleAr: 'عقد عمل وفق قانون العمل', titleEn: 'Employment Contract',
        descriptionAr: 'إعداد عقد عمل وفق أحكام قانون العمل اللبناني وشروطه',
        descriptionEn: 'Prepare an employment contract compliant with Lebanese labor law',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي الشروط الإلزامية في عقد العمل وفق قانون العمل اللبناني؟',
        chatPromptEn: 'What are the mandatory terms in an employment contract under Lebanese labor law?',
      },
      {
        id: 'si-8-3', slug: 'nssf-registration', groupSlug: 'labor',
        titleAr: 'تسجيل في الضمان الاجتماعي', titleEn: 'NSSF Registration',
        descriptionAr: 'تسجيل الموظف في الصندوق الوطني للضمان الاجتماعي',
        descriptionEn: 'Register an employee with the National Social Security Fund (NSSF)',
        defaultAction: 'ask_ai',
        availableFor: ['company', 'citizen'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أسجّل موظفاً في الضمان الاجتماعي اللبناني؟',
        chatPromptEn: 'How do I register an employee with Lebanese social security (NSSF)?',
      },
      {
        id: 'si-8-4', slug: 'labor-dispute', groupSlug: 'labor',
        titleAr: 'نزاع عمالي وتقديم شكوى', titleEn: 'Labor Dispute & Complaint',
        descriptionAr: 'تقديم شكوى عمالية أمام وزارة العمل أو المحكمة العمالية',
        descriptionEn: 'File a labor complaint with the Ministry of Labor or labor court',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف أتقدم بشكوى عمالية ضد صاحب العمل في لبنان؟',
        chatPromptEn: 'How do I file a labor complaint against an employer in Lebanon?',
      },
      {
        id: 'si-8-5', slug: 'end-of-service', groupSlug: 'labor',
        titleAr: 'تعويض نهاية الخدمة', titleEn: 'End-of-Service Gratuity',
        descriptionAr: 'حساب تعويض نهاية الخدمة وإجراءات المطالبة به',
        descriptionEn: 'Calculate end-of-service gratuity and filing procedures',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'كيف تحتسب مكافأة نهاية الخدمة في لبنان وكيف أطالب بها؟',
        chatPromptEn: 'How is end-of-service gratuity calculated in Lebanon and how do I claim it?',
      },
    ],
  },
  {
    id: 'sg-6',
    slug: 'forms-docs',
    titleAr: 'النماذج والمستندات',
    titleEn: 'Forms & Documents',
    icon: '📄',
    color: '#5C4A3A',
    priority: 8,
    descriptionAr: 'البحث عن نماذج رسمية وتحليل المستندات وتوليد مسودات',
    descriptionEn: 'Find official forms, analyze documents, and generate drafts',
    services: [
      {
        id: 'si-6-1', slug: 'find-form', groupSlug: 'forms-docs',
        titleAr: 'البحث عن نموذج', titleEn: 'Find a Form',
        icon: '🔍',
        descriptionAr: 'البحث عن النماذج الرسمية اللبنانية ومواقع تحميلها',
        descriptionEn: 'Find Lebanese official forms and their download sources',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'expat', 'lawyer', 'company', 'service_office'], verificationStatus: 'verified',
        chatPromptAr: 'ابحث لي عن النموذج الرسمي المطلوب لهذه المعاملة',
        chatPromptEn: 'Find the official form required for this procedure',
      },
      {
        id: 'si-6-2', slug: 'analyze-document', groupSlug: 'forms-docs',
        titleAr: 'تحليل مستند', titleEn: 'Analyze Document',
        icon: '🔎',
        descriptionAr: 'رفع مستند لتحليله وكشف النواقص والمخاطر',
        descriptionEn: 'Upload a document for analysis, gap detection, and risk review',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'expat', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'قم بتحليل المستند الذي رفعته وأخبرني بالنواقص والمخاطر',
        chatPromptEn: 'Analyze the document I uploaded and tell me about gaps and risks',
      },
      {
        id: 'si-6-3', slug: 'detect-missing', groupSlug: 'forms-docs',
        titleAr: 'كشف النواقص', titleEn: 'Detect Missing Items',
        icon: '⚠️',
        descriptionAr: 'تحديد المستندات والبنود الناقصة في ملفك أو معاملتك',
        descriptionEn: 'Identify missing documents and items in your file or procedure',
        defaultAction: 'upload_document', requiresDocument: true,
        availableFor: ['citizen', 'lawyer'], verificationStatus: 'verified',
        chatPromptAr: 'ما هي المستندات الناقصة في هذا الملف؟',
        chatPromptEn: 'What documents are missing from this file?',
      },
      {
        id: 'si-6-4', slug: 'download-checklist', groupSlug: 'forms-docs',
        titleAr: 'تحميل Checklist', titleEn: 'Download Checklist',
        icon: '✅',
        descriptionAr: 'توليد وتحميل قائمة مرجعية مخصصة لمعاملتك',
        descriptionEn: 'Generate and download a customized checklist for your procedure',
        defaultAction: 'generate_checklist',
        availableFor: ['citizen', 'expat', 'lawyer', 'company'], verificationStatus: 'verified',
        chatPromptAr: 'أنشئ لي checklist شامل لهذه المعاملة',
        chatPromptEn: 'Create a comprehensive checklist for this procedure',
      },
      {
        id: 'si-6-5', slug: 'generate-draft', groupSlug: 'forms-docs',
        titleAr: 'توليد مسودة', titleEn: 'Generate Draft',
        icon: '✏️',
        descriptionAr: 'إنشاء مسودة أولية لعقد أو طلب أو رسالة رسمية',
        descriptionEn: 'Create a first draft of a contract, application, or official letter',
        defaultAction: 'ask_ai',
        availableFor: ['citizen', 'lawyer', 'company'], verificationStatus: 'draft',
        chatPromptAr: 'أنشئ لي مسودة أولية لـ',
        chatPromptEn: 'Create a first draft of a',
      },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getServiceGroup(slug: string): ServiceGroup | undefined {
  return SERVICE_GROUPS.find(g => g.slug === slug)
}

export function getServiceItem(slug: string): ServiceItem | undefined {
  for (const g of SERVICE_GROUPS) {
    const item = g.services.find(s => s.slug === slug)
    if (item) return item
  }
  return undefined
}

export function getServicesByGroup(groupSlug: string): ServiceItem[] {
  return getServiceGroup(groupSlug)?.services ?? []
}

export function getVerificationLabel(status: VerificationStatus, isAr: boolean): string {
  const map: Record<VerificationStatus, [string, string]> = {
    verified: ['موثّق', 'Verified'],
    partially_verified: ['موثّق جزئياً', 'Partially Verified'],
    needs_review: ['يحتاج مراجعة', 'Needs Review'],
    draft: ['مسودة', 'Draft'],
  }
  return map[status]?.[isAr ? 0 : 1] ?? status
}

export const EXPAT_PROPERTY_PACK_SERVICES = [
  'si-1-1', // وكالة من الخارج
  'si-1-2', // بيع عقار من الخارج
  'si-1-3', // تصديق مستندات
  'si-2-1', // بيع عقار
  'si-2-5', // عقار ضمن إرث
  'si-3-1', // تحليل عقد إيجار
  'si-3-2', // كشف الثغرات
  'si-3-5', // Checklist قبل التوقيع
  'si-6-3', // كشف النواقص
  'si-6-4', // تحميل Checklist
] as const
