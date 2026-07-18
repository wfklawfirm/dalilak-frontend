'use client'

// دليلك — خارطة الإجراء بالذكاء الاصطناعي، مرتبطة بكل خدمة/إجراء/معاملة
//
// الفكرة: بدل الاقتصار على 6 خرائط مُعدّة يدوياً (lib/flowchartData.ts)، هذا الخطّاف
// يعمل لأي slug في التطبيق (من 367 خدمة + 92 إجراء + 2,484 معاملة):
//  1) يتحقق أولاً من الخرائط المُوثّقة يدوياً (FLOWCHARTS) — أعلى جودة، أولوية قصوى.
//  2) يتحقق من ذاكرة التخزين المؤقت في المتصفح (localStorage) — تفادي إعادة التوليد.
//  3) وإلا يستدعي الباك-إند (/flowchart/generate) لتوليد خارطة احترافية عبر GPT-4o،
//     ثم يخزّنها محلياً لهذا الـ slug.

import { useState, useCallback, useEffect, useRef } from 'react'
import { FLOWCHARTS } from './flowchartData'
import { generateFlowchart } from './auth'
import type { ProcedureFlowchart } from './knowledgeGraph'

const CACHE_PREFIX = 'dalilak_fc_'
const CACHE_VERSION = 'v1'

export interface FlowchartSourceInfo {
  slug: string
  titleAr: string
  titleEn?: string
  category?: string
  authority?: string
  fees?: string
  processingTime?: string
  requiredDocuments?: string[]
  descriptionAr?: string
  knownSteps?: string[]
}

function readCache(slug: string): ProcedureFlowchart | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + slug)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.__v !== CACHE_VERSION || !parsed?.data) return null
    return parsed.data as ProcedureFlowchart
  } catch {
    return null
  }
}

function writeCache(slug: string, data: ProcedureFlowchart): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CACHE_PREFIX + slug, JSON.stringify({ __v: CACHE_VERSION, data }))
  } catch {
    /* localStorage قد يكون ممتلئاً أو غير متاح — نتجاهل بصمت */
  }
}

interface UseFlowchartResult {
  flowchart: ProcedureFlowchart | null
  loading: boolean
  error: string | null
  isAiGenerated: boolean
  generate: () => void
}

/**
 * خطّاف للحصول على خارطة إجراء لأي slug — يدوية إن وُجدت، وإلا مولّدة بالذكاء الاصطناعي عند الطلب.
 * @param source بيانات المصدر (العنوان، الجهة، الرسوم، المستندات...) تُستخدم فقط عند الحاجة للتوليد
 * @param autoGenerate إن كانت true، يولّد الخارطة تلقائياً فور عدم توفر نسخة يدوية/مخزّنة
 */
export function useFlowchart(source: FlowchartSourceInfo | null, autoGenerate = false): UseFlowchartResult {
  const slug = source?.slug || ''
  const curated = slug ? FLOWCHARTS[slug] : undefined

  const [flowchart, setFlowchart] = useState<ProcedureFlowchart | null>(curated || (slug ? readCache(slug) : null))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestedRef = useRef<string>('')

  const generate = useCallback(() => {
    if (!source || !source.slug || curated) return
    if (loading) return
    const cached = readCache(source.slug)
    if (cached) { setFlowchart(cached); return }

    setLoading(true)
    setError(null)
    generateFlowchart({
      slug: source.slug,
      titleAr: source.titleAr,
      titleEn: source.titleEn,
      category: source.category,
      authority: source.authority,
      fees: source.fees,
      processingTime: source.processingTime,
      requiredDocuments: source.requiredDocuments,
      descriptionAr: source.descriptionAr,
      knownSteps: source.knownSteps,
    })
      .then((data: ProcedureFlowchart) => {
        setFlowchart(data)
        writeCache(source.slug, data)
      })
      .catch((e: Error) => {
        setError(e.message || 'تعذّر توليد خارطة الإجراء')
      })
      .finally(() => setLoading(false))
  }, [source, curated, loading])

  useEffect(() => {
    if (!slug) return
    // عند تغيّر الـ slug: استخدم اليدوية أو المخزّنة إن وُجدت فوراً
    const next = curated || readCache(slug)
    setFlowchart(next || null)
    setError(null)
    if (!next && autoGenerate && requestedRef.current !== slug) {
      requestedRef.current = slug
      generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return { flowchart, loading, error, isAiGenerated: !curated && !!flowchart, generate }
}
