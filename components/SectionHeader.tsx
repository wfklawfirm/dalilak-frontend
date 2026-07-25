'use client'
import React from 'react'

interface SectionHeaderProps {
  title: string
  /** Icon rendered inline before the title text (admin tab headers only). */
  titleIcon?: React.ReactNode
  titleTag?: 'h2' | 'h3'
  titleSize?: number
  titleWeight?: number
  titleColor?: string
  align?: 'baseline' | 'center'
  marginBottom?: number
  trailingLabel?: string
  onTrailingClick?: () => void
  trailingColor?: string
  trailingSize?: number
  trailingIcon?: React.ReactNode
  trailingIconPosition?: 'before' | 'after'
  trailingGap?: number
  style?: React.CSSProperties
}

export default function SectionHeader({
  title,
  titleIcon,
  titleTag = 'h2',
  titleSize = 20,
  titleWeight = 700,
  titleColor = 'var(--text-1)',
  align = 'center',
  marginBottom = 12,
  trailingLabel,
  onTrailingClick,
  trailingColor = 'var(--brand)',
  trailingSize = 13,
  trailingIcon,
  trailingIconPosition = 'after',
  trailingGap = 4,
  style,
}: SectionHeaderProps) {
  const Title = titleTag as any

  return (
    <div
      style={{
        display: 'flex',
        alignItems: align,
        justifyContent: 'space-between',
        marginBottom,
        gap: 16,
        ...style,
      }}
    >
      <Title
        style={{
          fontSize: titleSize,
          fontWeight: titleWeight,
          color: titleColor,
          margin: 0,
          ...(titleIcon ? { display: 'flex', alignItems: 'center', gap: 6 } : {}),
        }}
      >
        {titleIcon}
        {title}
      </Title>
      {trailingLabel && (
        <button
          type="button"
          onClick={onTrailingClick}
          style={{
            fontSize: trailingSize,
            fontWeight: 600,
            color: trailingColor,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: trailingIcon ? trailingGap : 0,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {trailingIconPosition === 'before' && trailingIcon}
          {trailingLabel}
          {trailingIconPosition === 'after' && trailingIcon}
        </button>
      )}
    </div>
  )
}
