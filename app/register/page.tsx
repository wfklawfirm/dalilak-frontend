'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiRegister, setToken, setUser } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
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

      {/* Logo + Brand */}
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
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
          دليلك
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
          دليل المواطن اللبناني الذكي
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#fff', borderRadius: 24,
        padding: '24px 22px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1A1208', margin: '0 0 4px', textAlign: 'center' }}>
          إنشاء حساب جديد
        </h2>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{
            display: 'inline-block', fontSize: 11.5, fontWeight: 700,
            background: '#F0FDF4', color: '#15803D',
            border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 12px',
          }}>
            مجاني لمدة 3 أيام
          </span>
        </div>

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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>الاسم الكامل</label>
            <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
              className="auth-input" placeholder="أحمد علي" dir="auto" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
              اسم المستخدم <span style={{ color: '#8B1A1A' }}>*</span>
            </label>
            <input type="text" value={form.username}
              onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
              className="auth-input" placeholder="username" required minLength={3}
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
              البريد الإلكتروني <span style={{ color: '#8B1A1A' }}>*</span>
            </label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              className="auth-input" placeholder="you@example.com" required
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>رقم الهاتف</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
              className="auth-input" placeholder="+961 xx xxx xxx"
              dir="ltr" style={{ textAlign: 'left' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5C4A3A', marginBottom: 5 }}>
              كلمة المرور <span style={{ color: '#8B1A1A' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => update('password', e.target.value)}
                className="auth-input" placeholder="min. 6 characters" required minLength={6}
                autoComplete="new-password" style={{ direction: 'ltr', textAlign: 'left', paddingLeft: 44 }} />
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
              value={form.confirm}
              onChange={e => update('confirm', e.target.value)}
              className="auth-input"
              placeholder="أعد كتابة كلمة المرور"
              required
              autoComplete="new-password"
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
            {loading ? 'جارٍ التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#9C8E80' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/login" style={{ color: '#8B1A1A', fontWeight: 700, textDecoration: 'none' }}>
            سجّل الدخول
          </Link>
        </div>
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