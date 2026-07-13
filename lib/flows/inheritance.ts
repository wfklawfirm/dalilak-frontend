import type { FlowDefinition } from './types'

export const inheritanceFlow: FlowDefinition = {
  procedureSlug: 'inheritance-certificate',
  titleAr: 'حصر الإرث',
  titleEn: 'Inheritance Certificate',
  country: 'lebanon',
  steps: [
    {
      id: 'role',
      questionAr: 'ما صفتك في الإرث؟',
      questionEn: 'Your role in the inheritance?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'heir', labelAr: 'وارث مباشر', labelEn: 'Direct heir' },
        { value: 'lawyer', labelAr: 'محامي / وكيل', labelEn: 'Lawyer / Agent' },
        { value: 'accountant', labelAr: 'محاسب', labelEn: 'Accountant' },
      ],
    },
    {
      id: 'religion',
      questionAr: 'ما المذهب الديني للمتوفى؟',
      questionEn: 'Religious sect of the deceased?',
      hintAr: 'يؤثر على المرجع القضائي المختص',
      hintEn: 'Affects the competent court',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'sunni', labelAr: 'سني', labelEn: 'Sunni' },
        { value: 'shia', labelAr: 'شيعي', labelEn: 'Shia' },
        { value: 'christian', labelAr: 'مسيحي', labelEn: 'Christian' },
        { value: 'druze', labelAr: 'درزي', labelEn: 'Druze' },
        { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
      ],
    },
    {
      id: 'assets',
      questionAr: 'هل توجد عقارات ضمن التركة؟',
      questionEn: 'Are there real estate assets in the estate?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'yes', labelAr: 'نعم، عقارات', labelEn: 'Yes, real estate' },
        { value: 'no', labelAr: 'لا، فقط منقولات', labelEn: 'No, movable assets only' },
        { value: 'both', labelAr: 'عقارات ومنقولات', labelEn: 'Both real estate and movables' },
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
