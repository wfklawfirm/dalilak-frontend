'use client'

import { useState } from 'react'
import { RiskLevel } from '@/lib/types'

interface Props {
  riskLevel?: RiskLevel
  confidenceLevel?: 'high' | 'medium' | 'low' | 'unknown'
  context?: string
  transactionId?: string
  documentId?: string
  alwaysShow?: boolean
  onRequest?: (data: { type: string; summary: string; urgency: string }) => void
  lang?: 'ar' | 'en'
}

const RISK_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3, unknown: 0 }
const CONF_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1, unknown: 0 }

export default function HumanReviewCTA({
  riskLevel = 'unknown',
  confidenceLevel = 'unknown',
  context,
  alwaysShow = false,
  onRequest,
}: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('legal')
  const [summary, setSummary] = useState(context || '')
  const [urgency, setUrgency] = useState('normal')
  const [submitted, setSubmitted] = useState(false)

  // Show if risk >= high OR confidence <= low, or alwaysShow
  const shouldShow =
    alwaysShow ||
    RISK_ORDER[riskLevel] >= RISK_ORDER.high ||
    CONF_ORDER[confidenceLevel] <= CONF_ORDER.low

  if (!shouldShow) return null

  const handleSubmit = () => {
    if (!summary.trim()) return
    onRequest?.({ type, summary, urgency })
    setSubmitted(true)
    setOpen(false)
  }

  if (submitted) {
    return (
      <div dir="rtl" className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-semibold text-sm">تم إرسال طلب المراجعة</p>
        <p className="text-green-600 text-xs mt-1">سيتواصل معك أحد المختصين قريباً</p>
      </div>
    )
  }

  return (
    <div dir="rtl" className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
      {/* CTA Header */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
          !
        </span>
        <div className="flex-1">
          <p className="font-semibold text-orange-900 text-sm">هل تحتاج مراجعة قانونية؟</p>
          <p className="text-orange-700 text-xs mt-0.5 leading-relaxed">
            {riskLevel === 'critical'
              ? 'هذه المعاملة تنطوي على مخاطر حرجة — يُلزم مراجعة محامٍ أو مختص قبل المضي.'
              : 'المعاملة تنطوي على تعقيدات — يُنصح بمراجعة محامٍ أو مختص لضمان صحة الإجراءات.'}
          </p>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          اطلب مراجعة بشرية
        </button>
      ) : (
        <div className="space-y-3 pt-2 border-t border-orange-200">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">نوع المراجعة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#6b2737]"
            >
              <option value="legal">استشارة قانونية</option>
              <option value="administrative">مراجعة إدارية</option>
              <option value="urgent">طارئة — أحتاج مساعدة فورية</option>
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">وصف الحالة</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="اشرح بإيجاز ما تحتاج المساعدة فيه..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:border-[#6b2737]"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">الأولوية</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#6b2737]"
            >
              <option value="normal">عادي</option>
              <option value="urgent">عاجل</option>
              <option value="very_urgent">عاجل جداً</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!summary.trim()}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              إرسال الطلب
            </button>
            <button
              onClick={() => setOpen(false)}
              className="py-2 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
