import type { FlowDefinition } from './types'

export const passportFlow: FlowDefinition = {
  procedureSlug: 'passport',
  titleAr: 'جواز السفر',
  titleEn: 'Passport',
  country: 'lebanon',
  steps: [
    {
      id: 'location',
      questionAr: 'أين أنت حالياً؟',
      questionEn: 'Where are you currently?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'inside_lebanon', labelAr: 'داخل لبنان', labelEn: 'Inside Lebanon' },
        { value: 'expat', labelAr: 'خارج لبنان (مغترب)', labelEn: 'Outside Lebanon (expat)' },
      ],
    },
    {
      id: 'request_type',
      questionAr: 'ما نوع الطلب؟',
      questionEn: 'Type of request?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'new', labelAr: 'استخراج جواز جديد', labelEn: 'New passport' },
        { value: 'renew', labelAr: 'تجديد جواز منتهي الصلاحية', labelEn: 'Renew expired passport' },
        { value: 'replace', labelAr: 'استبدال جواز مفقود أو تالف', labelEn: 'Replace lost / damaged passport' },
      ],
    },
    {
      id: 'applicant_age',
      questionAr: 'الجواز لمن؟',
      questionEn: 'Passport is for?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'adult', labelAr: 'بالغ (18 سنة وأكثر)', labelEn: 'Adult (18+)' },
        { value: 'minor', labelAr: 'قاصر (أقل من 18 سنة)', labelEn: 'Minor (under 18)' },
      ],
    },
    {
      id: 'desired_output',
      questionAr: 'ماذا تريد بالضبط؟',
      questionEn: 'What exactly do you need?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'checklist', labelAr: 'قائمة المستندات المطلوبة', labelEn: 'Required documents list' },
        { value: 'steps', labelAr: 'الخطوات من البداية للنهاية', labelEn: 'Step-by-step guide' },
        { value: 'full_guidance', labelAr: 'الدليل الكامل (مستندات + خطوات + رسوم)', labelEn: 'Full guidance (docs + steps + fees)' },
      ],
    },
  ],
}
