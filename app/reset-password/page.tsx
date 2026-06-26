'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { apiResetPassword } from '@/lib/auth'

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [token, setToken] = useState(params.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">تم تغيير كلمة المرور</h2>
        <p className="text-gray-500 text-sm mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030]"
        >
          تسجيل الدخول
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">تعيين كلمة مرور جديدة</h2>
      <p className="text-sm text-gray-500 text-center mb-6">أدخل الرمز الذي تلقّيته وكلمة المرور الجديدة</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رمز الاستعادة</label>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-center tracking-widest text-xl"
            placeholder="123456"
            required
            dir="ltr"
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-right"
            placeholder="6 أحرف على الأقل"
            required minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737] text-right"
            placeholder="أعد كلمة المرور"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] disabled:opacity-60"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-[#6b2737] hover:underline">طلب رمز جديد</Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="دليلك AI" width={130} height={130} className="mb-2 drop-shadow-lg" style={{objectFit:'contain'}} />
          <h1 className="text-2xl font-bold text-[#6b2737]">دليلك AI</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Suspense fallback={<div className="text-center text-gray-400">تحميل...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
