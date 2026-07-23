'use client'

/**
 * HomepageFeaturedFAQ — today's rotating FAQ card on the homepage.
 *
 * Picks one FAQ entry per day (date-seeded) from SERVICE_FAQ.
 * Shows the question (title), a short summary, authority, and a
 * "Ask AI" button that fires the chatPrompt.
 *
 * Props: { isAr: boolean; onAsk: (q: string) => void }
 */

import React, { useState, useEffect } from 'react'
import { SERVICE_FAQ } from '@/lib/serviceFAQ'

interface Props {
  isAr: boolean
  onAsk: (q: string) => void
}

function todaySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

export default function HomepageFeaturedFAQ({ isAr, onAsk }: Props) {
  const [mounted, setMounted] = useState(false)
  const [faq, setFaq] = useState<(typeof SERVICE_FAQ)[0] | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (SERVICE_FAQ.length > 0) {
      const idx = todaySeed() % SERVICE_FAQ.length
      setFaq(SERVICE_FAQ[idx])
    }
  }, [])

  if (!mounted || !faq) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        borderRadius: 13, overflow: 'hidden',
        background: 'linear-gradient(135deg, #F8F5FF 0%, #F3EEFF 100%)',
        border: '1.5px solid #E9D5FF',
        marginBottom: 10,
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 13px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>{faq.categoryIcon}</span>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#6D28D9', letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {isAr ? '📚 سؤال اليوم' : '📚 FAQ of the day'}
        </span>
      </div>

      {/* Question */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', textAlign: isAr ? 'right' : 'left',
          padding: '8px 13px 10px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1C1917', lineHeight: 1.4, marginBottom: 4 }}>
          {faq.title}
        </div>
        <div style={{ fontSize: 10, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ background: '#EDE9FE', color: '#6D28D9', borderRadius: 8, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>
            {faq.authority}
          </span>
          <span style={{ color: '#9CA3AF' }}>·</span>
          <span style={{ color: '#9CA3AF', fontSize: 9 }}>{faq.duration}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"
            style={{ marginInlineStart: 'auto', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Expanded answer */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E9D5FF', padding: '10px 13px 12px' }}>
          <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, marginBottom: 10 }}>
            {faq.summary}
          </p>

          {faq.fees && (
            <div style={{ fontSize: 10, color: '#065F46', background: '#ECFDF5', borderRadius: 7, padding: '3px 9px', display: 'inline-block', marginBottom: 8 }}>
              💰 {isAr ? 'الرسوم:' : 'Fees:'} {faq.fees}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => onAsk(faq.chatPrompt)}
              style={{
                flex: 1, padding: '7px 12px', borderRadius: 10,
                background: '#7C3AED', color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              <span>✨</span>
              {isAr ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}
            </button>
            <a
              href="/faq"
              style={{
                padding: '7px 12px', borderRadius: 10,
                background: '#F5F3FF', color: '#6D28D9',
                border: '1.5px solid #DDD6FE',
                fontSize: 10, fontWeight: 700,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}
            >
              {isAr ? 'المزيد' : 'More FAQs'}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
