'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiResetPassword } from '@/lib/auth'

function ResetForm() {
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
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    if (password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); return }
    setLoading(true)
    try {
      await apiResetPassword(token.trim(), password)
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'خطأ — تحقق من الرمز')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1208', margin: '0 0 10px' }}>
          تم تغيير كلمة المرور
        </h2>
        <p style={{ fontSize: 13, color: '#5C4A3A', margin: '0 0 20px', lineHeight: 1.6 }}>
          يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="auth-btn"
        >
          تسجيل الدخول
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: '0 0 6px', textAlign: 'center' }}>
        تعيين كلمة مرور جديدة
      </h2>
      <p style={{ fontSize: 12.5, color: '#9C8E80', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
        أدخل الرمز الذي تلقّيته وكلمة المرور الجديدة
      </p>

      {error && (
        <div style={{
          marginBottom: 14, padding: '10px 14px',
          background: '#FEF2F2', border: '1.5px solid #FECACA',
          borderRadius: 12, color: '#991B1B', fontSize: 13, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
            رمز الاستعادة <span style={{ color: '#8B1A1A' }}>*</span>
          </label>
          <input
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
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
            كلمة المرور الجديدة <span style={{ color: '#8B1A1A' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              placeholder="6 أحرف على الأقل"
              required minLength={6}
              autoComplete="new-password"
              style={{ direction: 'ltr', textAlign: 'left', paddingLeft: 44 }}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 0, display: 'flex', alignItems: 'center' }}>
              {showPass
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
            تأكيد كلمة المرور <span style={{ color: '#8B1A1A' }}>*</span>
          </label>
          <input
            type={showPass ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="auth-input"
            placeholder="أعد كتابة كلمة المرور"
            required
            autoComplete="new-password"
            style={{ direction: 'ltr', textAlign: 'left' }}
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
          {loading ? 'جارٍ الحفظ...' : 'تعيين كلمة المرور'}
        </button>
      </form>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: '#9C8E80' }}>
        <Link href="/login" style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none' }}>
          العودة لتسجيل الدخول
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #6b2737 0%, #8B1A1A 40%, #f7f0eb 100%)',
      padding: '20px 16px',
      fontFamily: "'Cairo','Inter',sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
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
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,26,26,0.4); }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>دليلك</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>دليل المواطن اللبناني الذكي</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 24,
        padding: '24px 22px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 24, color: '#9C8E80', fontSize: 13 }}>جاري التحميل...</div>}>
          <ResetForm />
        </Suspense>
      </div>

      <p style={{ marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 4 9-4M3 6v12l9 4m0-12v12m0-12L12 2l9 4M21 6v12l-9 4"/></svg>
          خدمة دليلك — معلومات إرشادية لا تُغني عن المختص القانوني
        </span>
      </p>
    </div>
  )
}