'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiResetPassword } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

function ResetForm() {
  const { isAr } = useLanguage()
  const router = useRouter()
  const params = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return }
    if (password.length < 6) { setError(isAr ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await apiResetPassword(token.trim(), password)
      setDone(true)
    } catch (err) {
      setError((err instanceof Error ? err.message : (isAr ? 'خطأ — تحقق من الرمز' : 'Error — check the code')))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#78350F" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#191713', margin: '0 0 10px' }}>
          {isAr ? 'تم تغيير كلمة المرور' : 'Password changed'}
        </h2>
        <p style={{ fontSize: 13, color: '#69645C', margin: '0 0 20px', lineHeight: 1.6 }}>
          {isAr ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' : 'You can now log in with your new password.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="auth-btn"
        >
          {isAr ? 'تسجيل الدخول' : 'Login'}
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#191713', margin: '0 0 6px', textAlign: 'center' }}>
        {isAr ? 'تعيين كلمة مرور جديدة' : 'Set a new password'}
      </h2>
      <p style={{ fontSize: 12.5, color: '#918B82', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
        {isAr ? 'أدخل الرمز الذي تلقّيته وكلمة المرور الجديدة' : 'Enter the code you received and your new password'}
      </p>

      {error && (
        <div role="alert" style={{
          marginBottom: 14, padding: '10px 14px',
          background: '#F8EDEF', border: '1.5px solid #FECACA',
          borderRadius: 12, color: '#8F1D2C', fontSize: 13, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label htmlFor="rp-token" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
            {isAr ? 'رمز الاستعادة' : 'Recovery code'} <span style={{ color: '#8F1D2C' }}>*</span>
          </label>
          <input
            id="rp-token"
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="auth-input"
            placeholder="123456"
            required
            dir="ltr"
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '4px', fontSize: 20, fontWeight: 700 }}
          />
        </div>
        <div>
          <label htmlFor="rp-password" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
            {isAr ? 'كلمة المرور الجديدة' : 'New password'} <span style={{ color: '#8F1D2C' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="rp-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              placeholder={isAr ? '6 أحرف على الأقل' : 'min. 6 characters'}
              required minLength={6}
              autoComplete="new-password"
              style={{ direction: 'ltr', textAlign: 'left', paddingLeft: 44 }}
            />
            <button type="button" tabIndex={-1} aria-label={showPass ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')} onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#918B82', padding: 0, display: 'flex', alignItems: 'center' }}>
              {showPass
                ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="rp-confirm" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
            {isAr ? 'تأكيد كلمة المرور' : 'Confirm password'} <span style={{ color: '#8F1D2C' }}>*</span>
          </label>
          <input
            id="rp-confirm"
            type={showPass ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="auth-input"
            placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
            required
            autoComplete="new-password"
            style={{ direction: 'ltr', textAlign: 'left' }}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
          {loading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'تعيين كلمة المرور' : 'Set password')}
        </button>
      </form>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#918B82' }}>
        <Link href="/login" style={{ color: '#8F1D2C', fontWeight: 700, textDecoration: 'none' }}>
          {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  const { isAr } = useLanguage()
  return (
    <div id="main-content" dir={isAr ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F8F6',
      padding: '20px 16px',
      fontFamily: "'Cairo','Inter',sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes authLogoIn { from { opacity:0; transform:translateY(-14px) scale(0.92); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes authCardIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .auth-input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #E6E2DC; border-radius: 14px;
          font-size: 15px; outline: none;
          font-family: inherit; background: #FAFAF8;
          transition: border-color 0.18s, box-shadow 0.18s;
          color: #191713;
        }
        .auth-input:focus {
          border-color: #8F1D2C;
          box-shadow: 0 0 0 3px rgba(143,29,44,0.10);
          background: #fff;
        }
        .auth-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #8F1D2C 0%, #741622 100%);
          color: #fff; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(143,29,44,0.35);
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(143,29,44,0.4); }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 20, animation: 'authLogoIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#F8EDEF',
          border: '1.5px solid rgba(143,29,44,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <img src="/logo-icon.png" alt="دليلك"
            style={{ width: 50, height: 50, objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#191713', margin: 0, letterSpacing: '-0.3px' }}>دليلك</h1>
        <p style={{ fontSize: 12, color: '#918B82', marginTop: 3 }}>{isAr ? 'دليل المواطن اللبناني الذكي' : 'The smart Lebanese citizen guide'}</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 24,
        padding: '24px 22px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        animation: 'authCardIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
      }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 24, color: '#918B82', fontSize: 13 }}>{isAr ? 'جاري التحميل...' : 'Loading...'}</div>}>
          <ResetForm />
        </Suspense>
      </div>

      <p style={{ marginTop: 18, fontSize: 11, color: '#B8B2AA', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 4 9-4M3 6v12l9 4m0-12v12m0-12L12 2l9 4M21 6v12l-9 4"/></svg>
          {isAr ? 'خدمة دليلك — معلومات إرشادية لا تُغني عن المختص القانوني' : 'Dalilak service — guidance information, not a substitute for a legal professional'}
        </span>
      </p>
    </div>
  )
}