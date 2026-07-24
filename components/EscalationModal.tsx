'use client'

/**
 * EscalationModal — Phase 16 (Human Escalation Layer)
 *
 * Shows when user clicks "اطلب مراجعة قانونية" or "تواصل مع متخصص".
 * Sends POST /escalate to backend (stub — replace with CRM/ticketing).
 */

import React, { useState, useRef, useEffect } from 'react'
import { authHeaders } from '@/lib/auth'
import { Analytics } from '@/lib/analytics'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

type RequestType = 'lawyer_review' | 'document_review' | 'consultation' | 'whatsapp'
type ContactPref = 'email' | 'whatsapp' | 'callback'

interface Props {
  question?: string
  isAr?: boolean
  onClose: () => void
}

function ReqTypeIcon({ id }: { id: RequestType }) {
  if (id === 'lawyer_review') return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
    </svg>
  )
  if (id === 'document_review') return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  )
  if (id === 'consultation') return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  )
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}

const REQUEST_TYPES: { id: RequestType; ar: string; en: string }[] = [
  { id: 'lawyer_review',    ar: 'مراجعة قانونية',        en: 'Lawyer Review' },
  { id: 'document_review',  ar: 'مراجعة وثائق',          en: 'Document Review' },
  { id: 'consultation',     ar: 'استشارة متخصص',         en: 'Expert Consultation' },
  { id: 'whatsapp',         ar: 'تواصل عبر واتساب',      en: 'Contact via WhatsApp' },
]

const CONTACT_PREFS: { id: ContactPref; ar: string; en: string }[] = [
  { id: 'email',     ar: 'بريد إلكتروني', en: 'Email' },
  { id: 'whatsapp',  ar: 'واتساب',         en: 'WhatsApp' },
  { id: 'callback',  ar: 'مكالمة هاتفية',  en: 'Phone call' },
]

export default function EscalationModal({ question = '', isAr = true, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { closeRef.current?.focus() }, [])

  const [requestType, setRequestType] = useState<RequestType>('consultation')
  const [contactPref, setContactPref] = useState<ContactPref>('whatsapp')
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!contact.trim()) {
      setError(isAr ? 'أدخل وسيلة تواصل' : 'Please enter contact info')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        request_type: requestType,
        question,
        context: note,
        contact_preference: contactPref,
        [contactPref === 'email' ? 'user_email' : 'user_phone']: contact,
      }
      const res = await fetch(`${API_URL}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      Analytics.escalationRequested(requestType)
      setSubmitted(true)
    } catch {
      setError(isAr ? 'حدث خطأ، حاول مرة أخرى.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <style>{`@keyframes emFadeIn { from { opacity:0; } to { opacity:1; } } @keyframes emSlideUp { from { transform:translateY(100%); opacity:0.6; } to { transform:translateY(0); opacity:1; } } @keyframes emItem { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } @keyframes emSpin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.45)', animation: 'emFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}>
      <div role="dialog" aria-modal="true" aria-label={isAr ? 'تواصل مع متخصص' : 'Connect with an Expert'} onKeyDown={e => { if (e.key === 'Escape') onClose() }} style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: '20px 20px 0 0', fontFamily: "'Cairo','Inter',sans-serif", boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', animation: 'emSlideUp 0.32s cubic-bezier(0.22,1,0.36,1) both' }} dir={isAr ? 'rtl' : 'ltr'}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D5CEC4' }} />
        </div>
        <div style={{ padding: '8px 18px calc(32px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#191713', margin: 0 }}>
            {isAr ? 'تواصل مع متخصص' : 'Connect with an Expert'}
          </h2>
          <button ref={closeRef} type="button" className="tap-hit-8" onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'}
            onTouchStart={e => { e.currentTarget.style.background = '#D5CEC4' }}
            onTouchEnd={e => { e.currentTarget.style.background = '#E6E2DC' }}
            style={{ background: '#E6E2DC', border: 'none', borderRadius: '50%', width: 28, height: 28, position: 'relative', cursor: 'pointer', color: '#69645C', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}><svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
              <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#78350F', margin: '0 0 6px' }}>
              {isAr ? 'تم إرسال طلبك بنجاح' : 'Request sent successfully'}
            </p>
            <p style={{ fontSize: 12, color: '#69645C', margin: '0 0 20px' }}>
              {isAr ? 'سيتواصل معك أحد المختصين خلال 24 ساعة عمل.' : 'A specialist will contact you within 24 business hours.'}
            </p>
            <button type="button" onClick={onClose} style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #8F1D2C, #741622)', color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(143,29,44,0.25)' }}>
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        ) : (
          <>
            {/* Request type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {REQUEST_TYPES.map((t, i) => (
                <button key={t.id} type="button" onClick={() => setRequestType(t.id)} aria-pressed={requestType === t.id} aria-label={isAr ? t.ar : t.en} style={{ padding: '10px 8px', border: '1.5px solid', borderColor: requestType === t.id ? '#8F1D2C' : '#E6E2DC', background: requestType === t.id ? '#F8EDEF' : '#FAFAF8', borderRadius: 12, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: requestType === t.id ? '#8F1D2C' : '#4A4035', cursor: 'pointer', textAlign: 'center', animation: 'emItem 0.22s cubic-bezier(0.22,1,0.36,1) both', animationDelay: `${i * 0.05}s` }}>
                  <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><ReqTypeIcon id={t.id} /></div>
                  {isAr ? t.ar : t.en}
                </button>
              ))}
            </div>

            {/* Question preview */}
            {question && (
              <div style={{ background: '#FAFAF8', border: '1px solid #E6E2DC', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 11.5, color: '#69645C', lineHeight: 1.5 }}>
                <strong style={{ color: '#918B82', display: 'block', marginBottom: 2 }}>{isAr ? 'سؤالك:' : 'Your question:'}</strong>
                {question.slice(0, 150)}{question.length > 150 ? '...' : ''}
              </div>
            )}

            {/* Note */}
            <textarea
              aria-label={isAr ? 'ملاحظة إضافية' : 'Additional note'}
              placeholder={isAr ? 'أضف ملاحظة أو تفاصيل إضافية (اختياري)...' : 'Add a note or details (optional)...'}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              onFocus={e => { e.currentTarget.style.borderColor = '#8F1D2C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(143,29,44,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E6E2DC'; e.currentTarget.style.boxShadow = 'none' }}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E6E2DC', borderRadius: 12, fontSize: 12.5, fontFamily: 'inherit', color: '#191713', resize: 'none', outline: 'none', marginBottom: 10, direction: isAr ? 'rtl' : 'ltr', transition: 'border-color 0.18s, box-shadow 0.18s' }}
            />

            {/* Contact preference */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {CONTACT_PREFS.map(p => (
                <button key={p.id} type="button" onClick={() => setContactPref(p.id)} aria-pressed={contactPref === p.id} aria-label={isAr ? p.ar : p.en} style={{ flex: 1, padding: '6px 4px', border: '1.5px solid', borderColor: contactPref === p.id ? '#8F1D2C' : '#E6E2DC', background: contactPref === p.id ? '#F8EDEF' : '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600, color: contactPref === p.id ? '#8F1D2C' : '#69645C', textAlign: 'center' }}>
                  {isAr ? p.ar : p.en}
                </button>
              ))}
            </div>

            {/* Contact info */}
            <input
              type={contactPref === 'email' ? 'email' : 'tel'}
              aria-label={contactPref === 'email' ? (isAr ? 'البريد الإلكتروني' : 'Email address') : (isAr ? 'رقم الهاتف' : 'Phone number')}
              aria-required="true"
              placeholder={
                contactPref === 'email'
                  ? (isAr ? 'بريدك الإلكتروني' : 'Your email')
                  : (isAr ? 'رقم هاتفك / واتساب' : 'Your phone / WhatsApp')
              }
              value={contact}
              onChange={e => { setContact(e.target.value); setError('') }}
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(143,29,44,0.08)' }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', border: `1.5px solid ${error ? '#8F1D2C' : '#E6E2DC'}`,
                borderRadius: 12, fontSize: 13, fontFamily: 'inherit',
                color: '#191713', outline: 'none', marginBottom: 6,
                background: '#FAFAF8', direction: 'ltr', transition: 'box-shadow 0.18s',
              }}
            />

            {/* Error */}
            {error && (
              <p role="alert" style={{ fontSize: 11, color: '#8F1D2C', margin: '0 0 8px', fontWeight: 600 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              aria-label={isAr ? 'إرسال الطلب' : 'Send request'}
              onTouchStart={e => { if (!loading) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.97)' } }}
              onTouchEnd={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#D4C5B0' : 'linear-gradient(135deg, #8F1D2C, #741622)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 13.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 3px 10px rgba(143,29,44,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'opacity 0.12s, transform 0.12s',
              }}
            >
              {loading ? (
                <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'emSpin 0.7s linear infinite', display: 'inline-block' }} />
              ) : (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              )}
              {loading ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال الطلب' : 'Send Request')}
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  </>
  )
}
