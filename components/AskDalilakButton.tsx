'use client'
import React from 'react'

interface AskDalilakButtonProps {
  isAr: boolean
  onClick: () => void
  /** When provided (non-empty), the label becomes "Ask about: {searchTerm}" instead of the plain "Ask Dalilak". */
  searchTerm?: string
  /** Fully overrides the label text, taking priority over searchTerm. */
  label?: string
  style?: React.CSSProperties
}

export default function AskDalilakButton({ isAr, onClick, searchTerm, label, style }: AskDalilakButtonProps) {
  const text =
    label ??
    (searchTerm
      ? isAr
        ? `اسأل دليلك عن: ${searchTerm}`
        : `Ask about: ${searchTerm}`
      : isAr
      ? 'اسأل دليلك'
      : 'Ask Dalilak')

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={onClick}
      style={{
        padding: '10px 22px',
        borderRadius: 12,
        background: 'var(--brand)',
        border: 'none',
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      {text}
    </button>
  )
}
