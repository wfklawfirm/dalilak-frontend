'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormItem } from '@/lib/types'
import { getProcedureBySlug } from '@/lib/procedures'

interface Props {
  form: FormItem
}

const BRAND = '#8B1A1A'
const GOLD  = '#B8860B'

export default function FormDetailClient({ form }: Props) {
  const router = useRouter()
  const [isAr, setIsAr] = useState(true)

  useEffect(() => {
    const lang = typeof window !== 'undefined' ? localStorage.getItem('dalilak_lang') : null
    setIsAr(lang !== 'en')
  }, [])

  const title    = isAr ? form.title_ar    : form.title_en
  const authority = isAr ? form.authority_ar : form.authority_en
  const ministry  = isAr ? form.ministry_ar  : form.ministry_en
  const category  = isAr ? form.category_ar  : form.category_en
  const dir       = isAr ? 'rtl' : 'ltr'

  const fileIcon = form.fileType === 'pdf' ? '📄' : form.fileType === 'word' ? '📝' : '🔗'

  const relatedProcedures = (form.relatedProcedures ?? [])
    .map(slug => getProcedureBySlug(slug))
    .filter(Boolean)

  const handleDownload = () => {
    if (form.url) window.open(form.url, '_blank', 'noopener,noreferrer')
  }

  const handleAskAI = () => {
    const prompt = isAr ? form.chatPrompt_ar : form.chatPrompt_en
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dalilak_prefill', prompt)
    }
    router.push('/')
  }

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: '#FAF8F5', fontFamily: isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ background: BRAND, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
          {isAr ? '← رجوع' : '← Back'}
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{category}</p>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h1>
        </div>
        {form.type === 'official' && (
          <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
            {isAr ? '✓ رسمي' : '✓ Official'}
          </span>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Form card ── */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 40 }}>{fileIcon}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: '#555' }}>{authority}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{ministry}</p>
            </div>
          </div>

          {/* File type badge */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#F3EDE3', color: BRAND, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
              {form.fileType?.toUpperCase() ?? 'LINK'}
            </span>
            <span style={{ background: form.type === 'official' ? '#E8F5E9' : '#FFF9E6', color: form.type === 'official' ? '#2E7D32' : '#B8860B', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
              {form.type === 'official' ? (isAr ? 'نموذج رسمي' : 'Official Form') : isAr ? 'مسودة' : 'Draft'}
            </span>
            {form.lastReviewed && (
              <span style={{ background: '#F5F5F5', color: '#666', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {isAr ? `آخر مراجعة: ${form.lastReviewed}` : `Last reviewed: ${form.lastReviewed}`}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {form.url && (
              <button
                onClick={handleDownload}
                style={{ background: BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {fileIcon} {isAr ? 'فتح النموذج' : 'Open Form'}
              </button>
            )}
            <button
              onClick={handleAskAI}
              style={{ background: '#fff', color: BRAND, border: `1.5px solid ${BRAND}`, borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              🤖 {isAr ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}
            </button>
          </div>
        </div>

        {/* ── How to use ── */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
            📋 {isAr ? 'كيفية استخدام هذا النموذج' : 'How to use this form'}
          </h3>
          <ol style={{ margin: 0, paddingInlineStart: 20, color: '#444', fontSize: 14, lineHeight: 1.8 }}>
            <li>{isAr ? 'افتح النموذج أو نزّله بالضغط على الزر أعلاه.' : 'Open or download the form using the button above.'}</li>
            <li>{isAr ? 'اقرأ التعليمات بعناية قبل التعبئة.' : 'Read instructions carefully before filling.'}</li>
            <li>{isAr ? 'تأكد من صحة جميع المعلومات المُدخلة.' : 'Verify all entered information is correct.'}</li>
            <li>{isAr ? 'قدّم النموذج للجهة المعنية مع الوثائق المطلوبة.' : 'Submit the form to the relevant authority with required documents.'}</li>
          </ol>
        </div>

        {/* ── Related procedures ── */}
        {relatedProcedures.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #EAE4D9', padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
              🔗 {isAr ? 'معاملات ذات صلة' : 'Related Procedures'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {relatedProcedures.map(p => p && (
                <button
                  key={p.slug}
                  onClick={() => router.push(`/procedures/${p.slug}`)}
                  style={{ background: '#FAF8F5', border: '1px solid #EAE4D9', borderRadius: 12, padding: '12px 14px', textAlign: isAr ? 'right' : 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{isAr ? p.title_ar : p.title_en}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{isAr ? p.category_ar : p.category_en}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <div style={{ background: '#FFF9E6', border: '1px solid #F0E0A0', borderRadius: 14, padding: '12px 16px' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#7A6020', lineHeight: 1.7 }}>
            ⚠️ {isAr
              ? 'هذه المعلومات للإرشاد فقط. تأكد دائماً من النموذج الحالي من الجهة الرسمية المختصة قبل الاستخدام.'
              : 'This information is for guidance only. Always confirm the current form with the competent official authority before use.'}
          </p>
        </div>

      </div>
    </div>
  )
}
