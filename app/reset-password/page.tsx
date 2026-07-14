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
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 