'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { apiRegister, setToken, setUser } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '', full_name: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="دليلك AI" width={130} height={130} className="mb-1 drop-shadow-lg" style={{objectFit:'contain'}} />
          <h1 className="text-2xl font-bold text-[#6b2737]">دليلك AI</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">إنشاء حساب جديد</h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              🎁 مجاني لمدة 3 أيام
            </span>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-right"
                placeholder="أحمد علي"
              />
            </div>

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
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                placeholder="+961 xx xxx xxx"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-right"
                placeholder="6 أحرف على الأقل"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => update('confirm', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-right"
                placeholder="أعد كلمة المرور"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
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
