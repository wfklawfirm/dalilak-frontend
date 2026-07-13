'use client'

import { MissingDocument } from '@/lib/types'

interface RequiredDoc {
  title: string
  required: boolean
  notes?: string
}

interface Props {
  missingDocs: MissingDocument[]
  requiredDocs?: RequiredDoc[]
  uploadedDocIds?: string[]
  onUpload?: (docTitle: string) => void
  lang?: 'ar' | 'en'
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-gray-100 text-gray-600 border-gray-200',
}

const PRIORITY_AR: Record<string, string> = {
  critical: 'حرج',
  high:     'عالي',
  medium:   'متوسط',
  low:      'منخفض',
}

export default function MissingDocumentsChecklist({
  missingDocs,
  requiredDocs = [],
  uploadedDocIds = [],
  onUpload,
}: Props) {
  // Merge: requiredDocs list + missing docs status
  const missingMap = new Map(missingDocs.map((d) => [d.title, d]))

  const allDocs: Array<{ title: string; required: boolean; notes?: string; missing?: MissingDocument }> =
    requiredDocs.length > 0
      ? requiredDocs.map((rd) => ({ ...rd, missing: missingMap.get(rd.title) }))
      : missingDocs.map((d) => ({ title: d.title, required: d.required, missing: d }))

  const total = allDocs.length
  const uploaded = allDocs.filter((d) => !d.missing || d.missing.status === 'uploaded').length

  if (total === 0) {
    return (
      <div dir="rtl" className="text-center py-6 text-gray-400 text-sm">
        لا توجد وثائق مطلوبة
      </div>
    )
  }

  return (
    <div dir="rtl" className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          {uploaded} من {total} وثائق مكتملة
        </p>
        <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-[#6b2737] transition-all duration-500"
            style={{ width: `${total > 0 ? Math.round((uploaded / total) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {allDocs.map((doc, i) => {
          const isMissing = doc.missing && doc.missing.status !== 'uploaded'
          const isUploaded = !isMissing

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${isUploaded ? 'bg-green-50/40' : 'bg-white'}`}
            >
              {/* Status icon */}
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${isUploaded
                    ? 'bg-green-500 text-white'
                    : doc.missing?.status === 'needs_review'
                    ? 'bg-yellow-400 text-white'
                    : 'bg-red-500 text-white'
                  }`}
              >
                {isUploaded ? '✓' : doc.missing?.status === 'needs_review' ? '!' : '✕'}
              </span>

              {/* Title + details */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isUploaded ? 'text-gray-700' : 'text-gray-900'}`}>
                  {doc.title}
                  {doc.required && !isUploaded && (
                    <span className="mr-1 text-red-500 text-xs">*</span>
                  )}
                </p>
                {doc.missing?.reason && !isUploaded && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.missing.reason}</p>
                )}
                {doc.notes && (
                  <p className="text-xs text-gray-400 mt-0.5">{doc.notes}</p>
                )}
              </div>

              {/* Priority badge + upload button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isMissing && doc.missing?.priority && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      ${PRIORITY_BADGE[doc.missing.priority] || PRIORITY_BADGE.low}`}
                  >
                    {PRIORITY_AR[doc.missing.priority] || doc.missing.priority}
                  </span>
                )}
                {isMissing && onUpload && (
                  <button
                    onClick={() => onUpload(doc.title)}
                    className="text-xs bg-[#6b2737] text-white px-3 py-1 rounded-lg hover:bg-[#5a1f2e] transition-colors"
                  >
                    رفع
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        القائمة أولية — تأكد من المصادر الرسمية قبل تقديم الطلب
      </p>
    </div>
  )
}
