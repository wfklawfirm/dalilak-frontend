'use client'

import React from 'react'
import { MissingDocument } from '@/lib/types'

interface RequiredDoc {
  title: string
  required: boolean
  notes?: string
}

interface Props {
  missingDocs: MissingDocument[]
  requiredDocs?: RequiredDoc[]
  uploadedDocIds?: string[]
  onUpload?: (docTitle: string) => void
  lang?: 'ar' | 'en'
}

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  critical: { background: '#FEF2F2', color: '#8B1A1A', border: '1px solid rgba(139,26,26,0.25)' },
  high:     { background: '#FFF7ED', color: '#ea580c', border: '1px solid #FED7AA' },
  medium:   { background: '#FFFBEB', color: '#B8860B', border: '1px solid #FDE68A' },
  low:      { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' },
}

const PRIORITY_AR: Record<string, string> = {
  critical: 'حرج',
  high:     'عالي',
  medium:   'متوسط',
  low:      'منخفض',
}

export default function MissingDocumentsChecklist({
  missingDocs,
  requiredDocs = [],
  uploadedDocIds = [],
  onUpload,
}: Props) {
  const missingMap = new Map(missingDocs.map((d) => [d.title, d]))

  const allDocs: Array<{ title: string; required: boolean; notes?: string; missing?: MissingDocument }> =
    requiredDocs.length > 0
      ? requiredDocs.map((rd) => ({ ...rd, missing: missingMap.get(rd.title) }))
      : missingDocs.map((d) => ({ title: d.title, required: d.required, missing: d }))

  const total = allDocs.length
  const uploaded = allDocs.filter((d) => !d.missing || d.missing.status === 'uploaded').length

  if (total === 0) {
    return (
      <div dir="rtl" style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#9C8E80', fontFamily: "'Cairo','Inter',sans-serif" }}>
        لا توجد وثائق مطلوبة
      </div>
    )
  }

  const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: "'Cairo','Inter',sans-serif" }}>
      {/* Summary row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1208', margin: 0 }}>
          {uploaded} من {total} وثائق مكتملة
        </p>
        <div style={{ width: 120, background: '#EAE4D9', borderRadius: 99, height: 5, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            width: `${pct}%`, height: 5, borderRadius: 99,
            background: pct === 100 ? '#16a34a' : 'linear-gradient(90deg, #8B1A1A, #6b2737)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Document list */}
      <div style={{ borderRadius: 12, border: '1px solid #EAE4D9', overflow: 'hidden' }}>
        {allDocs.map((doc, i) => {
          const isMissing = doc.missing && doc.missing.status !== 'uploaded'
          const isUploaded = !isMissing
          const needsReview = doc.missing?.status === 'needs_review'

          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: isUploaded ? 'rgba(240,253,244,0.5)' : '#fff',
                borderBottom: i < allDocs.length - 1 ? '1px solid #EAE4D9' : 'none',
              }}
            >
              {/* Status icon */}
              <span style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isUploaded ? '#16a34a' : needsReview ? '#B8860B' : '#8B1A1A',
              }}>
                {isUploaded
                  ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : needsReview
                  ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01"/></svg>
                  : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>}
              </span>

              {/* Title + notes */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: isUploaded ? '#6B7280' : '#1A1208', margin: '0 0 1px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {doc.title}
                  {doc.required && !isUploaded && (
                    <span style={{ color: '#8B1A1A', fontSize: 11, fontWeight: 800 }}>*</span>
                  )}
                </p>
                {doc.missing?.reason && !isUploaded && (
                  <p style={{ fontSize: 11, color: '#9C8E80', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.missing.reason}</p>
                )}
                {doc.notes && (
                  <p style={{ fontSize: 11, color: '#B0A090', margin: 0 }}>{doc.notes}</p>
                )}
              </div>

              {/* Priority badge + upload button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {isMissing && doc.missing?.priority && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                    ...(PRIORITY_STYLE[doc.missing.priority] || PRIORITY_STYLE.low),
                  }}>
                    {PRIORITY_AR[doc.missing.priority] || doc.missing.priority}
                  </span>
                )}
                {isMissing && onUpload && (
                  <button
                    onClick={() => onUpload(doc.title)}
                    style={{
                      fontSize: 11, background: 'linear-gradient(135deg, #8B1A1A, #6b2737)',
                      color: '#fff', padding: '4px 12px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', fontWeight: 700,
                      fontFamily: "'Cairo','Inter',sans-serif",
                    }}
                  >
                    رفع
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: 11, color: '#9C8E80', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
        القائمة أولية — تأكد من المصادر الرسمية قبل تقديم الطلب
      </p>
    </div>
  )
}
