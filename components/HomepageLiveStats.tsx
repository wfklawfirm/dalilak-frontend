'use client'

/**
 * HomepageLiveStats — compact animated counter strip.
 *
 * Shows live counts derived from real app data:
 * • Total procedures (enriched + guided)
 * • Ministries covered
 * • Forms available
 *
 * Numbers animate from 0 to their real values on mount (count-up effect).
 * Hidden until mounted (SSR-safe).
 *
 * Props: { totalProcedures: number; ministriesCount: number; formsCount: number; isAr: boolean }
 */

import React, { useState, useEffect, useRef } from 'react'

interface StatItem {
  value: number
  icon: string
  labelAr: string
  labelEn: string
  color: string
  bg: string
}

interface Props {
  totalProcedures: number
  ministriesCount: number
  formsCount: number
  isAr: boolean
}

function useCountUp(target: number, duration = 900): number {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        raf.current = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

function StatCell({ item, animate }: { item: StatItem; animate: boolean }) {
  const displayed = useCountUp(animate ? item.value : 0)

  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '9px 6px',
      background: item.bg,
      borderRadius: 10,
      gap: 3,
    }}>
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <span style={{
        fontSize: 17, fontWeight: 900, color: item.color, lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {animate ? displayed.toLocaleString() : item.value.toLocaleString()}
        <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>+</span>
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, color: item.color, opacity: 0.75, textAlign: 'center', lineHeight: 1.3 }}>
        {item.labelAr /* we pass AR/EN via item */}
      </span>
    </div>
  )
}

export default function HomepageLiveStats({ totalProcedures, ministriesCount, formsCount, isAr }: Props) {
  const [mounted, setMounted] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Slight delay so animation plays after paint
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) return null

  const stats: StatItem[] = [
    {
      value: totalProcedures,
      icon: '📋',
      labelAr: isAr ? 'معاملة متاحة' : 'Procedures',
      labelEn: 'Procedures',
      color: '#8F1D2C',
      bg: 'rgba(143,29,44,0.06)',
    },
    {
      value: ministriesCount,
      icon: '🏛️',
      labelAr: isAr ? 'وزارة وجهة' : 'Ministries',
      labelEn: 'Ministries',
      color: '#1D4ED8',
      bg: 'rgba(29,78,216,0.06)',
    },
    {
      value: formsCount,
      icon: '📝',
      labelAr: isAr ? 'نموذج رسمي' : 'Forms',
      labelEn: 'Forms',
      color: '#059669',
      bg: 'rgba(5,150,105,0.06)',
    },
  ]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ marginBottom: 10 }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 800, color: '#918B82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {isAr ? '📊 دليلك بالأرقام' : '📊 By the numbers'}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {stats.map((s, i) => (
          <StatCell key={i} item={s} animate={animate} />
        ))}
      </div>
    </div>
  )
}
