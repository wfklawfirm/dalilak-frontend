'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProcedureBySlug, getComplexityColor, getComplexityBg, getComplexityLabel } from '@/lib/procedures'

export default function ProcedureDetailClient() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const proc = getProcedureBySlug(slug)

  if (!proc) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo','Inter',sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 18, color: '#1A1208', marginBottom: 8 }}>المعاملة غير موجودة</h2>
          <button onClick={() => router.push('/procedures')} style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
            عودة للدليل
          </button>
        </div>
      </div>
    )
  }

  const askAI = () => {
    const q = isAr ? proc.chatPrompt_ar : proc.chatPrompt_en
    router.push(`/?q=${encodeURIComponent(q)}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '12px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/procedures')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            {isAr ? 'الدليل' : 'Directory'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{proc.icon}</span>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* Hero card */}
        <div style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 20, padding: '20px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)', border: '1.5px solid rgba(139,26,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {proc.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: 0 }}>
                  {isAr ? proc.title_ar : proc.title_en}
                </h1>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: getComplexityColor(proc.complexity), background: getComplexityBg(proc.complexity), borderRadius: 8, padding: '2px 8px' }}>
                  {getComplexityLabel(proc.complexity, isAr)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#9C8E80', margin: '0 0 10px', lineHeight: 1.6 }}>
                {isAr ? proc.description_ar : proc.description_en}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px' }}>
                  📁 {isAr ? proc.category_ar : proc.category_en}
                </span>
                {proc.estimatedDuration_ar && (
                  <span style={{ fontSize: 10.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px' }}>
                    ⏱️ {isAr ? proc.estimatedDuration_ar : proc.estimatedDuration_en}
                  </span>
                )}
                {proc.lastReviewed && (
                  <span style={{ fontSize: 10.5, color: '#9C8E80', background: '#F5F5F5', borderRadius: 8, padding: '2px 9px' }}>
                    🗓️ {isAr ? `آخر مراجعة: ${proc.lastReviewed}` : `Last reviewed: ${proc.lastReviewed}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={askAI} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139,26,26,0.3)' }}>
            🤖 {isAr ? 'اسأل دليلك AI' : 'Ask Dalilak AI'}
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '12px 16px', background: '#fff', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🗂️ {isAr ? 'المعالج' : 'Wizard'}
          </button>
        </div>

        {/* Playbook link */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => router.push(`/procedures/${slug}/playbook`)} style={{ width: '100%', padding: '11px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📋 {isAr ? 'دليل التنفيذ — خارطة الإجراء' : 'Playbook — Procedure Map'}
          </button>
        </div>

        {/* Required Documents */}
        {proc.requiredDocuments.length > 0 && (
          <Section title={isAr ? '📋 المستندات المطلوبة' : '📋 Required Documents'} bg="#F0FDF4" border="#BBF7D0">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proc.requiredDocuments.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: '#15803D', fontWeight: 700, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1208' }}>{isAr ? doc.name_ar : doc.name_en}</span>
                    {doc.original_required && <span style={{ fontSize: 9.5, color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '0 5px', marginRight: 5 }}>{isAr ? 'أصل' : 'original'}</span>}
                    {doc.copies_required && <span style={{ fontSize: 9.5, color: '#6B7280' }}> ×{doc.copies_required}</span>}
                    {(isAr ? doc.notes_ar : doc.notes_en) && <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>{isAr ? doc.notes_ar : doc.notes_en}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Steps */}
        {proc.steps.length > 0 && (
          <Section title={isAr ? '📝 الخطوات' : '📝 Steps'} bg="#FFF7ED" border="#FED7AA">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {proc.steps.map((step) => (
                <div key={step.step} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#8B1A1A', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {step.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>{isAr ? step.title_ar : step.title_en}</p>
                    {(isAr ? step.description_ar : step.description_en) && (
                      <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{isAr ? step.description_ar : step.description_en}</p>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {step.authority && <span style={{ fontSize: 10, color: '#6D28D9', background: '#F5F3FF', borderRadius: 6, padding: '1px 7px' }}>🏛️ {step.authority}</span>}
                      {step.duration && <span style={{ fontSize: 10, color: '#B45309', background: '#FFFBEB', borderRadius: 6, padding: '1px 7px' }}>⏱️ {step.duration}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Authority */}
        {proc.authority && (
          <Section title={isAr ? '🏛️ الجهة المختصة' : '🏛️ Responsible Authority'} bg="#F5F3FF" border="#DDD6FE">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', margin: 0 }}>{isAr ? proc.authority.name_ar : proc.authority.name_en}</p>
              {proc.authority.ministry_ar && <p style={{ fontSize: 12, color: '#6D28D9', margin: 0 }}>{isAr ? proc.authority.ministry_ar : proc.authority.ministry_en}</p>}
              {proc.authority.address_ar && <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>📍 {isAr ? proc.authority.address_ar : proc.authority.address_en}</p>}
              {proc.authority.phone && <a href={`tel:${proc.authority.phone}`} style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none' }}>📞 {proc.authority.phone}</a>}
              {proc.authority.website && <a href={proc.authority.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#8B1A1A', textDecoration: 'none' }}>🌐 {proc.authority.website}</a>}
              {proc.authority.workingHours_ar && <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>🕒 {isAr ? proc.authority.workingHours_ar : proc.authority.workingHours_en}</p>}
            </div>
          </Section>
        )}

        {/* Fees */}
        {proc.fees.length > 0 && (
          <Section title={isAr ? '💰 الرسوم' : '💰 Fees'} bg="#FAF5FF" border="#E9D5FF">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proc.fees.map((fee, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: i < proc.fees.length - 1 ? '1px solid #E9D5FF' : 'none', paddingBottom: i < proc.fees.length - 1 ? 8 : 0 }}>
                  <span style={{ fontSize: 13, color: '#1A1208' }}>{isAr ? fee.label_ar : fee.label_en}</span>
                  {fee.amount && <span style={{ fontSize: 13, fontWeight: 700, color: '#7E22CE' }}>{fee.amount}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Forms */}
        {proc.forms.length > 0 && (
          <Section title={isAr ? '📄 النماذج الرسمية' : '📄 Official Forms'} bg="#FEFCE8" border="#FEF08A">
            {proc.forms.map((form, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < proc.forms.length - 1 ? '1px solid #FEF08A' : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1208', margin: 0 }}>{isAr ? form.title_ar : form.title_en}</p>
                  {(isAr ? form.notes_ar : form.notes_en) && <p style={{ fontSize: 11, color: '#9C8E80', margin: '2px 0 0' }}>{isAr ? form.notes_ar : form.notes_en}</p>}
                </div>
                {form.url && (
                  <a href={form.url} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 12px', background: '#8B1A1A', color: '#fff', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>
                    {isAr ? 'فتح ↗' : 'Open ↗'}
                  </a>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Sources */}
        {proc.sources.length > 0 && (
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#FAFAF8', border: '1px solid #F0EBE0', borderRadius: 12 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9C8E80', margin: '0 0 6px' }}>
              {isAr ? 'المصادر الرسمية:' : 'Official Sources:'}
            </p>
            {proc.sources.map((src, i) => (
              <div key={i}>
                {src.url ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#8B1A1A', display: 'block' }}>{src.title}</a>
                ) : (
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{src.title}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children, bg, border }: { title: string; children: React.ReactNode; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1A1208', margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${border}` }}>{title}</h3>
      {children}
    </div>
  )
}
