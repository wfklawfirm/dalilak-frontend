'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRegister, setToken, setUser } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '', full_name: '', phone: ''
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
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
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
    } catch (err: any) {
      setError(err.message || 'خطأ في التسجيل')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: #fff; }
        .reg-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #fff;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px 16px 32px;
        }
        .reg-card {
          width: 100%;
          max-width: 420px;
          padding-top: 8px;
        }
        .reg-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        .reg-logo img {
          width: 90px;
          height: 90px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .reg-logo h1 {
          margin: 8px 0 0;
          font-size: 22px;
          font-weight: 700;
          color: #6b2737;
        }
        .reg-box {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 20px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.06);
          padding: 24px 20px 20px;
        }
        .reg-box h2 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          text-align: center;
        }
        .reg-badge {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .reg-badge span {
          background: #dcfce7;
          color: #16a34a;
          padding: 3px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .reg-error {
          margin-bottom: 14px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #b91c1c;
          font-size: 13px;
          text-align: center;
        }
        .reg-form { display: flex; flex-direction: column; gap: 12px; }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
        }
        .field input {
          width: 100%;
          padding: 12px 14px;
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
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #9ca3af;
          padding: 0;
          line-height: 1;
        }
        .reg-submit {
          width: 100%;
          padding: 14px;
          background: #6b2737;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.15s;
          -webkit-appearance: none;
        }
        .reg-submit:hover:not(:disabled) { background: #5a2030; }
        .reg-submit:disabled { background: #d1d5db; cursor: not-allowed; }
        .reg-terms {
          margin: 10px 0 0;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
        .reg-footer {
          margin-top: 12px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }
        .reg-footer a { color: #6b2737; font-weight: 700; text-decoration: none; }
        @media (min-width: 640px) {
          .reg-page { align-items: center; padding: 32px 16px; }
          .reg-logo img { width: 110px; height: 110px; }
          .reg-logo h1 { font-size: 24px; }
          .reg-box { padding: 28px 28px 24px; }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card">

          <div className="reg-logo">
            <img src="/logo.PNG" alt="دليلك AI" />
            <h1>دليلك AI</h1>
          </div>

          <div className="reg-box">
            <h2>إنشاء حساب جديد</h2>
            <div className="reg-badge"><span>🎁 مجاني لمدة 3 أيام</span></div>

            {error && <div className="reg-error">{error}</div>}

            <form onSubmit={handleSubmit} className="reg-form">

              <div className="field">
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  placeholder="أحمد علي"
                  dir="auto"
                />
              </div>

              <div className="field">
                <label>اسم المستخدم <span style={{color:'#ef4444'}}>*</span></label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="username"
                  required
                  minLength={3}
                  dir="ltr"
                  style={{textAlign:'left'}}
                />
              </div>

              <div className="field">
                <label>البريد الإلكتروني <span style={{color:'#ef4444'}}>*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                  dir="ltr"
                  style={{textAlign:'left'}}
                />
              </div>

              <div className="field">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+961 xx xxx xxx"
                  dir="ltr"
                  style={{textAlign:'left'}}
                />
              </div>

              <div className="field">
                <label>كلمة المرور <span style={{color:'#ef4444'}}>*</span></label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="min. 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{direction:'ltr', textAlign:'left'}}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>تأكيد كلمة المرور <span style={{color:'#ef4444'}}>*</span></label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    placeholder="repeat password"
                    required
                    autoComplete="new-password"
                    style={{direction:'ltr', textAlign:'left'}}
                  />
                </div>
              </div>

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
              </button>
            </form>

            <p className="reg-terms">بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية</p>
            <div className="reg-footer">
              لديك حساب؟ <Link href="/login">سجّل الدخول</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
