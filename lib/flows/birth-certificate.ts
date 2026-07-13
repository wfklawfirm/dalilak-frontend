import type { FlowDefinition } from './types'

export const birthCertificateFlow: FlowDefinition = {
  procedureSlug: 'birth-certificate',
  titleAr: 'شهادة الميلاد',
  titleEn: 'Birth Certificate',
  country: 'lebanon',
  steps: [
    {
      id: 'timing',
      questionAr: 'متى وُلد الطفل؟',
      questionEn: 'When was the child born?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'recent', labelAr: 'حديثاً (أقل من شهر)', labelEn: 'Recently (under 1 month)' },
        { value: 'months', labelAr: 'منذ أشهر', labelEn: 'A few months ago' },
        { value: 'years', labelAr: 'منذ سنوات (تسجيل متأخر)', labelEn: 'Years ago (late registration)' },
      ],
    },
    {
      id: 'birth_location',
      questionAr: 'أين كانت الولادة؟',
      questionEn: 'Where was the birth?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'hospital', labelAr: 'مستشفى أو مركز صحي', labelEn: 'Hospital / Health center' },
        { value: 'home', labelAr: 'منزل', labelEn: 'Home' },
        { value: 'abroad', labelAr: 'خارج لبنان', labelEn: 'Outside Lebanon' },
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
