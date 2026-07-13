// ── Flow type definitions for GuidedFlow 3.0 ─────────────────
// Flow definitions live separately from UI components.
// Each procedure has a FlowDefinition with deterministic steps.

export type FlowOption = {
  value: string
  labelAr: string
  labelEn: string
}

export type FlowCondition = {
  questionId: string
  operator: 'equals' | 'includes' | 'not_equals'
  value: string | string[]
}

export type FlowStep = {
  id: string
  questionAr: string
  questionEn: string
  hintAr?: string
  hintEn?: string
  type: 'single_choice' | 'multi_choice' | 'text' | 'date' | 'file'
  required: boolean
  options?: FlowOption[]
  showIf?: FlowCondition
}

export type FlowDefinition = {
  procedureSlug: string
  titleAr: string
  titleEn: string
  country: 'lebanon' | 'syria' | 'both'
  descriptionAr?: string
  descriptionEn?: string
  steps: FlowStep[]
}

export type FlowAnswers = Record<string, string | string[]>

export type FlowRequest = {
  procedureSlug: string
  country: 'lebanon' | 'syria' | 'both'
  userType: string
  answers: FlowAnswers
  desiredOutput: 'checklist' | 'steps' | 'forms' | 'full_guidance'
  language: 'ar' | 'en'
}

/** Build a structured chat prompt from a completed flow */
export function buildFlowPrompt(req: FlowRequest, isAr: boolean): string {
  const proc = req.procedureSlug
  const answerPairs = Object.entries(req.answers)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join(' | ')
  const outputLabel = {
    checklist: { ar: 'قائمة المستندات (Checklist)', en: 'checklist' },
    steps: { ar: 'الخطوات الكاملة', en: 'step-by-step guide' },
    forms: { ar: 'النماذج المطلوبة', en: 'required forms' },
    full_guidance: { ar: 'الدليل الكامل', en: 'full guidance' },
  }[req.desiredOutput]

  if (isAr) {
    return (
      `[أجب بتنسيق منظّم مع عناوين ## واضحة: ## الخلاصة | ## المستندات المطلوبة | ## الخطوات | ## الجهة المختصة | ## الرسوم | ## تنبيه مهم]\n` +
      `أحتاج ${outputLabel.ar} لمعاملة "${proc}" في ${req.country === 'lebanon' ? 'لبنان' : 'سوريا'}. ` +
      `نوع المستخدم: ${req.userType}. التفاصيل: ${answerPairs}`
    )
  }
  return (
    `[Answer in organized format with ## headers: ## Summary | ## Required Documents | ## Steps | ## Authority | ## Fees | ## Warning]\n` +
    `I need ${outputLabel.en} for the "${proc}" procedure in ${req.country}. ` +
    `User type: ${req.userType}. Details: ${answerPairs}`
  )
}
