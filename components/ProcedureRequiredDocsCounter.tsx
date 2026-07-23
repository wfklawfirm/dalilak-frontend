'use client'

/**
 * ProcedureRequiredDocsCounter — "X of Y documents ready" live tally,
 * reading the same LS keys written by ProcedureDocumentStatus
 * (dalilak_doc_ready_{code}_{docIndex}).
 *
 * Props: { code: string; totalDocs: number; isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  code: string
  totalDocs: number
  isAr: boolean
}

function countReady(code: string, total: number): number {
  let ready = 0
  try {
    for (let i = 0; i < total; i++) {
      if (localStorage.getItem(`dalilak_doc_ready_${code}_${i}`)) ready++
    }
  } catch {}
  return ready
}

export default function ProcedureRequiredDocsCounter({ code, totalDocs, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(0)

  useEffect(() => {
    setMounted(true)
    setReady(countReady(code, totalDocs))
    const refresh = () => setReady(countReady(code, totalDocs))
    window.addEventListener('dalilak_saved_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_saved_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [code, totalDocs])

  if (!mounted || totalDocs === 0) return null

  const complete = ready === totalDocs

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px',
        borderRadius: 8,
        fontSize: 10, fontWeight: 700,
        background: complete ? '#D1FAE5' : '#F3F4F6',
        color: complete ? '#065F46' : '#4B5563',
      }}
    >
      {complete ? '✅' : '📎'} {ready}/{totalDocs} {isAr ? 'وثائق جاهزة' : 'docs ready'}
    </span>
  )
}
