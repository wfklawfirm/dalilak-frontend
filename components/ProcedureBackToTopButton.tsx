'use client'

/**
 * ProcedureBackToTopButton — floating "back to top" button for the long
 * /procedures list page, appears after scrolling past a threshold.
 * Uses window scroll (the procedures page scrolls the window, not an
 * inner container — distinct from ChatScrollToBottomButton which targets
 * the chat's internal scroll container).
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect, useCallback } from 'react'

interface Props {
  isAr: boolean
}

export default function ProcedureBackToTopButton({ isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!mounted || !visible) return null

  return (
    <button
      onClick={scrollUp}
      aria-label={isAr ? 'العودة للأعلى' : 'Back to top'}
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 100,
        insetInlineEnd: 16,
        width: 40, height: 40,
        borderRadius: '50%',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 40,
      }}
    >
      ↑
    </button>
  )
}
