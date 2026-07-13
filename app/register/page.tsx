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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.PNG" alt="دليلك AI" width={120} height={120}
            className="mb-2" style={{ objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <h1 className="text-2xl font-bold text-[#6b2737]">دليلك AI</h1>
          <p className="text-sm text-gray-500 mt-1">دليل المواطن اللبناني الذكي</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">إنشاء حساب جديد</h2>
          <div className="flex justify-center mb-5">
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              🎁 مجاني لمدة 3 أيام
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="أحمد علي"
                dir="auto"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="username"
                required
                minLength={3}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="you@example.com"
                required
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="+961 xx xxx xxx"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                  placeholder="min. 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{ direction: 'ltr', textAlign: 'left', paddingRight: 44 }}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 0 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                  placeholder="repeat password"
                  required
                  autoComplete="new-password"
                  style={{ direction: 'ltr', textAlign: 'left', paddingRight: 44 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-400">
            بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            لديك حساب؟{' '}
            <Link href="/login" className="text-[#6b2737] font-semibold hover:underline">
              سجّل الدخول
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
