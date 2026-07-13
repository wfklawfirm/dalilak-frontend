import type { FlowDefinition } from './types'

export const expatServicesFlow: FlowDefinition = {
  procedureSlug: 'expat-services',
  titleAr: 'خدمات المغتربين',
  titleEn: 'Expat Services',
  country: 'lebanon',
  steps: [
    {
      id: 'country',
      questionAr: 'في أي دولة أنت حالياً؟',
      questionEn: 'Which country are you currently in?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'gulf', labelAr: 'دول الخليج', labelEn: 'Gulf countries' },
        { value: 'europe', labelAr: 'أوروبا', labelEn: 'Europe' },
        { value: 'america', labelAr: 'أمريكا الشمالية / كندا', labelEn: 'North America / Canada' },
        { value: 'africa', labelAr: 'أفريقيا', labelEn: 'Africa' },
        { value: 'other', labelAr: 'دولة أخرى', labelEn: 'Other country' },
      ],
    },
    {
      id: 'procedure',
      questionAr: 'ما المعاملة التي تريد إنجازها من الخارج؟',
      questionEn: 'What procedure do you need to complete from abroad?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'poa', labelAr: 'توكيل رسمي', labelEn: 'Power of attorney' },
        { value: 'document', labelAr: 'استخراج وثيقة', labelEn: 'Get an official document' },
        { value: 'real_estate', labelAr: 'معاملة عقارية', labelEn: 'Real estate transaction' },
        { value: 'civil_status', labelAr: 'أحوال شخصية', labelEn: 'Civil status matter' },
        { value: 'inheritance', labelAr: 'إرث', labelEn: 'Inheritance' },
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
