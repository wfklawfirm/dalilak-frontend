import type { FlowDefinition } from './types'

export const marriageRegistrationFlow: FlowDefinition = {
  procedureSlug: 'marriage-registration',
  titleAr: 'تسجيل الزواج',
  titleEn: 'Marriage Registration',
  country: 'lebanon',
  steps: [
    {
      id: 'marriage_type',
      questionAr: 'ما نوع عقد الزواج؟',
      questionEn: 'Type of marriage contract?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'religious', labelAr: 'زواج ديني (كنسي أو شرعي)', labelEn: 'Religious marriage (church or sharia)' },
        { value: 'civil_abroad', labelAr: 'زواج مدني في الخارج', labelEn: 'Civil marriage abroad' },
      ],
    },
    {
      id: 'status',
      questionAr: 'هل الزواج جديد أم تسجيل زواج سابق؟',
      questionEn: 'New marriage or registering an existing one?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'new', labelAr: 'عقد زواج جديد', labelEn: 'New marriage contract' },
        { value: 'register_existing', labelAr: 'تسجيل زواج تمّ سابقاً داخل لبنان', labelEn: 'Register a previously completed marriage (inside Lebanon)' },
        { value: 'from_abroad', labelAr: 'تسجيل زواج تمّ في الخارج', labelEn: 'Register a marriage completed abroad' },
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
