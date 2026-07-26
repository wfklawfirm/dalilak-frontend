'use client'
import React from 'react'
import Image from 'next/image'

interface AppLogoProps {
  isAr: boolean
  /** Badge box size in px. Ignored when `badge` is false. */
  size?: number
  /** Badge border-radius in px. */
  radius?: number
  /** Icon size in px. Defaults to ~76% of `size` (or 18 when `badge` is false). */
  iconSize?: number
  /** 'row' = icon + text side by side (nav/menu/footer). 'stacked' = icon above centered text (auth/splash). */
  layout?: 'row' | 'stacked'
  tagline?: 'none' | 'short' | 'long'
  /** Overrides the tagline text/translation entirely (e.g. splash screen's distinct wording). */
  customTagline?: { ar: string; en: string }
  /** Render a styled circular/rounded badge behind the icon, or just the bare icon (footer). */
  badge?: boolean
  /** Soft drop shadow on the badge (splash screen only). */
  badgeShadow?: boolean
  as?: 'button' | 'div'
  onClick?: () => void
  ariaLabel?: string
  titleTag?: 'h1' | 'div' | 'span'
  titleSize?: number
  titleWeight?: number
  style?: React.CSSProperties
  className?: string
}

export default function AppLogo({
  isAr,
  size = 34,
  radius = 9,
  iconSize,
  layout = 'row',
  tagline = 'none',
  customTagline,
  badge = true,
  badgeShadow = false,
  as = 'div',
  onClick,
  ariaLabel,
  titleTag = 'div',
  titleSize = 16,
  titleWeight = 800,
  style,
  className,
}: AppLogoProps) {
  const icon = iconSize ?? (badge ? Math.round(size * 0.76) : 18)
  const Title = titleTag as any
  const taglineText = customTagline
    ? isAr ? customTagline.ar : customTagline.en
    : tagline === 'long'
    ? isAr ? 'دليل المواطن اللبناني الذكي' : 'The smart Lebanese citizen guide'
    : tagline === 'short'
    ? isAr ? 'دليل المواطن اللبناني' : 'Lebanese Citizens Guide'
    : null
  const stacked = layout === 'stacked'

  const iconEl = (
    <Image
      src="/logo-icon.png"
      alt=""
      aria-hidden="true"
      width={icon}
      height={icon}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )

  const content = (
    <>
      {badge ? (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            background: 'var(--brand-soft)',
            border: '1px solid var(--brand-ring)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            ...(badgeShadow ? { boxShadow: '0 4px 20px var(--brand-ring)' } : {}),
            ...(stacked ? { margin: '0 auto 12px' } : {}),
          }}
        >
          {iconEl}
        </div>
      ) : (
        iconEl
      )}
      <div style={stacked ? { textAlign: 'center' } : undefined}>
        <Title
          style={{
            fontSize: titleSize,
            fontWeight: titleWeight,
            color: 'var(--text-1)',
            lineHeight: 1,
            letterSpacing: '-0.3px',
            margin: 0,
            whiteSpace: stacked ? undefined : 'nowrap',
          }}
        >
          {isAr ? 'دليلك' : 'Dalilak'}
        </Title>
        {taglineText && (
          <div
            style={{
              fontSize: stacked ? 12 : 9.5,
              color: 'var(--text-3)',
              marginTop: stacked ? 3 : 1.5,
              whiteSpace: stacked ? undefined : 'nowrap',
            }}
          >
            {taglineText}
          </div>
        )}
      </div>
    </>
  )

  const wrapStyle: React.CSSProperties = stacked
    ? { textAlign: 'center', ...style }
    : { display: 'flex', alignItems: 'center', gap: 9, ...style }

  if (as === 'button') {
    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
        style={{ ...wrapStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
      >
        {content}
      </button>
    )
  }

  return <div className={className} style={wrapStyle}>{content}</div>
}
