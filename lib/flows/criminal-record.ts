import type { FlowDefinition } from './types'

export const criminalRecordFlow: FlowDefinition = {
  procedureSlug: 'criminal-record',
  titleAr: 'السجل العدلي',
  titleEn: 'Criminal Record',
  country: 'lebanon',
  steps: [
    {
      id: 'purpose',
      questionAr: 'لأي غرض تحتاج السجل العدلي؟',
      questionEn: 'Purpose of the criminal record?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'work', labelAr: 'عمل / توظيف', labelEn: 'Work / Employment' },
        { value: 'travel', labelAr: 'سفر / تأشيرة', labelEn: 'Travel / Visa' },
        { value: 'legal', labelAr: 'غرض قانوني', labelEn: 'Legal purpose' },
        { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
      ],
    },
    {
      id: 'location',
      questionAr: 'أين أنت حالياً؟',
      questionEn: 'Where are you?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'inside', labelAr: 'داخل لبنان', labelEn: 'Inside Lebanon' },
        { value: 'outside', labelAr: 'خارج لبنان', labelEn: 'Outside Lebanon' },
      ],
    },
    {
      id: 'desired_output',
      questionAr: 'ماذا تريد؟',
      questionEn: 'What do you need?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'checklist', labelAr: 'قائمة المستندات', labelEn: 'Documents checklist' },
        { value: 'steps', labelAr: 'الخطوات', labelEn: 'Step-by-step guide' },
        { value: 'full_guidance', labelAr: 'الدليل الكامل', labelEn: 'Full guidance' },
      ],
    },
  ],
}
