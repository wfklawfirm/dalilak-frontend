'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { apiForgotPassword } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

export default function ForgotPasswordPage() {
  const { isAr } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiForgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError((err instanceof Error ? err.message : (isAr ? 'خطأ — حاول مرة أخرى' : 'Error — please try again')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="main-content" dir={isAr ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #6b2737 0%, #8B1A1A 40%, #f7f0eb 100%)',
      padding: '20px 16px',
      fontFamily: "'Cairo','Inter',sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes authLogoIn { from { opacity:0; transform:translateY(-14px) scale(0.92); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes authCardIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .auth-input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #EAE4D9; border-radius: 14px;
          font-size: 15px; outline: none;
          font-family: inherit; background: #FAFAF8;
          transition: border-color 0.18s, box-shadow 0.18s;
          color: #1A1208;
        }
        .auth-input:focus {
          border-color: #8B1A1A;
          box-shadow: 0 0 0 3px rgba(139,26,26,0.10);
          background: #fff;
        }
        .auth-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%);
          color: #fff; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(139,26,26,0.35);
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,26,26,0.4); }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Logo + Brand */}
      <div style={{ textAlign: 'center', marginBottom: 20, animation: 'authLogoIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', backdropFilter: 'blur(8px)',
        }}>
          <img src="/logo.PNG" alt="دليلك"
            style={{ width: 50, height: 50, objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
          دليلك
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
          {isAr ? 'دليل المواطن اللبناني الذكي' : 'The smart Lebanese citizen guide'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 24,
        padding: '28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'authCardIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1208', margin: '0 0 10px' }}>{isAr ? 'تم إرسال الطلب' : 'Request sent'}</h2>
            <p style={{ fontSize: 13, color: '#5C4A3A', lineHeight: 1.6, margin: '0 0 8px' }}>
              {isAr ? 'إذا كان بريدك مسجّلاً، سيتواصل معك فريق الدعم خلال 24 ساعة برمز الاستعادة.' : 'If your email is registered, our support team will contact you within 24 hours with your recovery code.'}
            </p>
            <p style={{ fontSize: 11.5, color: '#9C8E80', margin: '0 0 20px' }}>
              {isAr ? 'يمكنك أيضاً التواصل معنا مباشرةً عبر WhatsApp أو البريد الإلكتروني.' : 'You can also contact us directly via WhatsApp or email.'}
            </p>
            <Link
              href="/login"
              style={{
                display: 'block', padding: '13px',
                background: 'linear-gradient(135deg, #8B1A1A 0%, #6b2737 100%)',
                color: '#fff', borderRadius: 14, fontWeight: 700,
                fontSize: 14, textDecoration: 'none', textAlign: 'center',
                boxShadow: '0 4px 16px rgba(139,26,26,0.35)',
              }}
            >
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: '0 0 6px', textAlign: 'center' }}>
              {isAr ? 'استعادة كلمة المرور' : 'Recover password'}
            </h2>
            <p style={{ fontSize: 12.5, color: '#9C8E80', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
              {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رمز الاستعادة' : 'Enter your email and we will send you a recovery code'}
            </p>

            {error && (
              <div role="alert" style={{
                marginBottom: 14, padding: '10px 14px',
                background: '#FEF2F2', border: '1.5px solid #FECACA',
                borderRadius: 12, color: '#8B1A1A', fontSize: 13, textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="fp-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
                  {isAr ? 'البريد الإلكتروني' : 'Email'} <span style={{ color: '#8B1A1A' }}>*</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                  required
                  dir="ltr"
                  autoFocus
                  style={{ textAlign: 'left' }}
                />
              </div>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال رمز الاستعادة' : 'Send recovery code')}
              </button>
            </form>

            <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#9C8E80' }}>
              <Link href="/login" style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none' }}>
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
              </Link>
            </div>
          </>
        )}

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12.5, color: '#9C8E80' }}>
          {isAr ? 'لديك رمز الاستعادة بالفعل؟' : 'Already have a recovery code?'}{' '}
          <Link href="/reset-password" style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none' }}>
            {isAr ? 'أدخله هنا' : 'Enter it here'}
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, justifyContent:'center' }}>
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 4 9-4M3 6v12l9 4m0-12v12m0-12L12 2l9 4M21 6v12l-9 4"/></svg>
          {isAr ? 'خدمة دليلك — معلومات إرشادية لا تُغني عن المختص القانوني' : 'Dalilak service — guidance information, not a substitute for a legal professional'}
        </span>
      </p>
    </div>
  )
}
