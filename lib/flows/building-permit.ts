import type { FlowDefinition } from './types'

export const buildingPermitFlow: FlowDefinition = {
  procedureSlug: 'building-permit',
  titleAr: 'رخصة البناء',
  titleEn: 'Building Permit',
  country: 'lebanon',
  steps: [
    {
      id: 'project_type',
      questionAr: 'ما نوع المشروع؟',
      questionEn: 'Project type?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'new_building', labelAr: 'بناء جديد', labelEn: 'New construction' },
        { value: 'addition', labelAr: 'إضافة على بناء قائم', labelEn: 'Addition to existing building' },
        { value: 'renovation', labelAr: 'ترميم / تجديد', labelEn: 'Renovation / Restoration' },
        { value: 'demolish', labelAr: 'هدم', labelEn: 'Demolition' },
      ],
    },
    {
      id: 'zone_known',
      questionAr: 'هل تعرف المنطقة العقارية ورقم العقار؟',
      questionEn: 'Do you know the cadastral zone and parcel number?',
      type: 'single_choice',
      required: false,
      options: [
        { value: 'yes', labelAr: 'نعم، لدي رقم العقار والمنطقة', labelEn: 'Yes, I have the parcel and zone' },
        { value: 'no', labelAr: 'لا', labelEn: 'No' },
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
