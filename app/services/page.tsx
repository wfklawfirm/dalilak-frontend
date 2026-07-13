'use client'

// ── /services — All Service Groups ──────────────────────────────────────────
// Phase 4: Browse all 6 service groups and their services.

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICE_GROUPS, type ServiceGroup, type ServiceItem, getVerificationLabel } from '@/lib/serviceGroups'

export default function ServicesPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [expandedGroup, setExpandedGroup] = useState<string | null>('expat')
  const isAr = lang === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  const handleService = (item: ServiceItem) => {
    if (item.defaultAction === 'upload_document') {
      router.push(`/?action=upload&service=${item.slug}`)
    } else if (item.defaultAction === 'generate_checklist') {
      const q = isAr ? `أعطني checklist لـ: ${item.titleAr}` : `Give me a checklist for: ${item.titleEn}`
      router.push(`/?q=${encodeURIComponent(q)}`)
    } else if (item.defaultAction === 'start_flow') {
      router.push(`/?action=flow&procedure=${item.procedureSlug ?? ''}`)
    } else {
      const q = isAr ? (item.chatPromptAr ?? item.titleAr) : (item.chatPromptEn ?? item.titleEn)
      router.push(`/?q=${encodeURIComponent(q)}`)
    }
  }

  const verBadge = (status: ServiceItem['verificationStatus']) => {
    const map: Record<string, [string, string]> = {
      verified: ['#DCFCE7', '#16A34A'],
      partially_verified: ['#FEF3C7', '#B45309'],
      needs_review: ['#FEE2E2', '#DC2626'],
      draft: ['#F3F4F6', '#6B7280'],
    }
    const [bg, fg] = map[status] ?? ['#F3F4F6', '#6B7280']
    return (
      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: bg, color: fg }}>
        {getVerificationLabel(status, isAr)}
      </span>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={dir}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        .sg-btn:hover { background: #FAFAFA !important; }
        .svc-row:hover { border-color: #8B1A1A !important; background: #FEFEFE !important; }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #6b2737 0%, #8B1A1A 100%)',
        padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
              {isAr ? 'الخدمات' : 'Services'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
              {isAr ? '6 مجموعات · 30+ خدمة' : '6 groups · 30+ services'}
            </div>
          </div>
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >{isAr ? 'EN' : 'AR'}</button>
        </div>
      </header>

      {/* Expat+Property Pack CTA */}
      <div style={{ maxWidth: 720, margin: '12px auto 0', padding: '0 14px' }}>
        <button
          onClick={() => router.push('/services/expat-property')}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
            background: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 100%)',
            border: 'none', color: '#fff', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10, boxShadow: '0 4px 16px rgba(30,64,175,0.2)',
          }}
        >
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              ✈️🏛️ {isAr ? 'حزمة المغتربين والعقارات والعقود' : 'Expat, Property & Contracts Pack'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              {isAr ? 'مسار موثّق · وكالات · بيع عقار · تحليل عقود · كشف ثغرات'
                     : 'Verified path · POA · Property sale · Contract review · Gap detection'}
            </div>
          </div>
          <span style={{ fontSize: 20 }}>{isAr ? '←' : '→'}</span>
        </button>
      </div>

      {/* Service Groups */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 14px 100px' }}>
        {SERVICE_GROUPS.map(group => {
          const isExpanded = expandedGroup === group.slug
          return (
            <div key={group.slug} style={{ marginBottom: 10, borderRadius: 16, overflow: 'hidden', border: '1.5px solid #F0F0F0', background: '#fff' }}>
              {/* Group header */}
              <button
                className="sg-btn"
                onClick={() => setExpandedGroup(isExpanded ? null : group.slug)}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: `${group.color}14`, border: `1.5px solid ${group.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {group.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
                    {isAr ? group.titleAr : group.titleEn}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 2 }}>
                    {isAr ? group.descriptionAr : group.descriptionEn}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: group.color, background: `${group.color}14`, borderRadius: 20, padding: '2px 8px' }}>
                    {group.services.length} {isAr ? 'خدمة' : 'services'}
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: 18, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                </div>
              </button>

              {/* Services list */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #F3F4F6' }}>
                  {group.services.map((item, i) => (
                    <button
                      key={item.id}
                      className="svc-row"
                      onClick={() => handleService(item)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        background: '#fff', border: 'none',
                        borderBottom: i < group.services.length - 1 ? '1px solid #F9FAFB' : 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 12,
                        textAlign: isAr ? 'right' : 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>
                        {item.icon ?? group.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>
                            {isAr ? item.titleAr : item.titleEn}
                          </span>
                          {verBadge(item.verificationStatus)}
                        </div>
                        {(isAr ? item.descriptionAr : item.descriptionEn) && (
                          <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 2, lineHeight: 1.4 }}>
                            {isAr ? item.descriptionAr : item.descriptionEn}
                          </div>
                        )}
                      </div>
                      <span style={{ color: '#9CA3AF', fontSize: 14, flexShrink: 0 }}>
                        {isAr ? '←' : '→'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
