'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiLogin, setToken, setUser } from '@/lib/auth'
import { useLanguage } from '@/lib/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { isAr } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(username.trim(), password)
      setToken(data.token)
      setUser(data.user)
      router.push('/')
    } catch (err) {
      setError((err instanceof Error ? err.message : (isAr ? 'خطأ في تسجيل الدخول' : 'Login error')))
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
          width: 100%; padding: 13px 16px;
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
      <div style={{ textAlign: 'center', marginBottom: 28, animation: 'authLogoIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', backdropFilter: 'blur(8px)',
        }}>
          <img src="/logo.PNG" alt="دليلك"
            style={{ width: 56, height: 56, objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
          دليلك
        </h1>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
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
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A1208', margin: '0 0 20px', textAlign: 'center' }}>
          {isAr ? 'تسجيل الدخول' : 'Login'}
        </h2>

        {error && (
          <div id="login-error" role="alert" style={{
            marginBottom: 16, padding: '10px 14px',
            background: '#FEF2F2', border: '1.5px solid #FECACA',
            borderRadius: 12, color: '#8B1A1A', fontSize: 13, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label htmlFor="login-username" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#5C4A3A', marginBottom: 6 }}>
              {isAr ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or email'}
            </label>
            <input
              id="login-username"
              type="text"
              aria-describedby={error ? "login-error" : undefined}
              aria-invalid={!!error}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="auth-input"
              placeholder={isAr ? 'اسم المستخدم أو البريد' : 'Username or email'}
              required
              autoFocus
              autoComplete="username"
              dir="auto"
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#5C4A3A', marginBottom: 6 }}>
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ direction: 'ltr', textAlign: 'left', paddingLeft: 44 }}
              />
              <button type="button" tabIndex={-1}
                aria-label={showPass ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9C8E80', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}>
                {showPass
                  ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                }
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link href="/forgot-password" style={{ fontSize: 12.5, color: '#8B1A1A', textDecoration: 'none', fontWeight: 600 }}>
              {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? (isAr ? 'جاري الدخول...' : 'Logging in...') : (isAr ? 'دخول' : 'Login')}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9C8E80' }}>
          {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <Link href="/register" style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none' }}>
            {isAr ? 'سجّل الآن — مجاناً لـ 3 أيام' : 'Register now — free for 3 days'}
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        {isAr ? 'دليلك — معلومات إرشادية لا تُغني عن المختص القانوني' : 'Dalilak — guidance information, not a substitute for a legal professional'}
      </p>
    </div>
  )
}
