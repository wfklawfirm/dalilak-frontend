'use client'

// دليلك — زر "حفظ في ملفاتي" لأي خارطة إجراء (يدوية أو مولّدة بالذكاء الاصطناعي)
//
// يربط نظامين كانا منفصلين: خرائط الإجراء (useFlowchart/useFlowchartProgress، محلية
// بالكامل عبر localStorage، تعمل حتى بدون تسجيل دخول) ونظام "ملفاتي" في الباك-إند
// (POST /my-procedures، يتطلب تسجيل دخول، ويظهر في app/my-files). قبل هذا الملف لم
// يكن هناك أي زر في التطبيق يستدعي POST /my-procedures فعلياً، فكانت "ملفاتي" تبقى
// فارغة دائماً لأي مستخدم حقيقي رغم وجود الـ backend/الصفحة كاملين.
//
// يبني قائمة الخطوات (checklist) والمستندات المطلوبة مباشرة من عُقد خارطة الإجراء
// الحالية، لذا يعمل لأي slug له خارطة — سواء كانت من الـ 6 المُوثّقة يدوياً أو
// مولّدة بالذكاء الاصطناعي لأي من الـ 367 خدمة + 92 إجراء + 2,484 معاملة.

import React, { useState } from 'react'
import Link from 'next/link'
import { isLoggedIn, startTrackingProcedure } from '@/lib/auth'
import type { ProcedureFlowchart } from '@/lib/knowledgeGraph'

interface Props {
  slug: string
  titleAr: string
  flowchart: ProcedureFlowchart | null
  isAr: boolean
  compact?: boolean
}

export default function SaveToMyFilesButton({ slug, titleAr, flowchart, isAr, compact }: Props) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const loggedIn = isLoggedIn()

  if (!flowchart) return null

  const handleSave = async () => {
    if (state === 'saving' || state === 'saved') return
    setState('saving')
    try {
      const stepNodes = flowchart.nodes.filter(n => n.type !== 'start' && n.type !== 'completion')
      const checklist = stepNodes.map((n, i) => ({
        step: i + 1,
        title_ar: n.titleAr,
        desc_ar: n.descriptionAr || '',
      }))
      const docNames = Array.from(new Set(flowchart.nodes.flatMap(n => n.requiredDocuments || [])))
      const documents = docNames.map(name_ar => ({ name_ar, required: true }))
      await startTrackingProcedure({ procedure_id: slug, title_ar: titleAr, checklist, documents })
      setState('saved')
    } catch {
      setState('error')
    }
  }

  const boxStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    marginTop: compact ? 10 : 14, padding: compact ? '8px 12px' : '10px 14px',
    borderRadius: 12, fontFamily: "'Cairo','Inter',sans-serif",
  }

  if (!loggedIn) {
    return (
      <div style={{ ...boxStyle, background: '#FAFAF8', border: '1px dashed #D5CEC4' }}>
        <span style={{ fontSize: 11.5, color: '#69645C' }}>
          {isAr ? 'سجّل الدخول لحفظ هذه المعاملة ومتابعة تقدّمها في "ملفاتي"' : 'Log in to save this procedure and track it in "My Files"'}
        </span>
        <Link
          href="/login"
          style={{ fontSize: 11.5, fontWeight: 700, color: '#8F1D2C', textDecoration: 'none', border: '1px solid rgba(143,29,44,0.3)', borderRadius: 8, padding: '4px 12px', whiteSpace: 'nowrap' }}
        >
          {isAr ? 'تسجيل الدخول' : 'Log in'}
        </Link>
      </div>
    )
  }

  if (state === 'saved') {
    return (
      <div style={{ ...boxStyle, background: '#F5FBF8', border: '1px solid rgba(6,95,70,0.25)' }}>
        <span style={{ fontSize: 11.5, color: '#065F46', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          {isAr ? 'تم الحفظ في ملفاتي' : 'Saved to My Files'}
        </span>
        <Link
          href="/my-files"
          style={{ fontSize: 11.5, fontWeight: 700, color: '#065F46', textDecoration: 'none', border: '1px solid rgba(6,95,70,0.3)', borderRadius: 8, padding: '4px 12px', whiteSpace: 'nowrap' }}
        >
          {isAr ? 'عرض ملفاتي' : 'View My Files'}
        </Link>
      </div>
    )
  }

  return (
    <div style={{ ...boxStyle, background: '#FEF7F7', border: '1px solid rgba(143,29,44,0.15)' }}>
      <span style={{ fontSize: 11.5, color: '#69645C' }}>
        {isAr ? 'احفظ هذه المعاملة في "ملفاتي" لمتابعة تقدّمك من أي جهاز' : 'Save this procedure to "My Files" to track your progress from any device'}
      </span>
      <button
        type="button"
        onClick={handleSave}
        disabled={state === 'saving'}
        style={{
          fontSize: 11.5, fontWeight: 700, color: '#fff', background: state === 'error' ? '#8F1D2C' : 'linear-gradient(135deg, #8F1D2C, #741622)',
          border: 'none', borderRadius: 8, padding: '6px 14px', cursor: state === 'saving' ? 'default' : 'pointer',
          fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: state === 'saving' ? 0.7 : 1,
        }}
      >
        {state === 'saving' ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : state === 'error' ? (isAr ? 'حاول مجدداً' : 'Retry') : (isAr ? 'حفظ في ملفاتي' : 'Save to My Files')}
      </button>
    </div>
  )
}
