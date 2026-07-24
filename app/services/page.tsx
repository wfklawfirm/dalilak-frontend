'use client'
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '@/lib/allServices'
import { useLanguage } from '@/lib/LanguageContext'
import { useFlowchart } from '@/lib/useFlowchart'
import { useFlowchartProgress } from '@/lib/useFlowchartProgress'
import ProcedureFlowchartComponent from '@/components/ProcedureFlowchart'
import SaveToMyFilesButton from '@/components/SaveToMyFilesButton'
import ReadinessChecker from '@/components/ReadinessChecker'
import SaveButton from '@/components/SaveButton'
import { trackView } from '@/lib/savedItems'
import type { ServiceItem } from '@/lib/allServices'
import ServiceMapPlaceholder from '@/components/ServiceMapPlaceholder'
import SectionCollapseToggle from '@/components/SectionCollapseToggle'

// ─── Service Detail Sheet ────────────────────────────────────────────────────

function ServiceSheet({ service, onClose, onAsk }: {
  service: ServiceItem
  onClose: () => void
  onAsk: (q: string) => void
}) {
  const { isAr } = useLanguage()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { closeRef.current?.focus() }, [])
  const displayName = isAr ? service.name_ar : (service.name_en || service.name_ar)
  const displayAuthority = isAr ? service.authority_ar : (service.authority_en || service.authority_ar)
  const displayCategory = isAr ? service.category : (service.category_en || service.category)
  const displayFees = isAr ? service.fees : (service.fees_en || service.fees)
  const displayProcessingTime = isAr ? service.processing_time : (service.processing_time_en || service.processing_time)
  const displayDescription = isAr ? service.description : (service.description_en || service.description)
  const displayRequiredDocuments = isAr ? service.required_documents : (service.required_documents_en?.length ? service.required_documents_en : service.required_documents)
  const displayImportantNotes = isAr ? service.important_notes : (service.important_notes_en || service.important_notes)

  const flowchartSource = useMemo(() => ({
    slug: `service-${service.slug}`,
    titleAr: service.name_ar,
    titleEn: service.name_en,
    category: displayCategory,
    authority: displayAuthority,
    fees: displayFees,
    processingTime: displayProcessingTime,
    requiredDocuments: displayRequiredDocuments,
    descriptionAr: displayDescription,
  }), [service.slug, service.name_ar, service.name_en, displayCategory, displayAuthority, displayFees, displayProcessingTime, displayRequiredDocuments, displayDescription])
  const { flowchart: svcFlowchart, loading: fcLoading, error: fcError, generate: generateFc } = useFlowchart(flowchartSource, false)
  const svcProgress = useFlowchartProgress(flowchartSource.slug)

  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={displayName}
        onKeyDown={e => { if (e.key === 'Escape') onClose() }}
        style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 720,
        margin: '0 auto', maxHeight: '82vh', overflow: 'hidden', display: 'flex',
        flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '4px 20px 14px', borderBottom: '1px solid #E6E2DC' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #F8EDEF, #FDE8E8)',
              border: '1px solid rgba(143,29,44,0.1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>
              {service.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#191713', lineHeight: 1.35 }}>
                {displayName}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8F1D2C', fontWeight: 600, lineHeight: 1.3 }}>
                {displayAuthority}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label={isAr ? 'إغلاق' : 'Close'}
              onClick={onClose}
              style={{
                background: '#E6E2DC', border: 'none', borderRadius: 10, width: 32, height: 32,
                cursor: 'pointer', color: '#69645C', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, color: '#8F1D2C', background: '#F8EDEF', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(143,29,44,0.15)', fontWeight: 600 }}>
              {displayCategory}
            </span>
            {displayFees && (
              <span style={{ fontSize: 10.5, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '3px 10px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                {displayFees}
              </span>
            )}
            {displayProcessingTime && (
              <span style={{ fontSize: 10.5, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '3px 10px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                {displayProcessingTime}
              </span>
            )}
            {service.online_available && (
              <span style={{ fontSize: 10.5, color: '#065F46', background: 'rgba(6,95,70,0.07)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(6,95,70,0.2)', fontWeight: 600 }}>
                {isAr ? 'متاح أونلاين' : 'Available Online'}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {displayDescription && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#2D1B0E', lineHeight: 1.75 }}>
              {displayDescription}
            </p>
          )}

          {/* Required documents — interactive readiness checker */}
          {displayRequiredDocuments && displayRequiredDocuments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ReadinessChecker
                storageKey={`svc-${service.slug}`}
                documentsAr={service.required_documents}
                documentsEn={service.required_documents_en}
                titleAr={service.name_ar}
                titleEn={service.name_en}
                onAsk={onAsk}
              />
            </div>
          )}

          {/* AI Flowchart */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: '#191713', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: '#F8EDEF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              </span>
              {isAr ? 'خارطة الإجراء' : 'Procedure Map'}
            </h3>
            {svcFlowchart ? (
              <>
                <ProcedureFlowchartComponent
                  flowchart={svcFlowchart}
                  isAr={isAr}
                  compact
                  completedNodeIds={svcProgress.completedNodes}
                  onToggleNode={svcProgress.toggleNode}
                />
                <SaveToMyFilesButton slug={flowchartSource.slug} titleAr={service.name_ar} flowchart={svcFlowchart} isAr={isAr} compact />
              </>
            ) : (
              <button
                type="button"
                onClick={generateFc}
                disabled={fcLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 14px', borderRadius: 12, background: fcLoading ? '#F5F0EA' : '#F8EDEF',
                  border: '1.5px dashed rgba(143,29,44,0.3)', color: '#8F1D2C', fontSize: 12.5, fontWeight: 700,
                  cursor: fcLoading ? 'default' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {fcLoading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(143,29,44,0.25)', borderTopColor: '#8F1D2C', animation: 'svcFcSpin 0.8s linear infinite', display: 'inline-block' }} />
                    {isAr ? 'جارٍ توليد الخارطة بالذكاء الاصطناعي...' : 'Generating AI map...'}
                  </>
                ) : (
                  <>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    {isAr ? 'توليد خارطة الإجراء بالذكاء الاصطناعي' : 'Generate AI procedure map'}
                  </>
                )}
              </button>
            )}
            {fcError && (
              <p style={{ fontSize: 10.5, color: '#8F1D2C', margin: '6px 0 0' }}>
                {isAr ? 'تعذّر التوليد — ' : 'Generation failed — '}
                <button type="button" onClick={generateFc} style={{ background: 'none', border: 'none', color: '#8F1D2C', textDecoration: 'underline', cursor: 'pointer', fontSize: 10.5, padding: 0, fontFamily: 'inherit' }}>
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </p>
            )}
            <style>{`@keyframes svcFcSpin { to { transform: rotate(360deg); } }`}</style>
          </div>

          {/* Important notes */}
          {displayImportantNotes && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
              padding: '10px 13px', marginBottom: 16,
            }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p style={{ margin: 0, fontSize: 11.5, color: '#78350F', lineHeight: 1.6 }}>
                {displayImportantNotes}
              </p>
            </div>
          )}

          {/* Forms needed */}
          {service.forms_needed && service.forms_needed.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#191713', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: '#FFFBEB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </span>
                {isAr ? 'النماذج المطلوبة' : 'Required Forms'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.forms_needed.map((form, i) => {
                  const urlMatch = form.match(/(https?:\/\/[^\s]+)/)
                  const url = urlMatch ? urlMatch[1] : null
                  const label = url ? form.replace(/\s*—?\s*https?:\/\/[^\s]+/, '').trim() : form
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#8F1D2C', background: '#F8EDEF', borderRadius: 8, padding: '7px 10px', border: '1px solid rgba(143,29,44,0.15)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      {label || (isAr ? 'تحميل النموذج' : 'Download Form')}
                    </a>
                  ) : (
                    <span key={i} style={{ fontSize: 12, color: '#854D0E', background: '#FFFBEB', borderRadius: 8, padding: '6px 10px', border: '1px solid #FDE68A' }}>{form}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact info */}
          {(service.phone || service.website || service.working_hours) && (
            <div style={{ background: '#F8F4F0', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, color: '#69645C', margin: '0 0 8px' }}>{isAr ? 'معلومات التواصل' : 'Contact Information'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {service.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#2D1B0E' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    {service.phone}
                  </div>
                )}
                {service.working_hours && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#2D1B0E' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                    </svg>
                    {service.working_hours}
                  </div>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#8F1D2C', fontWeight: 600, textDecoration: 'none' }}>
                    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8F1D2C" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    {isAr ? 'الموقع الرسمي' : 'Official Website'}
                  </a>
                )}
              </div>
            </div>
          )}

          <p style={{ fontSize: 10, color: '#918B82', margin: 0, lineHeight: 1.5, padding: '10px 14px', background: '#FAFAF8', borderRadius: 8 }}>
            {isAr ? 'المعلومات للإرشاد العام — تأكد دائماً من المصادر الرسمية قبل تقديم أي طلب.' : 'This information is for general guidance — always verify with official sources before submitting any request.'}
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #E6E2DC', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => onAsk(isAr ? (service.chatPrompt_ar || service.name_ar) : `What are the requirements and steps for: ${service.name_en || service.name_ar}?`)}
            onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
            onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            style={{
              flex: 1, padding: '13px 16px', borderRadius: 14,
              background: 'linear-gradient(135deg, #8F1D2C, #741622)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 3px 12px rgba(143,29,44,0.3)', transition: 'opacity 0.12s, transform 0.12s',
            }}
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
          </button>
          <SaveButton
            variant="pill"
            size="md"
            item={{
              id: `svc-${service.slug}`,
              type: 'service',
              icon: service.icon || '🏛️',
              titleAr: service.name_ar,
              titleEn: service.name_en || service.name_ar,
              subtitleAr: service.authority_ar || service.category || '',
              subtitleEn: service.authority_en || service.category_en || service.category || '',
              aiPrompt: isAr ? (service.chatPrompt_ar || service.name_ar) : `What are the requirements and steps for: ${service.name_en || service.name_ar}?`,
              href: '/services',
            }}
          />
          {/* WhatsApp share */}
          <button
            type="button"
            onClick={() => {
              const title = isAr ? service.name_ar : (service.name_en || service.name_ar)
              const auth = isAr ? service.authority_ar : (service.authority_en || service.authority_ar)
              const docs = service.required_documents?.slice(0, 4) || []
              const lines = [
                `🏛️ *${title}*`,
                auth ? `📍 ${auth}` : '',
                '',
                docs.length > 0 ? (isAr ? '📁 الوثائق المطلوبة:' : '📁 Required documents:') : '',
                ...docs.map((d: string) => `• ${d}`),
                '',
                `🔗 dalilak.vercel.app`,
              ].filter(Boolean)
              window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
            }}
            title={isAr ? 'مشاركة واتساب' : 'Share via WhatsApp'}
            style={{
              padding: '13px 14px', borderRadius: 14, background: '#25D366',
              border: 'none', color: '#fff', fontSize: 12,
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.876L.057 23.882l6.187-1.473A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.875 9.875 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.86 9.86 0 012.106 12c0-5.459 4.435-9.894 9.894-9.894 5.46 0 9.894 4.435 9.894 9.894 0 5.46-4.434 9.894-9.894 9.894z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            onTouchStart={e => { e.currentTarget.style.background = '#E6E2DC' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#FAFAF8' }}
            style={{
              padding: '13px 16px', borderRadius: 14, background: '#FAFAF8',
              border: '1.5px solid #E6E2DC', color: '#69645C', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s',
            }}
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      border: '1px solid #e6e2dc', minHeight: 110,
      display: 'flex', flexDirection: 'column', gap: 10,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="sk-pulse" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sk-pulse" style={{ height: 12, borderRadius: 4, width: '70%' }} />
          <div className="sk-pulse" style={{ height: 9, borderRadius: 4, width: '45%' }} />
        </div>
      </div>
      <div className="sk-pulse" style={{ height: 9, borderRadius: 4, width: '85%' }} />
      <div className="sk-pulse" style={{ height: 9, borderRadius: 4, width: '60%' }} />
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const handleAsk = useCallback((q: string) => {
    setSelectedService(null)
    router.push(`/?q=${encodeURIComponent(q)}`)
  }, [router])

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_SERVICES.forEach(s => {
      if (s.categorySlug) counts[s.categorySlug] = (counts[s.categorySlug] || 0) + 1
    })
    return counts
  }, [])

  // Sort categories by count descending
  const sortedCategories = useMemo(() =>
    [...SERVICE_CATEGORIES].sort((a, b) => (categoryCounts[b.slug] || 0) - (categoryCounts[a.slug] || 0)),
  [categoryCounts])

  // Filter services locally — instant, no API call
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ALL_SERVICES.filter(s => {
      const matchesCat = !selectedCat || s.categorySlug === selectedCat
      const matchesQ = !q ||
        s.name_ar.toLowerCase().includes(q) ||
        s.authority_ar.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      return matchesCat && matchesQ
    })
  }, [search, selectedCat])

  const activeCatLabel = selectedCat
    ? (isAr
        ? SERVICE_CATEGORIES.find(c => c.slug === selectedCat)?.label_ar
        : SERVICE_CATEGORIES.find(c => c.slug === selectedCat)?.label_en)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #E6E2DC; border-radius: 4px; }
        .svc-card { transition: border-color 0.14s, box-shadow 0.14s, transform 0.14s; }
        .svc-card:hover { border-color: rgba(143,29,44,0.4) !important; box-shadow: 0 4px 18px rgba(143,29,44,0.13) !important; transform: translateY(-2px); }
        .cat-chip { transition: border-color 0.14s, color 0.14s, background 0.14s; }
        .cat-chip:hover { border-color: #8F1D2C !important; color: #8F1D2C !important; background: #FEF7F7 !important; }
        @keyframes svc-header-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes svc-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes svcEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes svcStatsIn { from { opacity: 0; transform: translateY(-5px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .sk-pulse { background: linear-gradient(90deg, #f0efed 25%, #e8e6e2 50%, #f0efed 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; }
        .cat-chips-row::-webkit-scrollbar { display: none; }
        .cat-chips-row { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 599px) {
          .svc-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .svc-card { padding: 10px !important; }
          .svc-card h3 { font-size: 11.5px !important; line-height: 1.35 !important; }
          .svc-icon { font-size: 15px !important; }
          .svc-cat { font-size: 9px !important; padding: 1px 5px !important; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .svc-meta { display: none !important; }
        }
        @media (min-width: 600px) and (max-width: 899px) { .svc-grid { grid-template-columns: repeat(3, 1fr) !important; } }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #741622 0%, #8F1D2C 60%, #7a1818 100%)',
        boxShadow: '0 4px 24px rgba(80,10,10,0.3)',
        padding: '13px 16px', position: 'sticky', top: 0, zIndex: 50,
        animation: 'svc-header-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label={isAr ? 'الرجوع' : 'Go back'}
            onClick={() => router.push('/')}
            className="nav-home-btn"
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
            onTouchEnd={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 9, color: '#fff', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexShrink: 0,
            }}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isAr ? 'scaleX(-1)' : 'none', display: 'block' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              <img src="/logo-icon.png" alt="دليلك" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2, fontFamily: 'inherit' }}>{isAr ? 'الخدمات الحكومية' : 'Government Services'}</h1>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                {isAr ? `${ALL_SERVICES.length} خدمة · ${SERVICE_CATEGORIES.length} فئة` : `${ALL_SERVICES.length} services · ${SERVICE_CATEGORIES.length} categories`}
              </div>
            </div>
          </div>
          {/* Search count badge */}
          {(search || selectedCat) && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.15)', borderRadius: 20,
              padding: '3px 10px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span aria-live="polite" aria-atomic="true">{filtered.length} {isAr ? 'نتيجة' : 'results'}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div id="main-content" style={{ background: 'transparent', padding: '12px 14px 0', maxWidth: 1024, margin: '0 auto' }}>
        <div style={{ position: 'relative', background: '#fff', border: `1.5px solid ${searchFocused ? '#8F1D2C' : '#E6E2DC'}`, borderRadius: 14, boxShadow: searchFocused ? '0 0 0 3px rgba(143,29,44,0.08), 0 2px 12px rgba(143,29,44,0.06)' : '0 1px 6px rgba(0,0,0,0.05)', transition: 'border-color 0.18s, box-shadow 0.18s' }}>
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#8F1D2C' : '#B0A090', display: 'flex', alignItems: 'center', pointerEvents: 'none', transition: 'color 0.18s',
          }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            aria-label={isAr ? 'ابحث في الخدمات' : 'Search services'}
            placeholder={isAr ? 'ابحث: جواز سفر، تسجيل شركة، ترخيص بناء...' : 'Search: passport, company registration, building permit...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%', padding: '12px 44px 12px 42px', borderRadius: 14,
              fontSize: 13.5, border: 'none', outline: 'none',
              fontFamily: "'Cairo','Inter',sans-serif",
              direction: isAr ? 'rtl' : 'ltr', color: '#191713', background: 'transparent',
            }}
          />
          {search && (
            <button
              type="button"
              aria-label={isAr ? 'مسح البحث' : 'Clear search'}
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                background: '#E6E2DC', border: 'none', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer', color: '#69645C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '18px 14px 100px' }}>

        {/* ── Overview & nearby offices — collapsed by default to reduce clutter ── */}
        <div style={{ marginBottom: 16, background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 16, padding: '12px 16px' }}>
          <SectionCollapseToggle
            titleAr="نظرة عامة والمكاتب القريبة"
            titleEn="Overview & nearby offices"
            icon="📊"
            defaultOpen={false}
            storageKey="dalilak_svc_more"
          >
            <div style={{ paddingTop: 8 }}>
              {/* ── Stats strip — premium individual cards ─────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { value: String(ALL_SERVICES.length), label: isAr ? 'خدمة حكومية' : 'Services', featured: true },
                  { value: String(SERVICE_CATEGORIES.length), label: isAr ? 'فئة خدمية' : 'Categories', featured: false },
                  { value: ALL_SERVICES.filter(s => s.online_available).length + '+', label: isAr ? 'خدمة أونلاين' : 'Online services', featured: false },
                ].map((stat, i) => (
                  <div key={stat.label} style={{
                    padding: '14px 8px 16px', textAlign: 'center',
                    background: stat.featured ? 'linear-gradient(135deg, #F8EDEF 0%, #FDE4E4 100%)' : '#fff',
                    border: stat.featured ? '1.5px solid rgba(143,29,44,0.18)' : '1.5px solid #E6E2DC',
                    borderRadius: 12,
                    boxShadow: stat.featured ? '0 2px 10px rgba(143,29,44,0.09)' : '0 1px 5px rgba(0,0,0,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    animation: 'svcStatsIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay: `${0.06 + i * 0.07}s`,
                  }}>
                    <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 900, color: '#8F1D2C', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Map placeholder — find nearby offices ──────────────────────── */}
              <ServiceMapPlaceholder />
            </div>
          </SectionCollapseToggle>
        </div>

        {/* ── Category chips — horizontal scroll, no wrap ──────────────────── */}
        <div style={{ marginBottom: 16, marginRight: -14, marginLeft: -14 }}>
          <div
            className="cat-chips-row"
            style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 7, paddingRight: 14, paddingLeft: 14, paddingBottom: 2 }}
          >
            {/* All / reset chip */}
            <button
              type="button"
              aria-pressed={!selectedCat}
              onClick={() => setSelectedCat(null)}
              className="cat-chip"
              onTouchStart={e => {
                e.currentTarget.style.background = !selectedCat ? '#FDE8E8' : '#FEF9F9'
                e.currentTarget.style.borderColor = '#8F1D2C'
              }}
              onTouchEnd={e => {
                e.currentTarget.style.background = !selectedCat ? '#F8EDEF' : '#fff'
                e.currentTarget.style.borderColor = !selectedCat ? '#8F1D2C' : '#E6E2DC'
              }}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                border: !selectedCat ? '2px solid #8F1D2C' : '1.5px solid #E6E2DC',
                background: !selectedCat ? '#F8EDEF' : '#fff',
                color: !selectedCat ? '#8F1D2C' : '#69645C',
                boxShadow: !selectedCat ? '0 2px 8px rgba(143,29,44,0.15)' : 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {isAr ? `الكل (${ALL_SERVICES.length})` : `All (${ALL_SERVICES.length})`}
            </button>

            {sortedCategories.map(cat => {
              const active = selectedCat === cat.slug
              const cnt = categoryCounts[cat.slug] || 0
              return (
                <button
                  type="button"
                  key={cat.slug}
                  aria-pressed={active}
                  onClick={() => setSelectedCat(active ? null : cat.slug)}
                  className="cat-chip"
                  onTouchStart={e => {
                    e.currentTarget.style.background = active ? '#FDE8E8' : '#FEF9F9'
                    e.currentTarget.style.borderColor = '#8F1D2C'
                  }}
                  onTouchEnd={e => {
                    e.currentTarget.style.background = active ? '#F8EDEF' : '#fff'
                    e.currentTarget.style.borderColor = active ? '#8F1D2C' : '#E6E2DC'
                  }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: active ? 700 : 600,
                    border: active ? '2px solid #8F1D2C' : '1.5px solid #E6E2DC',
                    background: active ? '#F8EDEF' : '#fff',
                    color: active ? '#8F1D2C' : '#69645C',
                    boxShadow: active ? '0 2px 8px rgba(143,29,44,0.15)' : 'none',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{cat.icon}</span>
                  {isAr ? cat.label_ar : cat.label_en}
                  {cnt > 0 && <span style={{ opacity: 0.55, fontSize: 10, fontWeight: 600 }}>{cnt}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results meta bar ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#918B82', fontWeight: 500 }}>
            {filtered.length === ALL_SERVICES.length
              ? (isAr ? `${ALL_SERVICES.length} خدمة حكومية` : `${ALL_SERVICES.length} services`)
              : (isAr ? `${filtered.length} خدمة` : `${filtered.length} services`)}
          </span>
          {activeCatLabel && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 12 }}>·</span>
              <button
                type="button"
                aria-label={isAr ? `إزالة فلتر الفئة: ${activeCatLabel}` : `Remove category filter: ${activeCatLabel}`}
                onClick={() => setSelectedCat(null)}
                style={{
                  fontSize: 11, color: '#8F1D2C', fontWeight: 700,
                  background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)',
                  borderRadius: 20, padding: '2px 10px', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {activeCatLabel}
                <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </>
          )}
          {search && (
            <>
              <span style={{ color: '#D4C5B0', fontSize: 12 }}>·</span>
              <span style={{ fontSize: 11, color: '#918B82' }}>{isAr ? `نتائج لـ "${search}"` : `Results for "${search}"`}</span>
            </>
          )}
        </div>

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="1.4">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p style={{ color: '#69645C', fontSize: 14, fontWeight: 600, margin: '0 0 5px' }}>
              {isAr ? 'لا توجد نتائج مطابقة' : 'No matching results'}
            </p>
            <p style={{ color: '#918B82', fontSize: 12.5, margin: '0 0 18px' }}>
              {isAr ? 'جرّب مصطلحاً مختلفاً أو اسأل دليلك مباشرةً' : 'Try a different term or ask Dalilak directly'}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => router.push(`/?q=${encodeURIComponent(search)}`)}
                onTouchStart={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
                style={{
                  padding: '10px 20px', background: 'linear-gradient(135deg, #8F1D2C, #741622)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(143,29,44,0.25)',
                  transition: 'opacity 0.12s, transform 0.12s',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                {isAr ? 'اسأل دليلك' : 'Ask Dalilak'}
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCat(null) }}
                onTouchStart={e => { e.currentTarget.style.background = '#E6E2DC' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}
                style={{
                  padding: '10px 20px', background: '#fff', border: '1.5px solid #E6E2DC',
                  color: '#69645C', borderRadius: 12,
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
              >
                {isAr ? 'عرض كل الخدمات' : 'Show all services'}
              </button>
            </div>
          </div>
        ) : !mounted ? (
          <div
            className="svc-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}
          >
            {Array.from({ length: 12 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : (
          <div
            className="svc-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}
          >
            {filtered.map((service, svcIdx) => (
              <button
                type="button"
                key={service.id}
                aria-label={isAr ? service.name_ar : (service.name_en || service.name_ar)}
                onClick={() => {
                  setSelectedService(service)
                  trackView({
                    id: `svc-${service.id}`,
                    type: 'service',
                    icon: service.icon || '🏛️',
                    titleAr: service.name_ar,
                    titleEn: service.name_en || service.name_ar,
                    subtitleAr: service.authority_ar || service.category || '',
                    subtitleEn: service.authority_en || service.category_en || '',
                    aiPrompt: service.chatPrompt_ar || `أخبرني عن خدمة: ${service.name_ar}`,
                    href: '/services',
                  })
                }}
                className="svc-card"
                style={{
                  display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16,
                  padding: '14px', border: '1.5px solid #E6E2DC',
                  textAlign: 'right', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  fontFamily: 'inherit', cursor: 'pointer', width: '100%',
                  transition: 'all 0.14s', position: 'relative', overflow: 'hidden',
                  animation: 'svcEnter 0.22s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${Math.min(svcIdx, 20) * 0.03}s`,
                }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF7F7'; e.currentTarget.style.borderColor = 'rgba(143,29,44,0.3)'; e.currentTarget.style.transform = 'scale(0.98)' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                {/* Top row: icon badge + chevron */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #F8EDEF, #FCE8E8)',
                    border: '1px solid rgba(143,29,44,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span className="svc-icon" style={{ fontSize: 20, lineHeight: 1 }}>{service.icon}</span>
                  </div>
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4C5B0" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </div>

                {/* Name */}
                <h3 style={{
                  fontSize: 13, fontWeight: 800, color: '#191713', margin: '0 0 4px', lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  flex: 1,
                }}>
                  {isAr ? service.name_ar : (service.name_en || service.name_ar)}
                </h3>

                {/* Authority */}
                <p style={{
                  fontSize: 10.5, color: '#8F1D2C', margin: '0 0 10px', fontWeight: 700,
                  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {isAr ? service.authority_ar : (service.authority_en || service.authority_ar)}
                </p>

                {/* Meta row */}
                <div className="svc-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {(() => {
                    const cardFees = isAr ? service.fees : (service.fees_en || service.fees)
                    return cardFees && (
                      <span style={{ fontSize: 10, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '2px 8px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                        {cardFees.length > 18 ? cardFees.slice(0, 18) + '…' : cardFees}
                      </span>
                    )
                  })()}
                  {(() => {
                    const cardProcessingTime = isAr ? service.processing_time : (service.processing_time_en || service.processing_time)
                    return cardProcessingTime && (
                      <span style={{ fontSize: 10, color: '#92400E', background: '#FFFBEB', borderRadius: 20, padding: '2px 8px', border: '1px solid #FDE68A', fontWeight: 600 }}>
                        {cardProcessingTime}
                      </span>
                    )
                  })()}
                  {service.online_available && (
                    <span style={{ fontSize: 10, color: '#065F46', background: 'rgba(6,95,70,0.07)', borderRadius: 20, padding: '2px 8px', border: '1px solid rgba(6,95,70,0.2)', fontWeight: 600 }}>
                      {isAr ? 'أونلاين' : 'Online'}
                    </span>
                  )}
                  {(() => {
                    const cardDocs = isAr ? service.required_documents : (service.required_documents_en?.length ? service.required_documents_en : service.required_documents)
                    return cardDocs && cardDocs.length > 0 && (
                      <span style={{ fontSize: 10, color: '#69645C', background: '#E6E2DC', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                        {cardDocs.length} {isAr ? 'وثيقة' : 'docs'}
                      </span>
                    )
                  })()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Service Detail Sheet ─────────────────────────────────────────────── */}
      {selectedService && (
        <ServiceSheet
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAsk={handleAsk}
        />
      )}

      <div className="bottom-nav-wrapper"><BottomNav isAr={isAr} activeTab="services" /></div>
    </div>
  )
}