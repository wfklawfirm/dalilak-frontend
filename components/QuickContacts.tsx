'use client'

/**
 * QuickContacts — quick-access cards for main Lebanese government offices.
 * Horizontally scrollable chip strip on the homepage.
 * Click to call (mobile) or ask Dalilak about the office.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

/** Returns Lebanon local Date object */
function getLebTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
}

/**
 * Returns true if the given contact is currently open.
 * Each contact has its own open/close times (Mon–Fri only).
 */
function isContactOpen(c: Contact): boolean {
  const lb = getLebTime()
  const day = lb.getDay() // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false // weekend
  const mins = lb.getHours() * 60 + lb.getMinutes()
  return mins >= c.openH * 60 + c.openM && mins < c.closeH * 60 + c.closeM
}

interface Contact {
  icon: string
  nameAr: string
  nameEn: string
  phone?: string
  address?: string
  hoursAr?: string
  hoursEn?: string
  openH: number    // open hour (24h)
  openM: number    // open minute
  closeH: number   // close hour
  closeM: number   // close minute
  promptAr: string
  promptEn: string
  color: string  // accent colour for icon bg
}

const CONTACTS: Contact[] = [
  {
    icon: '🛂',
    nameAr: 'الأمن العام',
    nameEn: 'General Security',
    phone: '01-425610',
    hoursAr: 'الإثنين–الجمعة 8:00–14:00',
    hoursEn: 'Mon–Fri 8:00–14:00',
    openH: 8, openM: 0, closeH: 14, closeM: 0,
    promptAr: 'ما هي خدمات الأمن العام وكيف أتواصل معهم للحصول على تأشيرة أو إقامة؟',
    promptEn: 'What services does General Security provide and how do I contact them for visa or residency?',
    color: '#4F46E5',
  },
  {
    icon: '📋',
    nameAr: 'الأحوال المدنية',
    nameEn: 'Civil Registry',
    phone: '01-981140',
    hoursAr: 'الإثنين–الجمعة 8:00–14:00',
    hoursEn: 'Mon–Fri 8:00–14:00',
    openH: 8, openM: 0, closeH: 14, closeM: 0,
    promptAr: 'كيف أستخرج قيد النفوس أو وثائق الأحوال المدنية؟',
    promptEn: 'How do I get civil registry documents (birth, marriage, nationality records)?',
    color: '#059669',
  },
  {
    icon: '🚗',
    nameAr: 'مديرية السير',
    nameEn: 'Traffic Directorate',
    phone: '01-448888',
    hoursAr: 'الإثنين–الجمعة 7:30–14:00',
    hoursEn: 'Mon–Fri 7:30–14:00',
    openH: 7, openM: 30, closeH: 14, closeM: 0,
    promptAr: 'كيف أجدد رخصة السير أو رخصة القيادة في مديرية السير؟',
    promptEn: 'How do I renew my car registration or driver\'s license at the Traffic Directorate?',
    color: '#D97706',
  },
  {
    icon: '💼',
    nameAr: 'وزارة العمل',
    nameEn: 'Ministry of Labor',
    phone: '01-752400',
    address: 'شارع بدارو، بيروت',
    hoursAr: 'الإثنين–الجمعة 8:00–14:00',
    hoursEn: 'Mon–Fri 8:00–14:00',
    openH: 8, openM: 0, closeH: 14, closeM: 0,
    promptAr: 'ما هي إجراءات وزارة العمل للحصول على إذن عمل أو تسجيل عقد عمل؟',
    promptEn: 'How do I get a work permit or register an employment contract at the Ministry of Labor?',
    color: '#7C3AED',
  },
  {
    icon: '💰',
    nameAr: 'وزارة المالية',
    nameEn: 'Ministry of Finance',
    phone: '01-981001',
    hoursAr: 'الإثنين–الجمعة 8:00–14:00',
    hoursEn: 'Mon–Fri 8:00–14:00',
    openH: 8, openM: 0, closeH: 14, closeM: 0,
    promptAr: 'كيف أدفع ضريبة أو أحصل على شهادة براءة ذمة من وزارة المالية؟',
    promptEn: 'How do I pay taxes or get a tax clearance certificate from the Ministry of Finance?',
    color: '#0891B2',
  },
  {
    icon: '🏥',
    nameAr: 'الضمان الاجتماعي',
    nameEn: 'NSSF',
    phone: '01-200150',
    hoursAr: 'الإثنين–الجمعة 8:00–14:30',
    hoursEn: 'Mon–Fri 8:00–14:30',
    openH: 8, openM: 0, closeH: 14, closeM: 30,
    promptAr: 'كيف أسجّل في الضمان الاجتماعي أو أطالب بتعويض أو استرداد رسوم طبية؟',
    promptEn: 'How do I register with NSSF or claim medical reimbursement?',
    color: '#DC2626',
  },
  {
    icon: '🏛️',
    nameAr: 'سجل التجارة',
    nameEn: 'Commercial Registry',
    phone: '01-983300',
    hoursAr: 'الإثنين–الجمعة 8:00–14:00',
    hoursEn: 'Mon–Fri 8:00–14:00',
    openH: 8, openM: 0, closeH: 14, closeM: 0,
    promptAr: 'كيف أسجّل شركة أو أحصل على مستخرج سجل تجاري في لبنان؟',
    promptEn: 'How do I register a company or get a commercial registry extract in Lebanon?',
    color: '#065F46',
  },
  {
    icon: '⚖️',
    nameAr: 'نقابة المحامين',
    nameEn: 'Bar Association',
    phone: '01-982061',
    hoursAr: 'الإثنين–الجمعة 8:30–14:00',
    hoursEn: 'Mon–Fri 8:30–14:00',
    openH: 8, openM: 30, closeH: 14, closeM: 0,
    promptAr: 'كيف أتواصل مع نقابة المحامين في بيروت وما هي خدماتهم؟',
    promptEn: 'How do I contact the Beirut Bar Association and what services do they provide?',
    color: '#92400E',
  },
]

interface Props {
  onAsk?: (q: string) => void
}

export default function QuickContacts({ onAsk }: Props) {
  const { isAr } = useLanguage()
  const [expanded, setExpanded] = useState<string | null>(null)
  // Map of nameEn → open/closed per contact, updated every minute
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const refresh = () => {
      const map: Record<string, boolean> = {}
      CONTACTS.forEach(c => { map[c.nameEn] = isContactOpen(c) })
      setOpenMap(map)
    }
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [])

  const openCount = CONTACTS.filter(c => openMap[c.nameEn]).length

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        margin: '0 auto 16px',
        maxWidth: 'var(--container-md)',
        animation: 'fadeUp 0.18s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 8, paddingInline: 4,
      }}>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.14 19.79 19.79 0 01.22 6.51 2 2 0 012.2 4.34l3-.48A2 2 0 017 5.44l.8 2.66a2 2 0 01-.46 2L6 11.47A16 16 0 0012.53 18l1.37-1.34a2 2 0 012-.46l2.66.8a2 2 0 011.58 1.76z"/>
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)' }}>
          {isAr ? 'أرقام الجهات الحكومية' : 'Government Contacts'}
        </span>
        {openCount > 0 ? (
          <span style={{
            fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
            background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0',
          }}>
            ● {isAr ? `${openCount} جهات مفتوحة` : `${openCount} open`}
          </span>
        ) : (
          <span style={{
            fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
            background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
          }}>
            {isAr ? '● مغلق الآن' : '● All Closed'}
          </span>
        )}
      </div>

      {/* Horizontal scroll strip */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {CONTACTS.map(c => {
          const isExp = expanded === c.nameEn
          return (
            <div
              key={c.nameEn}
              style={{
                flexShrink: 0,
                borderRadius: 12,
                border: `1px solid ${isExp ? c.color + '44' : 'var(--border)'}`,
                background: isExp ? `${c.color}08` : 'var(--surface)',
                overflow: 'hidden',
                transition: 'border-color 0.15s, background 0.15s',
                width: isExp ? 200 : 'auto',
              }}
            >
              {/* Collapsed chip */}
              {!isExp && (
                <button
                  type="button"
                  onClick={() => setExpanded(c.nameEn)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 12px', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: `${c.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, position: 'relative',
                  }}>
                    {c.icon}
                    {/* Per-contact open/closed dot */}
                    <span style={{
                      position: 'absolute', bottom: -1, right: -1,
                      width: 8, height: 8, borderRadius: '50%',
                      background: openMap[c.nameEn] ? '#10b981' : '#ef4444',
                      border: '1.5px solid var(--bg)',
                    }} />
                  </span>
                  <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                      {isAr ? c.nameAr : c.nameEn}
                    </div>
                    {c.phone && (
                      <div style={{ fontSize: 10.5, color: 'var(--text-3)', direction: 'ltr' }}>
                        {c.phone}
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* Expanded card */}
              {isExp && (
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: `${c.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>
                        {c.icon}
                      </span>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-1)' }}>
                          {isAr ? c.nameAr : c.nameEn}
                        </div>
                        <div style={{
                          fontSize: 9.5, fontWeight: 700, marginTop: 1,
                          color: openMap[c.nameEn] ? '#059669' : '#dc2626',
                        }}>
                          {openMap[c.nameEn]
                            ? (isAr ? '● مفتوح الآن' : '● Open Now')
                            : (isAr ? '● مغلق الآن' : '● Closed Now')}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpanded(null)}
                      aria-label="Close"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-3)', padding: 2, fontSize: 13, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12.5, fontWeight: 700, color: c.color,
                        textDecoration: 'none', marginBottom: 4,
                        direction: 'ltr',
                      }}
                    >
                      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.14 19.79 19.79 0 01.22 6.51 2 2 0 012.2 4.34l3-.48A2 2 0 017 5.44l.8 2.66a2 2 0 01-.46 2L6 11.47A16 16 0 0012.53 18l1.37-1.34a2 2 0 012-.46l2.66.8a2 2 0 011.58 1.76z"/>
                      </svg>
                      {c.phone}
                    </a>
                  )}

                  {(c.hoursAr || c.hoursEn) && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {isAr ? c.hoursAr : c.hoursEn}
                    </div>
                  )}

                  {onAsk && (
                    <button
                      type="button"
                      onClick={() => {
                        onAsk(isAr ? c.promptAr : c.promptEn)
                        setExpanded(null)
                      }}
                      style={{
                        width: '100%', marginTop: 6, padding: '6px 0',
                        borderRadius: 7, fontSize: 11.5, fontWeight: 700,
                        background: c.color, color: '#fff', border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
