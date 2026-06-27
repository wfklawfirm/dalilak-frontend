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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.PNG" alt="دليلك AI" width={140} height={140}
            className="mb-2" style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <h1 className="text-2xl font-bold text-[#6b2737]">دليلك AI</h1>
          <p className="text-sm text-gray-500 mt-1">دليل المواطن اللبناني الذكي</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="اسم المستخدم أو البريد"
                required
                autoFocus
                dir="auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ direction: 'ltr', textAlign: 'left', paddingRight: 44 }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 0 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="text-left">
              <Link href="/forgot-password" className="text-sm text-[#6b2737] hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-[#6b2737] font-semibold hover:underline">
              سجّل الآن — مجاناً لـ 3 أيام
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
