import type { FlowDefinition } from './types'

export const propertySaleFlow: FlowDefinition = {
  procedureSlug: 'property-transfer',
  titleAr: 'بيع / شراء عقار',
  titleEn: 'Property Sale / Purchase',
  country: 'lebanon',
  steps: [
    {
      id: 'role',
      questionAr: 'ما دورك في المعاملة؟',
      questionEn: 'Your role in this transaction?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'seller', labelAr: 'أنا البائع', labelEn: 'I am the seller' },
        { value: 'buyer', labelAr: 'أنا المشتري', labelEn: 'I am the buyer' },
        { value: 'agent', labelAr: 'وسيط / محامي', labelEn: 'Agent / Lawyer' },
      ],
    },
    {
      id: 'property_type',
      questionAr: 'ما نوع العقار؟',
      questionEn: 'Property type?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'apartment', labelAr: 'شقة سكنية', labelEn: 'Residential apartment' },
        { value: 'land', labelAr: 'أرض', labelEn: 'Land' },
        { value: 'commercial', labelAr: 'عقار تجاري', labelEn: 'Commercial property' },
        { value: 'building', labelAr: 'مبنى كامل', labelEn: 'Full building' },
      ],
    },
    {
      id: 'mortgaged',
      questionAr: 'هل العقار مرهون أو عليه حجز؟',
      questionEn: 'Is the property mortgaged or has a lien?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'yes', labelAr: 'نعم', labelEn: 'Yes' },
        { value: 'no', labelAr: 'لا', labelEn: 'No' },
        { value: 'unknown', labelAr: 'لا أعرف', labelEn: 'Unknown' },
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
