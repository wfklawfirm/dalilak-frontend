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
  descriptionAr: string
}

function TemplateIcon({ slug, size = 24 }: { slug: string; size?: number }) {
  const s = { width: size, height: size } as const
  if (slug === 'eviction-notice') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  )
  if (slug === 'contract-extension') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  )
  if (slug === 'objection-letter') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
  if (slug === 'power-of-attorney-draft') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
    </svg>
  )
  if (slug === 'handover-minutes') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
  if (slug === 'receipt-acknowledgment') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>
    </svg>
  )
  if (slug === 'lawyer-referral') return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  )
  return (
    <svg aria-hidden="true" {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  )
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
  { slug: 'eviction-notice', titleAr: 'إنذار إخلاء', titleEn: 'Eviction Notice', descriptionAr: 'إشعار رسمي للمستأجر بالإخلاء' },
  { slug: 'contract-extension', titleAr: 'تمديد عقد', titleEn: 'Contract Extension', descriptionAr: 'تمديد عقد إيجار أو خدمات' },
  { slug: 'objection-letter', titleAr: 'رسالة اعتراض', titleEn: 'Objection Letter', descriptionAr: 'اعتراض رسمي على قرار أو إجراء' },
  { slug: 'administrative-request', titleAr: 'طلب إداري', titleEn: 'Administrative Request', descriptionAr: 'طلب رسمي لجهة حكومية' },
  { slug: 'power-of-attorney-draft', titleAr: 'مسودة وكالة', titleEn: 'Power of Attorney Draft', descriptionAr: 'وكالة قانونية بصلاحيات محددة' },
  { slug: 'handover-minutes', titleAr: 'محضر تسليم', titleEn: 'Handover Minutes', descriptionAr: 'محضر تسليم واستلام رسمي' },
  { slug: 'receipt-acknowledgment', titleAr: 'إيصال استلام', titleEn: 'Receipt Acknowledgment', descriptionAr: 'وثيقة إثبات استلام مستندات أو أموال' },
  { slug: 'lawyer-referral', titleAr: 'طلب إحالة محامٍ', titleEn: 'Lawyer Referral', descriptionAr: 'طلب تحويل قضية لمحامٍ مرخّص' },
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
  'handover-minutes': [
    { key: 'deliverer', labelAr: 'المُسلِّم (الطرف المُسلِّم)', labelEn: 'Deliverer', type: 'text', required: true },
    { key: 'receiver', labelAr: 'المُستلِم (الطرف المُستلِم)', labelEn: 'Receiver', type: 'text', required: true },
    { key: 'handoverSubject', labelAr: 'موضوع التسليم', labelEn: 'Subject of Handover', type: 'text', required: true },
    { key: 'handoverDate', labelAr: 'تاريخ التسليم', labelEn: 'Handover Date', type: 'date', required: true },
    { key: 'itemsList', labelAr: 'قائمة المُسلَّمات (تفصيلية)', labelEn: 'Items Delivered (detailed)', type: 'textarea', required: true },
    { key: 'notes', labelAr: 'ملاحظات', labelEn: 'Notes', type: 'textarea', required: false },
  ],
  'receipt-acknowledgment': [
    { key: 'receiverName', labelAr: 'اسم المُستلِم', labelEn: 'Receiver Name', type: 'text', required: true },
    { key: 'senderName', labelAr: 'اسم المُرسِل / المُسلِّم', labelEn: 'Sender / Deliverer', type: 'text', required: true },
    { key: 'receiptDate', labelAr: 'تاريخ الاستلام', labelEn: 'Receipt Date', type: 'date', required: true },
    { key: 'itemReceived', labelAr: 'ما تم استلامه (مستندات / مبلغ / سلعة)', labelEn: 'Item(s) Received', type: 'textarea', required: true },
    { key: 'amountOrValue', labelAr: 'القيمة أو المبلغ (إن وجد)', labelEn: 'Amount / Value (if any)', type: 'text', required: false, placeholder: 'مثال: 500,000 ل.ل.' },
    { key: 'remarks', labelAr: 'ملاحظات إضافية', labelEn: 'Additional Remarks', type: 'textarea', required: false },
  ],
  'lawyer-referral': [
    { key: 'clientName', labelAr: 'اسم الموكّل / العميل', labelEn: 'Client Name', type: 'text', required: true },
    { key: 'caseDescription', labelAr: 'وصف القضية', labelEn: 'Case Description', type: 'textarea', required: true },
    { key: 'jurisdiction', labelAr: 'الاختصاص القضائي / المحكمة', labelEn: 'Jurisdiction / Court', type: 'text', required: false, placeholder: 'مثال: المحكمة الابتدائية في بيروت' },
    { key: 'urgency', labelAr: 'مستوى الإلحاح', labelEn: 'Urgency Level', type: 'text', required: false, placeholder: 'مثال: عاجل — جلسة خلال أسبوع' },
    { key: 'clientContact', labelAr: 'معلومات التواصل مع الموكّل', labelEn: 'Client Contact Info', type: 'text', required: true },
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

  const stageLabels = isAr
    ? ['اختر النموذج', 'أدخل البيانات', 'معاينة']
    : ['Choose Template', 'Enter Data', 'Preview']

  return (
    <div style={{ fontFamily: "'Cairo','Inter',sans-serif", maxWidth: 640, margin: '0 auto' }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes dsCard { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes dsFade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .ds-card-btn { animation: dsCard 0.22s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#191713', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            {isAr ? 'استوديو الصياغة' : 'Drafting Studio'}
          </h2>
          <p style={{ fontSize: 11.5, color: '#918B82', margin: 0 }}>
            {isAr ? 'أنشئ مسودات قانونية أولية عبر دليلك' : 'Generate initial legal drafts with Dalilak'}
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'}
            onTouchStart={e => { e.currentTarget.style.background = '#D5CEC4' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#E6E2DC' }}
            style={{ background: '#E6E2DC', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#69645C', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
        )}
      </div>

      {/* Stage indicator */}
      <nav aria-label={isAr ? 'خطوات الإنشاء' : 'Creation steps'} style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#E6E2DC', borderRadius: 10, padding: 4 }}>
        {stageLabels.map((label, i) => {
          const s = (i + 1) as Stage
          const clickable = stage > s
          return (
            <div key={i}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-current={stage === s ? 'step' : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') setStage(s) } : undefined}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 4px',
                minHeight: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                background: stage === s ? '#fff' : 'transparent',
                color: stage === s ? '#8F1D2C' : stage > s ? '#78350F' : '#918B82',
                boxShadow: stage === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              }} onClick={() => { if (clickable) setStage(s) }}>
              {stage > s ? <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : s}. {isAr ? label : ['Select Template', 'Enter Data', 'Preview'][i]}
            </div>
          )
        })}
      </nav>

      <div aria-live="polite" aria-atomic="false">
      {/* STAGE 1: Template Picker */}
      {stage === 1 && (
        <div>
          <p style={{ fontSize: 13, color: '#69645C', marginBottom: 14 }}>
            {isAr ? 'اختر نوع الوثيقة التي تريد إنشاءها:' : 'Choose the type of document you want to create:'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TEMPLATES.map((tpl, idx) => (
              <button key={tpl.slug} type="button" onClick={() => handleSelectTemplate(tpl.slug)} style={{
                padding: '14px 12px',
                background: '#fff',
                border: '1.5px solid #E6E2DC',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: isAr ? 'right' : 'left',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                animation: 'dsCard 0.22s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${Math.min(idx, 10) * 0.06}s`,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#8F1D2C'; el.style.background = '#F8EDEF'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 4px 16px rgba(143,29,44,0.10)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E6E2DC'; el.style.background = '#fff'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
              onTouchStart={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.background = '#F8EDEF'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                <div style={{ marginBottom: 10, width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg, #F8EDEF, #FDE4E4)', border: '1px solid rgba(143,29,44,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F1D2C', flexShrink: 0 }}><TemplateIcon slug={tpl.slug} size={20} /></div>
                <p style={{ fontSize: 12.5, fontWeight: 800, color: '#191713', margin: '0 0 3px' }}>{isAr ? tpl.titleAr : tpl.titleEn}</p>
                <p style={{ fontSize: 10.5, color: '#918B82', margin: 0, lineHeight: 1.4 }}>{tpl.descriptionAr}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: Field Collector */}
      {stage === 2 && selectedTemplate && (
        <div style={{ animation: 'dsFade 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 14px', background: '#F8EDEF', border: '1.5px solid rgba(143,29,44,0.15)', borderRadius: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(143,29,44,0.1)', border: '1px solid rgba(143,29,44,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F1D2C', flexShrink: 0 }}>
              <TemplateIcon slug={selectedTemplate.slug} size={20} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 800, color: '#8F1D2C', margin: '0 0 2px' }}>{isAr ? selectedTemplate.titleAr : selectedTemplate.titleEn}</p>
              <p style={{ fontSize: 10.5, color: '#918B82', margin: 0 }}>{selectedTemplate.descriptionAr}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map(field => (
              <div key={field.key}>
                <label htmlFor={`ds-field-${field.key}`} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#2D1B0E', marginBottom: 4 }}>
                  {isAr ? field.labelAr : field.labelEn}
                  {field.required && <span style={{ color: '#8F1D2C', marginRight: 3 }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`ds-field-${field.key}`}
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || (isAr ? field.labelAr : field.labelEn)}
                    rows={3}
                    aria-required={field.required}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E6E2DC', borderRadius: 10, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', color: '#191713', direction: 'rtl', transition: 'border-color 0.18s, box-shadow 0.18s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(143,29,44,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                ) : (
                  <input
                    id={`ds-field-${field.key}`}
                    type={field.type}
                    aria-required={field.required}
                    value={fieldValues[field.key] || ''}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || (isAr ? field.labelAr : field.labelEn)}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid #E6E2DC', borderRadius: 10,
                      fontSize: 13, fontFamily: 'inherit', outline: 'none',
                      color: '#191713', background: '#fff',
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(143,29,44,0.08)'; e.currentTarget.style.background = '#fff' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Stage 2 actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setStage(1)}
              onTouchStart={e => { e.currentTarget.style.background = '#F5F0EA'; e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E6E2DC' }}
              style={{
                flex: 1, padding: '11px', borderRadius: 12,
                border: '1.5px solid #E6E2DC', background: '#fff',
                color: '#69645C', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              {isAr ? 'رجوع' : 'Back'}
            </button>
            <button
              type="button"
              onClick={handleGeneratePreview}
              disabled={fields.filter(f => f.required).some(f => !fieldValues[f.key]?.trim())}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
                flex: 2, padding: '11px', borderRadius: 12,
                background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 3px 10px rgba(143,29,44,0.3)',
                opacity: fields.filter(f => f.required).some(f => !fieldValues[f.key]?.trim()) ? 0.5 : 1,
                transition: 'opacity 0.12s, transform 0.12s',
              }}
            >
              {isAr ? 'معاينة وإرسال' : 'Preview & Send'}
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Preview */}
      {stage === 3 && (
        <div style={{ animation: 'dsFade 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{
            background: '#FAFAF8', border: '1.5px solid #E6E2DC',
            borderRadius: 14, padding: '16px', marginBottom: 16,
            maxHeight: 280, overflowY: 'auto',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8F1D2C', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isAr ? 'الطلب المُرسَل للذكاء الاصطناعي' : 'Prompt sent to AI'}
            </p>
            <pre style={{ fontSize: 12, color: '#3D2A1E', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: 'inherit' }}>
              {previewPrompt}
            </pre>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setStage(2)}
              onTouchStart={e => { e.currentTarget.style.background = '#F5F0EA'; e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E6E2DC' }}
              style={{
                flex: 1, padding: '11px', borderRadius: 12,
                border: '1.5px solid #E6E2DC', background: '#fff',
                color: '#69645C', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              {isAr ? 'تعديل' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={handleSend}
              onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
                flex: 2, padding: '11px', borderRadius: 12,
                background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 3px 10px rgba(143,29,44,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.12s, transform 0.12s',
              }}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {isAr ? 'أرسل للمساعد' : 'Send to Assistant'}
            </button>
          </div>
        </div>
      )}
      </div>

    </div>
  )
}
