'use client'
import React from 'react'

interface ModalCloseButtonProps {
  onClick: () => void
  isAr: boolean
  size?: number
  iconSize?: number
  style?: React.CSSProperties
}

export default function ModalCloseButton({ onClick, isAr, size = 28, iconSize = 11, style }: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isAr ? 'إغلاق' : 'Close'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#E6E2DC',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#69645C',
        transition: 'background 0.12s',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
