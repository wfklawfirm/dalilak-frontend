'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { apiForgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiForgotPassword(email.trim())
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'خطأ — حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.PNG" alt="دليلك AI" width={130} height={130} className="mb-2" style={{objectFit:'contain', mixBlendMode:'multiply'}} />
          <h1 className="text-2xl font-bold text-[#6b2737]">دليلك AI</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">تم إرسال الطلب</h2>
              <p className="text-gray-600 text-sm mb-6">
                إذا كان بريدك مسجّلاً، سيتواصل معك فريق الدعم خلال 24 ساعة برمز الاستعادة.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                يمكنك أيضاً التواصل معنا مباشرةً عبر WhatsApp أو البريد الإلكتروني.
              </p>
              <Link
                href="/login"
                className="block w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold text-center hover:bg-[#5a2030] transition-colors"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">استعادة كلمة المرور</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                أدخل بريدك الإلكتروني وسنرسل لك رمز الاستعادة
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b2737]/30 focus:border-[#6b2737]"
                    placeholder="you@example.com"
                    required
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#6b2737] text-white rounded-xl font-semibold hover:bg-[#5a2030] transition-colors disabled:opacity-60"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رمز الاستعادة'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#6b2737] hover:underline">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Reset with code */}
        <div className="mt-4 text-center text-sm text-gray-500">
          لديك رمز الاستعادة بالفعل؟{' '}
          <Link href="/reset-password" className="text-[#6b2737] font-semibold hover:underline">
            أدخله هنا
          </Link>
        </div>
      </div>
    </div>
  )
}
