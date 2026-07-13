import type { FlowDefinition } from './types'

export const companyFormationFlow: FlowDefinition = {
  procedureSlug: 'company-registration',
  titleAr: 'تأسيس شركة',
  titleEn: 'Company Formation',
  country: 'lebanon',
  steps: [
    {
      id: 'company_type',
      questionAr: 'ما نوع الشركة التي تريد تأسيسها؟',
      questionEn: 'What type of company?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'sal', labelAr: 'شركة مساهمة (SAL)', labelEn: 'Joint-stock company (SAL)' },
        { value: 'sarl', labelAr: 'شركة ذ.م.م (SARL)', labelEn: 'LLC (SARL)' },
        { value: 'sole', labelAr: 'مؤسسة فردية', labelEn: 'Sole proprietorship' },
        { value: 'unknown', labelAr: 'لم أحدد بعد', labelEn: 'Not decided yet' },
      ],
    },
    {
      id: 'sector',
      questionAr: 'ما قطاع النشاط؟',
      questionEn: 'Business sector?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'trade', labelAr: 'تجاري', labelEn: 'Trade' },
        { value: 'services', labelAr: 'خدمي', labelEn: 'Services' },
        { value: 'industrial', labelAr: 'صناعي', labelEn: 'Industrial' },
        { value: 'tech', labelAr: 'تقني / رقمي', labelEn: 'Tech / Digital' },
        { value: 'financial', labelAr: 'مالي / استثماري', labelEn: 'Financial / Investment' },
      ],
    },
    {
      id: 'founders',
      questionAr: 'كم عدد المؤسسين؟',
      questionEn: 'Number of founders?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'one', labelAr: 'مؤسس واحد', labelEn: 'One founder' },
        { value: 'two_five', labelAr: '2 – 5 مؤسسين', labelEn: '2–5 founders' },
        { value: 'more', labelAr: 'أكثر من 5', labelEn: 'More than 5' },
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
