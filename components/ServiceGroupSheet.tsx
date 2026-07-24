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

  // Escape closes the sheet — document-level listener so it works regardless
  // of which element (if any) currently has focus, not just when focus is
  // inside the dialog (the tabIndex={-1}/onKeyDown on the dialog div below
  // only fires after the user has already tabbed into it once).
  useEffect(() => {
    if (!group) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [group, onClose])

  if (!group) return null

  const T = isAr
    ? { close: 'إغلاق', action_start: 'ابدأ', action_upload: 'ارفع مستنداً', action_ask: 'اسأل دليلك', action_checklist: 'Checklist' }
    : { close: 'Close', action_start: 'Start', action_upload: 'Upload Doc', action_ask: 'Ask Dalilak', action_checklist: 'Checklist' }

  const actionLabel = (item: ServiceItem): React.ReactNode => {
    if (item.defaultAction === 'upload_document') return <><svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>{isAr ? 'ارفع مستنداً' : 'Upload Document'}</>
    if (item.defaultAction === 'generate_checklist') return <><svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Checklist</>
    if (item.defaultAction === 'ask_ai') return <><svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>{isAr ? 'اسأل دليلك' : 'Ask Dalilak'}</>
    return <><svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 3 }}><polygon points="6,3 20,12 6,21"/></svg>{isAr ? 'ابدأ' : 'Start'}</>
  }

  const verBadge = (status: ServiceItem['verificationStatus']) => {
    const colors: Record<string, [string, string]> = {
      verified: ['#FFFBEB', '#78350F'],
      partially_verified: ['#FFFBEB', '#B45309'],
      needs_review: ['#F8EDEF', '#8F1D2C'],
      draft: ['#E6E2DC', '#69645C'],
    }
    const [bg, fg] = colors[status] ?? ['#E6E2DC', '#69645C']
    return (
      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, color: fg, flexShrink: 0 }}>
        {getVerificationLabel(status, isAr)}
      </span>
    )
  }

  return (
    <>
      <style>{`
        @keyframes sgFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes sgSlideUp { from { transform:translateY(100%); opacity:0.6; } to { transform:translateY(0); opacity:1; } }
        @keyframes sgItem { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 200, backdropFilter: 'blur(2px)',
          animation: 'sgFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
      />

      {/* Sheet */}
      <div role="dialog" aria-modal="true" aria-label={isAr ? group.titleAr : group.titleEn}
        tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        zIndex: 201,
        background: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Cairo','Inter',sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        animation: 'sgSlideUp 0.32s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>

        {/* Group header */}
        <div style={{
          padding: '8px 20px 14px',
          borderBottom: '1px solid #E6E2DC',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `${group.color}14`,
              border: `1.5px solid ${group.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{group.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#191713' }}>
                {isAr ? group.titleAr : group.titleEn}
              </div>
              <div style={{ fontSize: 10.5, color: '#69645C', marginTop: 1 }}>
                {isAr ? group.descriptionAr : group.descriptionEn}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={T.close}
            onTouchStart={e => { e.currentTarget.style.background = '#D5CEC4' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#E6E2DC' }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#E6E2DC', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#69645C', fontSize: 16, flexShrink: 0, transition: 'background 0.12s',
            }}
          ><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {/* Services list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 16px calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {group.services.map((item, i) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onServiceSelect(item)}
              style={{
                width: '100%', padding: '13px 14px',
                marginBottom: 8,
                background: '#fff', borderRadius: 14,
                border: '1.5px solid #E6E2DC',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 12,
                textAlign: isAr ? 'right' : 'left',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                animation: 'sgItem 0.22s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${Math.min(i, 12) * 0.04}s`,
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#8F1D2C'; el.style.background = '#FAFAF8'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 3px 12px rgba(143,29,44,0.08)' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#E6E2DC'; el.style.background = '#fff'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
              onTouchStart={e => { e.currentTarget.style.background = '#F8EDEF' }}
              onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {item.icon
                  ? <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                  : <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                }
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#191713' }}>
                    {isAr ? item.titleAr : item.titleEn}
                  </span>
                </div>
                {(isAr ? item.descriptionAr : item.descriptionEn) && (
                  <div style={{ fontSize: 10.5, color: '#69645C', marginTop: 2, lineHeight: 1.4 }}>
                    {isAr ? item.descriptionAr : item.descriptionEn}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{
                padding: '5px 10px', borderRadius: 8,
                background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff',
                fontSize: 10.5, fontWeight: 700,
                whiteSpace: 'nowrap', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
                boxShadow: '0 2px 6px rgba(143,29,44,0.2)',
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
