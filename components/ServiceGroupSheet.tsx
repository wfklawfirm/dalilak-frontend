'use client'

import React, { useEffect } from 'react'
import type { ServiceGroup, ServiceItem } from '@/lib/serviceGroups'
import { getVerificationLabel } from '@/lib/serviceGroups'

interface ServiceGroupSheetProps {
  group: ServiceGroup | null
  isAr: boolean
  onClose: () => void
  onServiceSelect: (item: ServiceItem) => void
}

export default function ServiceGroupSheet({
  group, isAr, onClose, onServiceSelect,
}: ServiceGroupSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (!group) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [group])

  if (!group) return null

  const T = isAr
    ? { close: 'إغلاق', action_start: 'ابدأ', action_upload: 'ارفع مستنداً', action_ask: 'اسأل AI', action_checklist: 'Checklist' }
    : { close: 'Close', action_start: 'Start', action_upload: 'Upload Doc', action_ask: 'Ask AI', action_checklist: 'Checklist' }

  const actionLabel = (item: ServiceItem): string => {
    if (item.defaultAction === 'upload_document') return isAr ? '📎 ارفع مستنداً' : '📎 Upload Document'
    if (item.defaultAction === 'generate_checklist') return isAr ? '✅ Checklist' : '✅ Checklist'
    if (item.defaultAction === 'ask_ai') return isAr ? '💬 اسأل AI' : '💬 Ask AI'
    return isAr ? '▶ ابدأ' : '▶ Start'
  }

  const verBadge = (status: ServiceItem['verificationStatus']) => {
    const colors: Record<string, [string, string]> = {
      verified: ['#DCFCE7', '#16A34A'],
      partially_verified: ['#FEF3C7', '#B45309'],
      needs_review: ['#FEE2E2', '#DC2626'],
      draft: ['#F3F4F6', '#6B7280'],
    }
    const [bg, fg] = colors[status] ?? ['#F3F4F6', '#6B7280']
    return (
      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, color: fg, flexShrink: 0 }}>
        {getVerificationLabel(status, isAr)}
      </span>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 200, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 201,
        background: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Cairo','Inter',sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {/* Group header */}
        <div style={{
          padding: '8px 20px 14px',
          borderBottom: '1px solid #F3F4F6',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `${group.color}14`,
              border: `1.5px solid ${group.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {group.icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {isAr ? group.titleAr : group.titleEn}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1 }}>
                {isAr ? group.descriptionAr : group.descriptionEn}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#F3F4F6', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280', fontSize: 16, flexShrink: 0,
            }}
            aria-label={T.close}
          >✕</button>
        </div>

        {/* Services list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 16px 24px' }}>
          {group.services.map((item, i) => (
            <button
              key={item.id}
              onClick={() => onServiceSelect(item)}
              style={{
                width: '100%', padding: '13px 14px',
                marginBottom: 8,
                background: '#fff', borderRadius: 14,
                border: '1.5px solid #F0F0F0',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 12,
                textAlign: isAr ? 'right' : 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.background = '#FAFAFA' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F0'; e.currentTarget.style.background = '#fff' }}
              onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#FEF2F2', border: '1px solid rgba(139,26,26,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {item.icon ?? group.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
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

              {/* CTA */}
              <div style={{
                padding: '5px 10px', borderRadius: 8,
                background: '#8B1A1A', color: '#fff',
                fontSize: 10.5, fontWeight: 700,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {actionLabel(item)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
