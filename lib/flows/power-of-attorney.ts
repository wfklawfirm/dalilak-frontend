import type { FlowDefinition } from './types'

export const powerOfAttorneyFlow: FlowDefinition = {
  procedureSlug: 'power-of-attorney',
  titleAr: 'الوكالة الرسمية',
  titleEn: 'Power of Attorney',
  country: 'lebanon',
  steps: [
    {
      id: 'poa_type',
      questionAr: 'ما نوع الوكالة؟',
      questionEn: 'Type of power of attorney?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'general', labelAr: 'وكالة عامة', labelEn: 'General POA' },
        { value: 'special', labelAr: 'وكالة خاصة (لغرض محدد)', labelEn: 'Special POA (specific purpose)' },
        { value: 'real_estate', labelAr: 'وكالة عقارية', labelEn: 'Real estate POA' },
        { value: 'bank', labelAr: 'وكالة مصرفية', labelEn: 'Banking POA' },
      ],
    },
    {
      id: 'grantor_location',
      questionAr: 'أين موكّل الوكالة (الشخص الذي يمنح الوكالة)؟',
      questionEn: 'Where is the grantor (person giving the POA)?',
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
