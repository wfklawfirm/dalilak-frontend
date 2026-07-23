'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRegister, setToken, setUser } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

export default function RegisterPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [form, setForm] = useState({
    full_name: '', username: '', email: '', phone: '', password: '', confirm: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return }
    if (form.password.length < 6) { setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await apiRegister({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      })
      setToken(data.token)
      setUser(data.user)
      router.push('/')
    } catch (err) {
      setError((err instanceof Error ? err.message : (isAr ? 'خطأ في التسجيل' : 'Registration error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="main-content" dir={isAr ? 'rtl' : 'ltr'} style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F8F8F6',
      padding: '20px 16px',
      fontFamily: "'IBM Plex Sans Arabic','Cairo','Inter',sans-serif",
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

      {/* Logo + Brand */}
      <div style={{ textAlign: 'center', marginBottom: 20, animation: 'authLogoIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#F8EDEF',
          border: '2px solid rgba(143,29,44,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <img src="/logo-icon.png" alt="دليلك"
            style={{ width: 50, height: 50, objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#191713', margin: 0, letterSpacing: '-0.3px' }}>
          دليلك
        </h1>
        <p style={{ fontSize: 12, color: '#918B82', marginTop: 3 }}>
          {isAr ? 'دليل المواطن اللبناني الذكي' : 'The smart Lebanese citizen guide'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 24,
        padding: '24px 22px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        animation: 'authCardIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#191713', margin: '0 0 4px', textAlign: 'center' }}>
          {isAr ? 'إنشاء حساب جديد' : 'Create a new account'}
        </h2>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{
            display: 'inline-block', fontSize: 11.5, fontWeight: 700,
            background: '#FFFBEB', color: '#78350F',
            border: '1px solid #FDE68A', borderRadius: 20, padding: '3px 12px',
          }}>
            {isAr ? 'مجاني لمدة 3 أيام' : 'Free for 3 days'}
          </span>
        </div>

        {error && (
          <div id="reg-error" role="alert" style={{
            marginBottom: 14, padding: '10px 14px',
            background: '#F8EDEF', border: '1.5px solid #FECACA',
            borderRadius: 12, color: '#8F1D2C', fontSize: 13, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div>
            <label htmlFor="reg-fullname" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>{isAr ? 'الاسم الكامل' : 'Full name'}</label>
            <input id="reg-fullname" type="text" aria-invalid={!!error} aria-describedby={error ? "reg-error" : undefined} value={form.full_name} onChange={e => update('full_name', e.target.value)}
              className="auth-input" placeholder={isAr ? 'أحمد علي' : 'John Doe'} dir="auto" />
          </div>

          <div>
            <label htmlFor="reg-username" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
              {isAr ? 'اسم المستخدم' : 'Username'} <span style={{ color: '#8F1D2C' }}>*</span>
            </label>
            <input id="reg-username" type="text" value={form.username}
              onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
              className="auth-input" placeholder="username" required minLength={3}
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label htmlFor="reg-email" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
              {isAr ? 'البريد الإلكتروني' : 'Email'} <span style={{ color: '#8F1D2C' }}>*</span>
            </label>
            <input id="reg-email" type="email" value={form.email} onChange={e => update('email', e.target.value)}
              className="auth-input" placeholder="you@example.com" required
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label htmlFor="reg-phone" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>{isAr ? 'رقم الهاتف' : 'Phone number'}</label>
            <input id="reg-phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
              className="auth-input" placeholder="+961 xx xxx xxx"
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label htmlFor="reg-password" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
              {isAr ? 'كلمة المرور' : 'Password'} <span style={{ color: '#8F1D2C' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => update('password', e.target.value)}
                className="auth-input" placeholder="min. 6 characters" required minLength={6}
                autoComplete="new-password" style={{ direction: 'ltr', textAlign: 'left', paddingLeft: 44 }} />
              <button type="button" tabIndex={-1}
                aria-label={showPass ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                onClick={() => setShowPass(s => !s)}
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
            <label htmlFor="reg-confirm" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#69645C', marginBottom: 5 }}>
              {isAr ? 'تأكيد كلمة المرور' : 'Confirm password'} <span style={{ color: '#8F1D2C' }}>*</span>
            </label>
            <input
              id="reg-confirm"
              type={showPass ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => update('confirm', e.target.value)}
              className="auth-input"
              placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
              required
              autoComplete="new-password"
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
            {loading ? (isAr ? 'جارٍ التسجيل...' : 'Registering...') : (isAr ? 'إنشاء حساب' : 'Create account')}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#918B82' }}>
          {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link href="/login" style={{ color: '#8F1D2C', fontWeight: 700, textDecoration: 'none' }}>
            {isAr ? 'سجّل الدخول' : 'Log in'}
          </Link>
        </div>
      </div>

      <p style={{ marginTop: 18, fontSize: 11, color: '#B8B2AA', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 4 9-4M3 6v12l9 4m0-12v12m0-12L12 2l9 4M21 6v12l-9 4"/></svg>
          {isAr ? 'خدمة دليلك — معلومات إرشادية لا تُغني عن المختص القانوني' : 'Dalilak service — guidance information, not a substitute for a legal professional'}
        </span>
      </p>
    </div>
  )
}