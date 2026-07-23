'use client'

/**
 * ProcedureDocumentPhotoTips — collapsible generic guidance on how to
 * photograph/scan required documents so they're accepted (good lighting,
 * flat surface, all corners visible, no glare). Static, general-purpose
 * advice — not tied to any specific document or office.
 *
 * Props: { isAr: boolean }
 */

import React, { useState } from 'react'

interface Props {
  isAr: boolean
}

const TIPS_AR = [
  'صوّر الوثيقة على سطح مستوٍ وتحت إضاءة جيدة بدون ظل',
  'تأكد من ظهور جميع زوايا وحواف الوثيقة في الصورة',
  'تجنّب الوهج أو الانعكاس الضوئي على الوثيقة (خصوصاً البطاقات المصفّحة)',
  'استخدم وضعية "مستند" أو "Document scan" إن توفرت في تطبيق الكاميرا',
  'تأكد أن كل النصوص والأرقام واضحة وغير مموّهة قبل الرفع',
]

const TIPS_EN = [
  'Photograph the document on a flat surface under even, shadow-free lighting',
  'Make sure all four corners and edges of the document are visible',
  'Avoid glare or reflections (especially on laminated cards)',
  'Use your camera\'s "Document scan" mode if available',
  'Check that all text and numbers are sharp and readable before uploading',
]

export default function ProcedureDocumentPhotoTips({ isAr }: Props) {
  const [expanded, setExpanded] = useState(false)
  const tips = isAr ? TIPS_AR : TIPS_EN

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', padding: '4px 0',
        }}
      >
        <span style={{ fontSize: 14 }}>📸</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#4B5563' }}>
          {isAr ? 'نصائح لتصوير الوثائق' : 'Tips for photographing documents'}
        </span>
        <span style={{ fontSize: 10, color: '#9CA3AF' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <ul style={{
          margin: '8px 0 0', padding: isAr ? '0 18px 0 0' : '0 0 0 18px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {tips.map((t, i) => (
            <li key={i} style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.6 }}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
