'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, isAdmin } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com'

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string[] }> = {
  draft:     { label: 'مسودة',    color: 'bg-gray-100 text-gray-700',   next: ['review'] },
  review:    { label: 'مراجعة',   color: 'bg-yellow-100 text-yellow-700', next: ['approved', 'draft'] },
  approved:  { label: 'معتمد',    color: 'bg-blue-100 text-blue-700',   next: ['published', 'review'] },
  published: { label: 'منشور',    color: 'bg-green-100 text-green-700', next: ['expired'] },
  expired:   { label: 'منتهي',    color: 'bg-red-100 text-red-700',     next: [] },
}

const TRANSITION_LABELS: Record<string, string> = {
  review:    '→ إرسال للمراجعة',
  approved:  '→ اعتماد',
  draft:     '→ إرجاع للمسودة',
  published: '→ نشر',
  expired:   '→ تحديد كمنتهي',
}

interface ContentItem {
  id: string
  title_ar: string
  body_ar: string
  content_type: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
  published_at?: string
}

interface AuditEntry {
  ts: string
  action: string
  item_id: string
  actor: string
  before: string | null
  after: string | null
  note: string
}

export default function ContentGovernancePage() {
  const router = useRouter()
  const [items, setItems] = useState<ContentItem[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<ContentItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [creating, setCreating] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [newItem, setNewItem] = useState({ title_ar: '', body_ar: '', content_type: 'procedure_update' })
  const [transitionNote, setTransitionNote] = useState('')

  const authHeaders = useCallback(() => {
    const token = getToken()
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, [])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin')
      return
    }
    loadItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  const loadItems = async () => {
    setLoading(true)
    try {
      const url = filterStatus === 'all'
        ? `${API_URL}/admin/content`
        : `${API_URL}/admin/content?status=${filterStatus}`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadAudit = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/audit-log?limit=50`, { headers: authHeaders() })
      const data = await res.json()
      setAuditLog(data.entries || [])
    } catch (e) {
      console.error(e)
    }
  }

  const createItem = async () => {
    if (!newItem.title_ar.trim() || !newItem.body_ar.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${API_URL}/admin/content`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        setShowCreate(false)
        setNewItem({ title_ar: '', body_ar: '', content_type: 'procedure_update' })
        loadItems()
      }
    } finally {
      setCreating(false)
    }
  }

  const transition = async (item: ContentItem, target: string) => {
    setTransitioning(true)
    try {
      const res = await fetch(`${API_URL}/admin/content/${item.id}/transition`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ target_status: target, note: transitionNote }),
      })
      if (res.ok) {
        const updated = { ...item, status: target }
        setItems(ps => ps.map(i => i.id === item.id ? updated : i))
        setSelected(updated as ContentItem)
        setTransitionNote('')
        loadItems()
      }
    } finally {
      setTransitioning(false)
    }
  }

  const filteredItems = filterStatus === 'all'
    ? items
    : items.filter(i => i.status === filterStatus)

  const statusCounts = items.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">← لوحة التحكم</Link>
            <h1 className="text-xl font-bold text-gray-900">إدارة المحتوى</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAudit(!showAudit); if (!showAudit) loadAudit() }}
              className="text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              📋 سجل التغييرات
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              + إنشاء محتوى جديد
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Pipeline overview */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                filterStatus === status
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-100 bg-white hover:shadow-sm'
              }`}
            >
              <div className={`text-xs px-2 py-1 rounded-full mb-2 inline-block font-medium ${cfg.color}`}>
                {cfg.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</div>
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className={`grid gap-4 ${selected ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* List */}
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500">لا يوجد محتوى {filterStatus !== 'all' ? `في حالة "${STATUS_CONFIG[filterStatus]?.label}"` : 'بعد'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    className={`w-full text-right p-4 rounded-xl border-2 bg-white transition-all ${
                      selected?.id === item.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CONFIG[item.status]?.color || 'bg-gray-100'}`}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.updated_at).toLocaleDateString('ar-LB')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title_ar}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.body_ar}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>👤 {item.created_by}</span>
                      <span>•</span>
                      <span>{item.content_type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-6">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${STATUS_CONFIG[selected.status]?.color}`}>
                    {STATUS_CONFIG[selected.status]?.label}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{selected.title_ar}</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{selected.body_ar}</p>
                <div className="mt-3 text-xs text-gray-400 space-y-1">
                  <div>📅 أُنشئ: {new Date(selected.created_at).toLocaleString('ar-LB')}</div>
                  <div>✏️ آخر تعديل: {new Date(selected.updated_at).toLocaleString('ar-LB')}</div>
                  {selected.published_at && (
                    <div>🌐 نُشر: {new Date(selected.published_at).toLocaleString('ar-LB')}</div>
                  )}
                </div>
              </div>

              {/* Transitions */}
              {STATUS_CONFIG[selected.status]?.next.length > 0 && (
                <div className="p-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">تغيير الحالة</h3>
                  <textarea
                    className="w-full p-3 rounded-lg border border-gray-200 text-sm resize-none mb-3 focus:outline-none focus:border-blue-400"
                    rows={2}
                    placeholder="ملاحظة (اختياري)..."
                    value={transitionNote}
                    onChange={e => setTransitionNote(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {STATUS_CONFIG[selected.status].next.map(target => (
                      <button
                        key={target}
                        onClick={() => transition(selected, target)}
                        disabled={transitioning}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                          target === 'published'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : target === 'approved'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : target === 'draft'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {transitioning ? '...' : TRANSITION_LABELS[target] || target}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow visualization */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-1 text-xs">
                  {['draft', 'review', 'approved', 'published', 'expired'].map((s, i) => (
                    <React.Fragment key={s}>
                      <span className={`px-2 py-1 rounded-full ${
                        s === selected.status
                          ? STATUS_CONFIG[s].color + ' font-bold ring-2 ring-offset-1 ring-blue-400'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {STATUS_CONFIG[s].label}
                      </span>
                      {i < 4 && <span className="text-gray-300">›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit log drawer */}
        {showAudit && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">سجل التغييرات</h2>
              <button onClick={() => setShowAudit(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="divide-y divide-gray-50">
              {auditLog.length === 0 ? (
                <div className="p-5 text-center text-gray-400">لا توجد سجلات بعد</div>
              ) : auditLog.map((entry, i) => (
                <div key={i} className="p-4 flex items-start gap-4">
                  <div className={`text-xs px-2 py-1 rounded font-mono font-bold whitespace-nowrap ${
                    entry.action === 'CREATE' ? 'bg-green-100 text-green-700'
                    : entry.action === 'TRANSITION' ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {entry.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{entry.actor}</span>
                      {entry.before && entry.after && (
                        <span className="text-gray-500">
                          {STATUS_CONFIG[entry.before]?.label || entry.before} → {STATUS_CONFIG[entry.after]?.label || entry.after}
                        </span>
                      )}
                      <span className="font-mono text-xs text-gray-400">{entry.item_id.slice(0, 8)}</span>
                    </div>
                    {entry.note && <p className="text-xs text-gray-500 mt-1">{entry.note}</p>}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(entry.ts).toLocaleString('ar-LB')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">إنشاء محتوى جديد</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={newItem.title_ar}
                  onChange={e => setNewItem(p => ({ ...p, title_ar: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400"
                  placeholder="عنوان المحتوى..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المحتوى</label>
                <select
                  value={newItem.content_type}
                  onChange={e => setNewItem(p => ({ ...p, content_type: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400"
                >
                  <option value="procedure_update">تحديث إجراء</option>
                  <option value="announcement">إعلان</option>
                  <option value="guideline">تعليمات</option>
                  <option value="correction">تصحيح</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                <textarea
                  value={newItem.body_ar}
                  onChange={e => setNewItem(p => ({ ...p, body_ar: e.target.value }))}
                  rows={5}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="اكتب المحتوى هنا..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={createItem}
                disabled={creating || !newItem.title_ar.trim() || !newItem.body_ar.trim()}
                className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
              >
                {creating ? 'جارٍ الإنشاء...' : 'إنشاء كمسودة'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
