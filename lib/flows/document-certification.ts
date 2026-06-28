import type { FlowDefinition } from './types'

export const documentCertificationFlow: FlowDefinition = {
  procedureSlug: 'document-attestation',
  titleAr: 'تصديق مستند',
  titleEn: 'Document Certification',
  country: 'lebanon',
  steps: [
    {
      id: 'doc_type',
      questionAr: 'ما نوع المستند المراد تصديقه؟',
      questionEn: 'What type of document?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'academic', labelAr: 'شهادة أكاديمية / دراسية', labelEn: 'Academic certificate' },
        { value: 'civil', labelAr: 'وثيقة أحوال شخصية', labelEn: 'Civil status document' },
        { value: 'commercial', labelAr: 'وثيقة تجارية', labelEn: 'Commercial document' },
        { value: 'judicial', labelAr: 'وثيقة قضائية', labelEn: 'Judicial document' },
        { value: 'medical', labelAr: 'وثيقة طبية', labelEn: 'Medical document' },
      ],
    },
    {
      id: 'destination',
      questionAr: 'لأي جهة / دولة الوثيقة؟',
      questionEn: 'Destination country / authority?',
      type: 'single_choice',
      required: true,
      options: [
        { value: 'lebanon_internal', labelAr: 'جهة لبنانية داخلية', labelEn: 'Lebanese internal authority' },
        { value: 'embassy', labelAr: 'سفارة أجنبية في لبنان', labelEn: 'Foreign embassy in Lebanon' },
        { value: 'abroad', labelAr: 'دولة أجنبية (تصديق خارجي)', labelEn: 'Foreign country (external certification)' },
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
