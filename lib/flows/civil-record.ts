import type { FlowDefinition } from './types'

export const civilRecordFlow: FlowDefinition = {
  procedureSlug: 'civil-registry-extract',
  titleAr: 'إخراج القيد',
  titleEn: 'Civil Registry Extract',
  country: 'lebanon',
  steps: [
    {
      id: 'extract_type',
      questionAr: 'ما نوع إخراج القيد المطلوب؟',
      questionEn: 'What type of extract do you need?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'individual', labelAr: 'إخراج قيد فردي', labelEn: 'Individual extract' },
        { value: 'family', labelAr: 'إخراج قيد عائلي', labelEn: 'Family extract' },
      ],
    },
    {
      id: 'purpose',
      questionAr: 'لأي غرض تحتاجه؟',
      questionEn: 'What is it for?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'official_local', labelAr: 'معاملة رسمية داخلية', labelEn: 'Official local procedure' },
        { value: 'travel_embassy', labelAr: 'سفر أو سفارة', labelEn: 'Travel / Embassy' },
        { value: 'legal_court', labelAr: 'غرض قانوني أو قضائي', labelEn: 'Legal / Court purpose' },
        { value: 'marriage', labelAr: 'زواج', labelEn: 'Marriage' },
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
