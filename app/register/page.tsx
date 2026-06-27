'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRegister, setToken, setUser } from '@/lib/auth'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 12,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#fafafa',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

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

  function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#6b2737'
    e.currentTarget.style.background = '#fff'
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#e5e7eb'
    e.currentTarget.style.background = '#fafafa'
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
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img
            src="/logo.PNG"
            alt="دليلك AI"
            style={{ width: 110, height: 110, objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
          <h1 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 700, color: '#6b2737' }}>دليلك AI</h1>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '24px 24px 20px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#1f2937', textAlign: 'center' }}>إنشاء حساب جديد</h2>
          <p style={{ margin: '0 0 18px', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
              🎁 مجاني لمدة 3 أيام
            </span>
          </p>

          {error && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Full name */}
            <div>
              <label style={LABEL_STYLE}>الاسم الكامل</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="أحمد علي"
                dir="auto"
                style={INPUT_STYLE}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            {/* Username */}
            <div>
              <label style={LABEL_STYLE}>اسم المستخدم <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={form.username}
                onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="username"
                required
                minLength={3}
                dir="ltr"
                style={{ ...INPUT_STYLE, textAlign: 'left' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label style={LABEL_STYLE}>البريد الإلكتروني <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                dir="ltr"
                style={{ ...INPUT_STYLE, textAlign: 'left' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={LABEL_STYLE}>رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+961 xx xxx xxx"
                dir="ltr"
                style={{ ...INPUT_STYLE, textAlign: 'left' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={LABEL_STYLE}>كلمة المرور <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="min. 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ ...INPUT_STYLE, paddingRight: 40, direction: 'ltr', textAlign: 'left' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#9ca3af', padding: 0 }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={LABEL_STYLE}>تأكيد كلمة المرور <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  placeholder="repeat password"
                  required
                  autoComplete="new-password"
                  style={{ ...INPUT_STYLE, paddingRight: 40, direction: 'ltr', textAlign: 'left' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 6, padding: '13px', background: loading ? '#9ca3af' : '#6b2737', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p style={{ margin: '14px 0 0', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
            بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
          <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            لديك حساب؟{' '}
            <Link href="/login" style={{ color: '#6b2737', fontWeight: 700, textDecoration: 'none' }}>
              سجّل الدخول
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
