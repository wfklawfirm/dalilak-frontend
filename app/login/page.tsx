'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiLogin, setToken, setUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
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
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        .auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
        }
        .auth-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
        }
        .auth-logo img {
          width: 100px;
          height: 100px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .auth-logo h1 {
          margin: 10px 0 4px;
          font-size: 24px;
          font-weight: 700;
          color: #6b2737;
        }
        .auth-logo p {
          margin: 0;
          font-size: 13px;
          color: #9ca3af;
        }
        .auth-box {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 20px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
          padding: 28px 24px;
        }
        .auth-box h2 {
          margin: 0 0 22px;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          text-align: center;
        }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .field label { font-size: 13px; font-weight: 600; color: #374151; }
        .field input {
          width: 100%;
          padding: 13px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          background: #fafafa;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }
        .field input:focus { border-color: #6b2737; background: #fff; }
        .pass-wrap { position: relative; }
        .pass-wrap input { padding-right: 44px; }
        .pass-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 17px;
          color: #9ca3af;
          padding: 0;
          line-height: 1;
        }
        .auth-error {
          margin-bottom: 16px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #b91c1c;
          font-size: 13px;
          text-align: center;
        }
        .auth-submit {
          width: 100%;
          padding: 14px;
          background: #6b2737;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.15s;
          -webkit-appearance: none;
        }
        .auth-submit:hover:not(:disabled) { background: #5a2030; }
        .auth-submit:disabled { background: #d1d5db; cursor: not-allowed; }
        .auth-link { margin: 6px 0 0; font-size: 13px; color: #6b2737; text-align: left; }
        .auth-link a { color: #6b2737; text-decoration: none; }
        .auth-footer { margin-top: 18px; text-align: center; font-size: 13px; color: #6b7280; }
        .auth-footer a { color: #6b2737; font-weight: 700; text-decoration: none; }
        @media (min-width: 640px) {
          .auth-logo img { width: 120px; height: 120px; }
          .auth-logo h1 { font-size: 26px; }
          .auth-box { padding: 36px 32px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">

          <div className="auth-logo">
            <img src="/logo.PNG" alt="دليلك AI" />
            <h1>دليلك AI</h1>
            <p>دليل المواطن اللبناني الذكي</p>
          </div>

          <div className="auth-box">
            <h2>تسجيل الدخول</h2>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>اسم المستخدم أو البريد الإلكتروني</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="اسم المستخدم أو البريد"
                  required
                  autoFocus
                  dir="auto"
                />
              </div>

              <div className="field">
                <label>كلمة المرور</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="auth-link">
                <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>

            <div className="auth-footer">
              ليس لديك حساب؟{' '}
              <Link href="/register">سجّل الآن — مجاناً لـ 3 أيام</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
