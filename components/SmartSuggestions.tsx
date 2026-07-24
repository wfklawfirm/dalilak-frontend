'use client'

/**
 * SmartSuggestions — context-aware quick-action chips on the homepage.
 * Rotates based on: current month/season, day of week, and Lebanese calendar events.
 * No external data — all computed client-side.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface Suggestion {
  icon: string
  labelAr: string
  labelEn: string
  promptAr: string
  promptEn: string
  color: string
  /** Optional: only show during these months (1-12) */
  months?: number[]
  /** Only show on these days of week (0=Sun..6=Sat) */
  days?: number[]
  /** Always shown regardless of context */
  evergreen?: boolean
  /** Higher = appears first */
  priority?: number
}

const ALL_SUGGESTIONS: Suggestion[] = [
  // ── Evergreen top picks ────────────────────────────────────────────────
  {
    icon: '🛂', color: '#4F46E5', priority: 90, evergreen: true,
    labelAr: 'تجديد جواز السفر', labelEn: 'Renew Passport',
    promptAr: 'ما هي خطوات ومستندات تجديد جواز السفر اللبناني، وكم تستغرق من وقت؟',
    promptEn: 'What are the steps and documents to renew a Lebanese passport, and how long does it take?',
  },
  {
    icon: '🪪', color: '#059669', priority: 88, evergreen: true,
    labelAr: 'بطاقة هوية', labelEn: 'ID Card',
    promptAr: 'كيف أستخرج أو أجدد بطاقة الهوية اللبنانية وما هي الوثائق المطلوبة؟',
    promptEn: 'How do I get or renew a Lebanese ID card and what documents are required?',
  },
  {
    icon: '🚗', color: '#D97706', priority: 85, evergreen: true,
    labelAr: 'تجديد رخصة السير', labelEn: 'Car Registration',
    promptAr: 'ما هي إجراءات تجديد رخصة السير للسيارة وكم تكلف؟',
    promptEn: 'What are the steps to renew a vehicle registration and how much does it cost?',
  },
  {
    icon: '📋', color: '#7C3AED', priority: 80, evergreen: true,
    labelAr: 'قيد النفوس', labelEn: 'Civil Registry',
    promptAr: 'كيف أستخرج قيد النفوس أو وثيقة الهوية من الأحوال المدنية؟',
    promptEn: 'How do I get a civil registry extract or identification document?',
  },

  // ── Seasonal — Summer (Jun-Sep): school enrollment, summer camps, travel ──
  {
    icon: '🏫', color: '#0891B2', priority: 70, months: [6, 7, 8, 9],
    labelAr: 'تسجيل مدرسي', labelEn: 'School Enrollment',
    promptAr: 'ما هي وثائق ومتطلبات تسجيل الأطفال في المدارس الرسمية اللبنانية؟',
    promptEn: 'What documents are required for school enrollment in Lebanese public schools?',
  },
  {
    icon: '✈️', color: '#DC2626', priority: 68, months: [6, 7, 8],
    labelAr: 'تأشيرة سفر', labelEn: 'Travel Visa',
    promptAr: 'كيف أحصل على تأشيرة سفر لمواطن لبناني، وما هي الدول التي تقبل جواز السفر اللبناني بدون فيزا؟',
    promptEn: 'How do I get a travel visa as a Lebanese citizen, and which countries accept Lebanese passports visa-free?',
  },

  // ── Autumn (Sep-Nov): business registration, employment permits ──
  {
    icon: '🏢', color: '#065F46', priority: 72, months: [9, 10, 11],
    labelAr: 'تسجيل شركة', labelEn: 'Register a Company',
    promptAr: 'ما هي خطوات ومتطلبات تأسيس وتسجيل شركة في لبنان؟',
    promptEn: 'What are the steps and requirements to register and incorporate a company in Lebanon?',
  },
  {
    icon: '💼', color: '#7C3AED', priority: 70, months: [9, 10, 11],
    labelAr: 'إذن العمل', labelEn: 'Work Permit',
    promptAr: 'كيف أحصل على إذن عمل في لبنان للعمالة الأجنبية؟',
    promptEn: 'How do I get a work permit in Lebanon for foreign workers?',
  },

  // ── Winter (Dec-Feb): tax deadlines, end-of-year filings ──
  {
    icon: '💰', color: '#0891B2', priority: 75, months: [12, 1, 2],
    labelAr: 'التصريح الضريبي', labelEn: 'Tax Declaration',
    promptAr: 'ما هي مواعيد التصريح الضريبي في لبنان وكيف أقدمه؟',
    promptEn: 'What are tax declaration deadlines in Lebanon and how do I file?',
  },
  {
    icon: '🏦', color: '#92400E', priority: 73, months: [12, 1, 2],
    labelAr: 'براءة ذمة مالية', labelEn: 'Tax Clearance',
    promptAr: 'كيف أحصل على شهادة براءة ذمة مالية من وزارة المالية اللبنانية؟',
    promptEn: 'How do I get a tax clearance certificate from the Lebanese Ministry of Finance?',
  },

  // ── Spring (Mar-May): property, inheritance, notary ──
  {
    icon: '🏠', color: '#059669', priority: 70, months: [3, 4, 5],
    labelAr: 'نقل ملكية عقار', labelEn: 'Property Transfer',
    promptAr: 'ما هي إجراءات وتكاليف نقل ملكية العقار في لبنان؟',
    promptEn: 'What are the steps and costs to transfer real estate ownership in Lebanon?',
  },

  // ── Weekday morning (Mon-Thu): office visits ──
  {
    icon: '📅', color: '#4F46E5', priority: 60, days: [1, 2, 3, 4],
    labelAr: 'احجز موعداً', labelEn: 'Book Appointment',
    promptAr: 'كيف أحجز موعداً في الجهات الحكومية اللبنانية ومتى تفتح مكاتبها؟',
    promptEn: 'How do I book an appointment at Lebanese government offices and when are they open?',
  },

  // ── Always useful ──
  {
    icon: '🏥', color: '#DC2626', priority: 65, evergreen: true,
    labelAr: 'الضمان الاجتماعي', labelEn: 'Social Security',
    promptAr: 'كيف أسجّل في الضمان الاجتماعي وما هي المزايا والخدمات المتاحة؟',
    promptEn: 'How do I register with the NSSF and what benefits and services are available?',
  },
  {
    icon: '📜', color: '#7C3AED', priority: 62, evergreen: true,
    labelAr: 'توثيق الوثائق', labelEn: 'Document Attestation',
    promptAr: 'كيف أصادق أو أوثق وثيقة رسمية للاستخدام خارج لبنان؟',
    promptEn: 'How do I attest or authenticate a document for use outside Lebanon?',
  },
  {
    icon: '🛡️', color: '#0891B2', priority: 60, evergreen: true,
    labelAr: 'الإقامة في لبنان', labelEn: 'Residency Permit',
    promptAr: 'ما هي إجراءات الحصول على إقامة قانونية في لبنان للأجانب؟',
    promptEn: 'What are the steps to get a legal residency permit in Lebanon for foreigners?',
  },
]

interface Props {
  onAsk?: (q: string) => void
}

export default function SmartSuggestions({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [chips, setChips] = useState<Suggestion[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    const month = now.getMonth() + 1   // 1-12
    const day = now.getDay()            // 0-6

    const filtered = ALL_SUGGESTIONS.filter(s => {
      if (s.months && !s.months.includes(month)) return false
      if (s.days && !s.days.includes(day)) return false
      return true
    })

    // Sort by priority desc, then shuffle lower-priority items
    filtered.sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50))

    // Always show top 3 evergreen + up to 4 seasonal = max 7 total
    const evergreen = filtered.filter(s => s.evergreen).slice(0, 3)
    const seasonal  = filtered.filter(s => !s.evergreen).slice(0, 4)
    setChips([...seasonal, ...evergreen])
  }, [])

  if (!mounted || chips.length === 0 || !onAsk) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 16px',
        maxWidth: 'var(--container-md)',
        animation: 'fadeUp 0.2s ease',
      }}
    >
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-4)',
        marginBottom: 7, paddingInline: 2,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        {isAr ? 'اقتراحات ذكية' : 'Smart Suggestions'}
      </div>
      <div style={{
        display: 'flex', gap: 7, flexWrap: 'wrap',
      }}>
        {chips.map(c => (
          <button
            key={c.labelEn}
            type="button"
            onClick={() => onAsk(isAr ? c.promptAr : c.promptEn)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 20,
              border: `1.5px solid ${c.color}28`,
              background: `${c.color}0E`,
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 600, color: c.color,
              transition: 'border-color 0.15s, background 0.15s, transform 0.12s',
              lineHeight: 1.3,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = c.color + '60'
              e.currentTarget.style.background = c.color + '1A'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = c.color + '28'
              e.currentTarget.style.background = c.color + '0E'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span style={{ fontSize: 14 }}>{c.icon}</span>
            {isAr ? c.labelAr : c.labelEn}
          </button>
        ))}
      </div>
    </div>
  )
}
