'use client'

// دليلك — تتبّع تقدّم المستخدم عبر خارطة إجراء معيّنة (حفظ واستكمال)
//
// يخزّن محلياً (localStorage) أي خطوات أنجزها المستخدم وأي مستندات جهّزها لكل slug على حدة،
// بحيث لو أغلق الصفحة ورجع لاحقاً — أو أعاد فتح نفس الإجراء من جهاز آخر بعد تسجيل الدخول
// (تحسين لاحق ممكن: مزامنة هذا مع transactions API) — يجد تقدّمه محفوظاً بدل البدء من الصفر.

import { useState, useCallback, useEffect } from 'react'

const PREFIX = 'dalilak_fc_progress_'
const VERSION = 'v1'

interface ProgressState {
  completedNodes: string[]
  checkedDocs: string[]
}

const EMPTY: ProgressState = { completedNodes: [], checkedDocs: [] }

function read(slug: string): ProgressState {
  if (typeof window === 'undefined' || !slug) return EMPTY
  try {
    const raw = window.localStorage.getItem(PREFIX + slug)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    if (parsed?.__v !== VERSION) return EMPTY
    return {
      completedNodes: Array.isArray(parsed.completedNodes) ? parsed.completedNodes : [],
      checkedDocs: Array.isArray(parsed.checkedDocs) ? parsed.checkedDocs : [],
    }
  } catch {
    return EMPTY
  }
}

function write(slug: string, state: ProgressState): void {
  if (typeof window === 'undefined' || !slug) return
  try {
    window.localStorage.setItem(PREFIX + slug, JSON.stringify({ __v: VERSION, ...state, updatedAt: Date.now() }))
  } catch {
    /* localStorage قد يكون ممتلئاً أو غير متاح — نتجاهل بصمت */
  }
}

export function useFlowchartProgress(slug: string) {
  const [state, setState] = useState<ProgressState>(() => read(slug))

  useEffect(() => { setState(read(slug)) }, [slug])

  const toggleNode = useCallback((nodeId: string) => {
    setState(prev => {
      const has = prev.completedNodes.includes(nodeId)
      const next: ProgressState = {
        ...prev,
        completedNodes: has ? prev.completedNodes.filter(id => id !== nodeId) : [...prev.completedNodes, nodeId],
      }
      write(slug, next)
      return next
    })
  }, [slug])

  const toggleDoc = useCallback((doc: string) => {
    setState(prev => {
      const has = prev.checkedDocs.includes(doc)
      const next: ProgressState = {
        ...prev,
        checkedDocs: has ? prev.checkedDocs.filter(d => d !== doc) : [...prev.checkedDocs, doc],
      }
      write(slug, next)
      return next
    })
  }, [slug])

  const reset = useCallback(() => {
    write(slug, EMPTY)
    setState(EMPTY)
  }, [slug])

  return {
    completedNodes: state.completedNodes,
    checkedDocs: state.checkedDocs,
    isNodeDone: (id: string) => state.completedNodes.includes(id),
    isDocChecked: (doc: string) => state.checkedDocs.includes(doc),
    toggleNode,
    toggleDoc,
    reset,
  }
}
