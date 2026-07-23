'use client'

/**
 * HomepageMinistrySpotlight — rotating ministry highlight card.
 *
 * Cycles through key ministries (one per hour, seeded by day+hour).
 * Shows icon, Arabic/English name, count of transactions, and a
 * "Browse procedures" link to /procedures?ministry={slug}.
 *
 * Auto-advances every 8 seconds with a slide animation.
 * Manual prev/next arrows.
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect, useRef } from 'react'

interface MinistrySpot {
  slug: string
  ar: string
  en: string
  icon: string
  count: number
  tip: string
  tipEn: string
}

const SPOTS: MinistrySpot[] = [
  { slug: 'interior',   ar: 'وزارة الداخلية والبلديات', en: 'Ministry of Interior',        icon: '🏛️', count: 169, tip: 'إخراج القيد، جوازات السفر، إقامة الأجانب', tipEn: 'Civil records, passports, residency permits' },
  { slug: 'finance',    ar: 'وزارة المالية',             en: 'Ministry of Finance',          icon: '💰', count: 114, tip: 'الضرائب، الرسوم، قيود السجل التجاري',       tipEn: 'Taxes, fees, commercial registry records' },
  { slug: 'labor',      ar: 'وزارة العمل',               en: 'Ministry of Labor',            icon: '👷', count: 297, tip: 'تصاريح العمل، السجل التجاري، حقوق العمال',   tipEn: 'Work permits, labor rights, NSSF' },
  { slug: 'health',     ar: 'وزارة الصحة العامة',        en: 'Ministry of Public Health',    icon: '🏥', count: 70,  tip: 'تراخيص الصيدليات، المستشفيات، شهادات الصحة', tipEn: 'Pharmacy licenses, hospital permits, health certs' },
  { slug: 'economy',    ar: 'وزارة الاقتصاد والتجارة',   en: 'Ministry of Economy & Trade',  icon: '🏭', count: 573, tip: 'تسجيل الشركات، حماية المستهلك، الاستيراد',   tipEn: 'Company registration, consumer protection, imports' },
  { slug: 'social',     ar: 'وزارة الشؤون الاجتماعية',   en: 'Ministry of Social Affairs',   icon: '🤝', count: 295, tip: 'دعم الأسرة، الجمعيات، المساعدات الاجتماعية', tipEn: 'Family support, NGOs, social assistance' },
  { slug: 'justice',    ar: 'وزارة العدل',               en: 'Ministry of Justice',          icon: '⚖️', count: 20,  tip: 'توثيق العقود، كتّاب العدل، السجل الجنائي',   tipEn: 'Notary, contracts, criminal records' },
  { slug: 'foreign',    ar: 'وزارة الخارجية',            en: 'Ministry of Foreign Affairs',  icon: '✈️', count: 18,  tip: 'التوثيق، الأبوستيل، الوثائق الخارجية',       tipEn: 'Apostille, document authentication, emigrant affairs' },
  { slug: 'education',  ar: 'وزارة التربية',             en: 'Ministry of Education',        icon: '📚', count: 74,  tip: 'اعتماد الشهادات، تسجيل المدارس، الجامعات',   tipEn: 'Degree recognition, school registration, universities' },
  { slug: 'nssf',       ar: 'الضمان الاجتماعي (NSSF)',   en: 'National Social Security',     icon: '🛡️', count: 35,  tip: 'التسجيل في NSSF، التعويضات، التقاعد',         tipEn: 'NSSF registration, benefits, retirement' },
]

export default function HomepageMinistrySpotlight({ isAr }: { isAr: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [idx, setIdx]         = useState(0)
  const [fade, setFade]       = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setMounted(true)
    // Seed with current hour so it's consistent per hour
    const seed = new Date().getHours() % SPOTS.length
    setIdx(seed)
  }, [])

  function advance(dir: 1 | -1) {
    setFade(false)
    setTimeout(() => {
      setIdx(i => (i + dir + SPOTS.length) % SPOTS.length)
      setFade(true)
    }, 150)
  }

  // Auto-advance every 8s
  useEffect(() => {
    if (!mounted) return
    timerRef.current = setInterval(() => advance(1), 8000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [mounted])

  if (!mounted) return null

  const m = SPOTS[idx]

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        borderRadius: 14, overflow: 'hidden',
        background: 'linear-gradient(135deg, #FFF9F5 0%, #FEF3EE 100%)',
        border: '1.5px solid #F0E8E0',
        padding: '14px 16px', marginBottom: 10,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#A8A29E', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {isAr ? '🏛 وزارة الأسبوع' : '🏛 Ministry spotlight'}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {SPOTS.map((_, i) => (
            <button key={i} type="button"
              onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true) }, 150) }}
              style={{
                width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
                background: i === idx ? '#8F1D2C' : '#E5E0D8',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        opacity: fade ? 1 : 0, transition: 'opacity 0.15s',
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 13, flexShrink: 0,
          background: '#FFF', border: '1.5px solid #F0E8E0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, boxShadow: '0 2px 8px rgba(143,29,44,0.08)',
        }}>
          {m.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1917', lineHeight: 1.3, marginBottom: 3 }}>
            {isAr ? m.ar : m.en}
          </div>
          <div style={{ fontSize: 10, color: '#78716C', marginBottom: 8, lineHeight: 1.5 }}>
            {isAr ? m.tip : m.tipEn}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, color: '#78716C',
              background: '#F5F3EE', borderRadius: 10, padding: '2px 8px',
            }}>
              {m.count} {isAr ? 'معاملة' : 'procedures'}
            </span>
            <a
              href={`/procedures?ministry=${m.slug}`}
              style={{
                fontSize: 10, fontWeight: 800, color: '#8F1D2C',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            >
              {isAr ? 'استعرض المعاملات' : 'Browse procedures'}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
              </svg>
            </a>
          </div>
        </div>

        {/* Prev/Next */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button type="button" onClick={() => advance(-1)}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#F5F3EE', border: '1.5px solid #E5E0D8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5C534A" strokeWidth="2.5">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <button type="button" onClick={() => advance(1)}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#F5F3EE', border: '1.5px solid #E5E0D8',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5C534A" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
