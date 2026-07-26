'use client'
import React, { useId } from 'react'

interface LoadingSpinnerProps {
  isAr: boolean
  size?: number
  borderWidth?: number
  trackColor?: string
  spinColor?: string
  /** Overrides the default "Loading..." / "جارٍ التحميل..." text. */
  label?: string
  showLabel?: boolean
  labelColor?: string
  labelSize?: number
  /** Renders the full 100vh centered page wrapper (for route-level loading.tsx files). When false, renders just the inline spinner+label block for embedding inside an existing page layout. */
  fullPage?: boolean
  style?: React.CSSProperties
}

export default function LoadingSpinner({
  isAr,
  size = 36,
  borderWidth = 3,
  trackColor = '#E6E2DC',
  spinColor = '#8F1D2C',
  label,
  showLabel = true,
  labelColor = 'var(--text-3)',
  labelSize = 13,
  fullPage = false,
  style,
}: LoadingSpinnerProps) {
  // Unique per-instance keyframe name so multiple spinners on one page never collide.
  const kfName = `ls-spin-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const spinner = (
    <div style={{ textAlign: 'center', ...style }}>
      <style>{`@keyframes ${kfName} { to { transform: rotate(360deg) } }`}</style>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${borderWidth}px solid ${trackColor}`,
          borderTopColor: spinColor,
          margin: '0 auto 14px',
          animation: `${kfName} 0.8s linear infinite`,
        }}
      />
      {showLabel && (
        <p style={{ color: labelColor, fontSize: labelSize, margin: 0 }}>
          {label ?? (isAr ? 'جارٍ التحميل...' : 'Loading...')}
        </p>
      )}
    </div>
  )

  if (!fullPage) return spinner

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8F8F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo','Inter',sans-serif",
      }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {spinner}
    </div>
  )
}
