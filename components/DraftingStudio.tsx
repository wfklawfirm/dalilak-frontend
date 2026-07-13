'use client'

import React, { useState } from 'react'

interface Props {
  isAr: boolean
  initialTemplateSlug?: string
  prefillData?: Record<string, string>
  onSend?: (prompt: string) => void
  onClose?: () => void
}

interface Template {
  slug: string
  titleAr: string
  titleEn: string
  icon: string
  descriptionAr: string
}

interface FieldDef {
  key: string
  labelAr: string
  labelEn: string
  type: 'text' | 'textarea' | 'date'
  required: boolean
  placeholder?: string
}

const TEMPLATES: Template[] = [
  { slug: 'eviction-notice', titleAr: 'إنذار إخلاء', titleEn: 'Eviction Notice', icon: '🏠', descriptionAr: 'إشعار رسمي للمستأجر بالإخلاء' },
  { slug: 'contract-extension', titleAr: 'تمديد عقد', titleEn: 'Contract Extension', icon: '📋', descriptionAr: 'تمديد عقد إيجار أو خدمات' },
  { slug: 'objection-letter', titleAr: 'رسالة اعتراض', titleEn: 'Objection Letter', icon: '✉️', descriptionAr: 'اعتراض رسمي على قرار أو إجراء' },
  { slug: 'administrative-request', titleAr: 'طلب إداري', titleEn: 'Administrative Request', icon: '📝', descriptionAr: 'طلب رسمي لجهة حكومية' },
  { slug: 'power-of-attorney-draft', titleAr: 'مسودة وكالة', titleEn: 'Power of Attorney Draft', icon: '⚖️', descriptionAr: 'وكالة قانونية بصلاحيات محددة' },
  { slug: 'handover-minutes', titleAr: 'محضر تسليم', titleEn: 'Handover Minutes', icon: '🤝', descriptionAr: 'محضر تسليم واستلام رسمي' },
  { slug: 'receipt-acknowledgment', titleAr: 'إيصال استلام', titleEn: 'Receipt Acknowledgment', icon: '🧾', descriptionAr: 'وثيقة إثبات استلام مستندات أو أموال' },
  { slug: 'lawyer-referral', titleAr: 'طلب إحالة محامٍ', titleEn: 'Lawyer Referral', icon: '👨‍⚖️', descriptionAr: 'طلب تحويل قضية لمحامٍ مرخّص' },
]

const FIELD_DEFS: Record<string, FieldDef[]> = {
  'eviction-notice': [
    { key: 'landlordName', labelAr: 'اسم المالك', labelEn: 'Landlord Name', type: 'text', required: true },
    { key: 'tenantName', labelAr: 'اسم المستأجر', labelEn: 'Tenant Name', type: 'text', required: true },
    { key: 'propertyAddress', labelAr: 'عنوان العقار', labelEn: 'Property Address', type: 'text', required: true },
    { key: 'noticeDate', labelAr: 'تاريخ الإشعار', labelEn: 'Notice Date', type: 'date', required: true },
    { key: 'reasonForEviction', labelAr: 'سبب الإخلاء', labelEn: 'Reason for Eviction', type: 'textarea', required: true },
    { key: 'deadline', labelAr: 'موعد الإخلاء النهائي', labelEn: 'Eviction Deadline', type: 'date', required: true },
  ],
  'contract-extension': [
    { key: 'partyOne', labelAr: 'الطرف الأول', labelEn: 'Party One', type: 'text', required: true },
    { key: 'partyTwo', labelAr: 'الطرف الثاني', labelEn: 'Party Two', type: 'text', required: true },
    { key: 'originalDate', labelAr: 'تاريخ العقد الأصلي', labelEn: 'Original Contract Date', type: 'date', required: true },
    { key: 'newEndDate', labelAr: 'تاريخ الانتهاء الجديد', labelEn: 'New End Date', type: 'date', required: true },
    { key: 'modifications', labelAr: 'التعديلات المُدرجة', labelEn: 'Modifications', type: 'textarea', required: false },
  ],
  'objection-letter': [
    { key: 'senderName', labelAr: 'اسم المُرسِل', labelEn: 'Sender Name', type: 'text', required: true },
    { key: 'recipientName', labelAr: 'اسم الجهة المُرسَل إليها', labelEn: 'Recipient Name', type: 'text', required: true },
    { key: 'subject', labelAr: 'موضوع الاعتراض', labelEn: 'Subject', type: 'text', required: true },
    { key: 'objectionReason', labelAr: 'سبب الاعتراض', labelEn: 'Reason for Objection', type: 'textarea', required: true },
    { key: 'requestedAction', labelAr: 'الإجراء المطلوب', labelEn: 'Requested Action', type: 'textarea', required: true },
  ],
  'administrative-request': [
    { key: 'requesterName', labelAr: 'اسم مقدّم الطلب', labelEn: 'Requester Name', type: 'text', required: true },
    { key: 'requestSubject', labelAr: 'موضوع الطلب', labelEn: 'Request Subject', type: 'text', required: true },
    { key: 'requestDetails', labelAr: 'تفاصيل الطلب', labelEn: 'Request Details', type: 'textarea', required: true },
    { key: 'desiredOutcome', labelAr: 'النتيجة المرجوة', labelEn: 'Desired Outcome', type: 'textarea', required: false },
  ],
  'power-of-attorney-draft': [
    { key: 'grantor', labelAr: 'الموكِّل (صاحب الوكالة)', labelEn: 'Grantor', type: 'text', required: true },
    { key: 'attorney', labelAr: 'الوكيل', labelEn: 'Attorney', type: 'text', required: true },
    { key: 'scope', labelAr: 'نطاق الصلاحيات', labelEn: 'Scope of Authority', type: 'textarea', required: true },
    { key: 'limitations', labelAr: 'القيود والاستثناءات', labelEn: 'Limitations', type: 'textarea', required: false },
    { key: 'duration', labelAr: 'مدة الوكالة', labelEn: 'Duration', type: 'text', required: false, placeholder: 'مثال: سنة واحدة' },
  ],
}

const GENERIC_FIELDS: FieldDef[] = [
  { key: 'partyOne', labelAr: 'الطرف الأول', labelEn: 'Party One', type: 'text', required: true },
  { key: 'subject', labelAr: 'الموضوع', labelEn: 'Subject', type: 'text', required: true },
  { key: 'details', labelAr: 'التفاصيل', labelEn: 'Details', type: 'textarea', required: true },
]

type Stage = 1 | 2 | 3

export default function DraftingStudio({ isAr, initialTemplateSlug, prefillData, onSend, onClose }: Props) {
  const [stage, setStage] = useState<Stage>(initialTemplateSlug ? 2 : 1)
  const [selectedSlug, setSelectedSlug] = useState<string>(initialTemplateSlug || '')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(prefillData || {})
  const [previewPrompt, setPreviewPrompt] = useState('')

  const selectedTemplate = TEMPLATES.find(t => t.slug === selectedSlug)
  const fields = selectedSlug ? (FIELD_DEFS[selectedSlug] || GENERIC_FIELDS) : GENERIC_FIELDS

  const handleSelectTemplate = (slug: string) => {
    setSelectedSlug(slug)
    setStage(2)
  }

  const buildPrompt = () => {
    const tpl = TEMPLATES.find(t => t.slug === selectedSlug)
    const lines = [`أنشئ مسودة ${tpl?.titleAr || 'وثيقة قانونية'} باللغة العربية بأسلوب قانوني رسمي لبناني.`]
    lines.push('')
    lines.push('المعلومات المدخلة:')
    for (const field of fields) {
      const val = fieldValues[field.key]
      if (val) lines.push(`- ${field.labelAr}: ${val}`)
    }
    lines.push('')
    lines.push('المطلوب: وثيقة منسقة تشمل المقدمة والبنود والتوقيعات. اكتب بالعربية فقط.')
    return lines.join('\n')
  }

  const handleGeneratePreview = () => {
    const prompt = buildPrompt()
    setPreviewPrompt(prompt)
    setStage(3)
  }

  const handleSend = () => {
    if (onSend) onSend(previewPrompt)
  }

  const stageLabels = ['اختر النموذج', 'أدخل البيانات', 'معاينة']

  return (
    <div style={{ fontFamily: "'Cairo','Inter',sans-serif", maxWidth: 640, margin: '0 auto' }} dir={isAr ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: '0 0 4px' }}>
            ✏️ {isAr ? 'استوديو الصياغة' : 'Drafting Studio'}
          </h2>
          <p style={{ fontSize: 11.5, color: '#9C8E80', margin: 0 }}>
            {isAr ? 'أنشئ مسودات قانونية أولية بالذكاء الاصطناعي' : 'Generate legal draft documents with AI'}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: '#6B7280' }}>✕</button>
        )}
      </div>

      {/* Stage indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#F3F4F6', borderRadius: 10, padding: 4 }}>
        {stageLabels.map((label, i) => {
          const s = (i + 1) as Stage
          return (
            <div key={i} style={{
              flex: 1,
              textAlign: 'center',
              padding: '6px 4px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              background: stage === s ? '#fff' : 'transparent',
              color: stage === s ? '#8B1A1A' : stage > s ? '#16a34a' : '#9CA3AF',
              boxShadow: stage === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: stage > s ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }} onClick={() => { if (stage > s) setStage(s) }}>
              {stage > s ? '✓' : s}. {isAr ? label : ['Select Template', 'Enter Data', 'Preview'][i]}
            </div>
          )
        })}
      </div>

      {/* STAGE 1: Template Picker */}
      {stage === 1 && (
        <div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            {isAr ? 'اختر نوع الوثيقة التي تريد إنشاءها:' : 'Choose the type of document you want to create:'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TEMPLATES.map(tpl => (
              <button key={tpl.slug} onClick={() => handleSelectTemplate(tpl.slug)} style={{
                padding: '14px 12px',
                background: '#fff',
                border: '1.5px solid #EAE4D9',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: isAr ? 'right' : 'left',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#8B1A1A'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EAE4D9'; (e.currentTarget as HTMLElement).style.background = '#fff' }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{tpl.icon}</div>
                <p style={{ fontSize: 12.5, fontWeight: 800, color: '#1A1208', margin: '0 0 3px' }}>{isAr ? tpl.titleAr : tpl.titleEn}</p>
                <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0, lineHeight: 1.4 }}>{tpl.descriptionAr}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: Field Collector */}
      {stage === 2 && selectedTemplate && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.15)', borderRadius: 12 }}>
            <span style={{ fontSize: 22 }}>{selectedTemplate.icon}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#8B1A1A', margin: 0 }}>{isAr ? selectedTemplate.titleAr : selectedTemplate.titleEn}</p>
              <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>{selectedTemplate.descriptionAr}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  {isAr ? field.labelAr : field.labelEn}
                  {field.required && <span style={{ color: '#DC2626', marginRight: 3 }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || ''}
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', color: '#1A1208', direction: 'rtl' }}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || ''}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #EAE4D9', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#1A1208', direction: field.type === 'date' ? 'ltr' : 'rtl' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setStage(1)} style={{ padding: '11px 20px', background: '#fff', color: '#6B7280', border: '1.5px solid #EAE4D9', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
              {isAr ? '← رجوع' : '← Back'}
            </button>
            <button onClick={handleGeneratePreview} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {isAr ? 'معاينة المسودة ←' : 'Preview Draft →'}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Preview */}
      {stage === 3 && (
        <div>
          <div style={{ background: '#F9FAFB', border: '1.5px solid #EAE4D9', borderRadius: 12, padding: '14px 16px', marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAr ? 'الطلب الذي سيُرسل للذكاء الاصطناعي:' : 'Prompt to be sent to AI:'}
            </p>
            <pre style={{ fontSize: 12, color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'inherit', direction: 'rtl' }}>
              {previewPrompt}
            </pre>
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FEF08A', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#854D0E', margin: 0, lineHeight: 1.5 }}>
              ⚠️ {isAr
                ? 'هذه مسودة أولية للإرشاد فقط. يُنصح بمراجعة محامٍ مرخّص قبل استخدام أي وثيقة رسمية.'
                : 'This is a preliminary draft for guidance only. Please consult a licensed lawyer before using any official document.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStage(2)} style={{ padding: '11px 20px', background: '#fff', color: '#6B7280', border: '1.5px solid #EAE4D9', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
              {isAr ? '← تعديل' : '← Edit'}
            </button>
            <button onClick={handleSend} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139,26,26,0.3)' }}>
              🤖 {isAr ? 'توليد المسودة بالذكاء الاصطناعي' : 'Generate Draft with AI'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
