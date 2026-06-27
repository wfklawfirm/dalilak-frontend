'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearToken, isAdmin, type User } from '@/lib/auth'
import { getProcedureBySlug } from '@/lib/procedures'
import type { SavedProcedure, SavedChecklist, FeedbackEntry } from '@/lib/types'

const LS_QA = 'dalilak_qa_cache'
const LS_SAVED_PROCS = 'dalilak_saved_procedures'
const LS_CHECKLISTS = 'dalilak_checklists'

interface QAEntry { q: string; a: string; ts: number }

type Tab = 'procedures' | 'checklists' | 'history' | 'account'

export default function MyFilesPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [tab, setTab] = useState<Tab>('procedures')
  const [user, setUser] = useState<User | null>(null)
  const [history, setHistory] = useState<QAEntry[]>([])
  const [savedProcs, setSavedProcs] = useState<SavedProcedure[]>([])
  const [checklists, setChecklists] = useState<SavedChecklist[]>([])
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isAr = lang === 'ar'

  useEffect(() => {
    setUser(getUser())
    try {
      const raw = localStorage.getItem(LS_QA)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
    try {
      const raw = localStorage.getItem(LS_SAVED_PROCS)
      if (raw) setSavedProcs(JSON.parse(raw))
    } catch {}
    try {
      const raw = localStorage.getItem(LS_CHECKLISTS)
      if (raw) setChecklists(JSON.parse(raw))
    } catch {}
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(LS_QA)
    setHistory([])
  }

  const removeProc = (id: string) => {
    const updated = savedProcs.filter(p => p.id !== id)
    setSavedProcs(updated)
    localStorage.setItem(LS_SAVED_PROCS, JSON.stringify(updated))
  }

  const removeChecklist = (id: string) => {
    const updated = checklists.filter(c => c.id !== id)
    setChecklists(updated)
    localStorage.setItem(LS_CHECKLISTS, JSON.stringify(updated))
  }

  const clearAllData = () => {
    localStorage.removeItem(LS_QA)
    localStorage.removeItem(LS_SAVED_PROCS)
    localStorage.removeItem(LS_CHECKLISTS)
    setHistory([])
    setSavedProcs([])
    setChecklists([])
    setShowDeleteConfirm(false)
  }

  const logout = () => { clearToken(); router.push('/login') }

  const timeAgo = (ts: number) => {
    const d = Date.now() - ts
    if (d < 60000) return isAr ? 'للتو' : 'Just now'
    if (d < 3600000) return `${Math.floor(d / 60000)} ${isAr ? 'د' : 'm'}`
    if (d < 86400000) return `${Math.floor(d / 3600000)} ${isAr ? 'س' : 'h'}`
    return `${Math.floor(d / 86400000)} ${isAr ? 'يوم' : 'd'}`
  }

  const planLabel = (plan?: string) => {
    if (plan === 'paid') return { label: isAr ? 'بروفيشنال' : 'Pro', color: '#B8860B', bg: '#FFFBEB' }
    if (plan === 'admin') return { label: isAr ? 'إداري' : 'Admin', color: '#6D28D9', bg: '#F5F3FF' }
    return { label: isAr ? 'مجاني' : 'Free', color: '#6B7280', bg: '#F5F5F5' }
  }

  const TABS: { key: Tab; icon: string; ar: string; en: string; count?: number }[] = [
    { key: 'procedures', icon: '📋', ar: 'معاملاتي', en: 'Procedures', count: savedProcs.length },
    { key: 'checklists', icon: '✅', ar: 'قوائمي', en: 'Checklists', count: checklists.length },
    { key: 'history', icon: '💬', ar: 'السجل', en: 'History', count: history.length },
    { key: 'account', icon: '👤', ar: 'الحساب', en: 'Account' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'Cairo','Inter',sans-serif" }} dir={isAr ? 'rtl' : 'ltr'}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)', padding: '14px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {isAr ? '🗂️ مساحتي' : '🗂️ My Workspace'}
              </h1>
              {user && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10.5, margin: 0 }}>{user.username}</p>}
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #EAE4D9', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 4px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2.5px solid #8B1A1A' : '2.5px solid transparent', color: tab === t.key ? '#8B1A1A' : '#9C8E80', fontSize: 11.5, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'color 0.15s', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span>{isAr ? t.ar : t.en}</span>
              {t.count !== undefined && t.count > 0 && (
                <span style={{ fontSize: 9, background: tab === t.key ? '#8B1A1A' : '#EAE4D9', color: tab === t.key ? '#fff' : '#6B7280', borderRadius: 10, padding: '0 5px' }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* ── Saved Procedures ── */}
        {tab === 'procedures' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: 0 }}>{isAr ? 'المعاملات المحفوظة' : 'Saved Procedures'}</h2>
              <button onClick={() => router.push('/procedures')} style={{ padding: '6px 14px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 11, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
                + {isAr ? 'تصفح الدليل' : 'Browse'}
              </button>
            </div>
            {savedProcs.length === 0 ? (
              <EmptyState icon="📋" ar="لا توجد معاملات محفوظة بعد" en="No saved procedures yet" isAr={isAr} action={() => router.push('/procedures')} actionLabel={isAr ? 'تصفح الدليل' : 'Browse Directory'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedProcs.map(proc => {
                  const detail = getProcedureBySlug(proc.slug)
                  return (
                    <div key={proc.id} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>{isAr ? proc.title_ar : proc.title_en}</p>
                        <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>{timeAgo(proc.savedAt)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => router.push(`/procedures/${proc.slug}`)} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#8B1A1A', border: 'none', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                          {isAr ? 'فتح' : 'Open'}
                        </button>
                        <button onClick={() => removeProc(proc.id)} style={{ padding: '6px 8px', background: '#F5F5F5', color: '#9C8E80', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Saved Checklists ── */}
        {tab === 'checklists' && (
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: '0 0 14px' }}>{isAr ? 'قوائم المستندات المحفوظة' : 'Saved Checklists'}</h2>
            {checklists.length === 0 ? (
              <EmptyState icon="✅" ar="لا توجد قوائم محفوظة بعد" en="No saved checklists yet" isAr={isAr} action={() => router.push('/')} actionLabel={isAr ? 'ابدأ محادثة' : 'Start a chat'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checklists.map(cl => (
                  <div key={cl.id} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', cursor: 'pointer' }} onClick={() => setExpandedChecklist(expandedChecklist === cl.id ? null : cl.id)}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', margin: '0 0 2px' }}>{cl.procedureTitle}</p>
                        <p style={{ fontSize: 10.5, color: '#9C8E80', margin: 0 }}>{timeAgo(cl.savedAt)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: '#9C8E80' }}>{expandedChecklist === cl.id ? '▲' : '▼'}</span>
                        <button onClick={e => { e.stopPropagation(); removeChecklist(cl.id) }} style={{ padding: '4px 8px', background: '#F5F5F5', color: '#9C8E80', border: 'none', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                    {expandedChecklist === cl.id && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F0EBE0' }}>
                        <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 12, color: '#4A4035', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{cl.content}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Chat History ── */}
        {tab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: 0 }}>{isAr ? 'سجل المحادثات' : 'Chat History'}</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#8B1A1A', border: '1px solid #FECACA', borderRadius: 10, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                  🗑️ {isAr ? 'مسح الكل' : 'Clear all'}
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <EmptyState icon="💬" ar="لا توجد محادثات محفوظة بعد" en="No chat history yet" isAr={isAr} action={() => router.push('/')} actionLabel={isAr ? 'ابدأ محادثة' : 'Start chatting'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.slice().reverse().map((entry, i) => (
                  <div key={i} style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 14, padding: '12px 14px', cursor: 'pointer' }} onClick={() => router.push(`/?q=${encodeURIComponent(entry.q)}`)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#1A1208', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>❓ {entry.q}</p>
                        <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entry.a}</p>
                      </div>
                      <span style={{ fontSize: 10, color: '#9C8E80', flexShrink: 0, marginTop: 2 }}>{timeAgo(entry.ts)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Account ── */}
        {tab === 'account' && (
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: '0 0 14px' }}>{isAr ? 'إعدادات الحساب' : 'Account Settings'}</h2>

            {/* User info card */}
            {user && (
              <div style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, padding: '16px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #6B1313)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', flexShrink: 0 }}>
                    {user.username?.charAt(0)?.toUpperCase() || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#1A1208', margin: '0 0 2px' }}>{user.username}</p>
                    {user.email && <p style={{ fontSize: 11.5, color: '#6B7280', margin: '0 0 6px' }}>{user.email}</p>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(() => { const p = planLabel(user.plan); return <span style={{ fontSize: 10.5, fontWeight: 700, color: p.color, background: p.bg, borderRadius: 8, padding: '2px 8px' }}>{p.label}</span> })()}
                      {user.trial_expires_at && <span style={{ fontSize: 10.5, color: '#6B7280', background: '#F5F5F5', borderRadius: 8, padding: '2px 8px' }}>{isAr ? 'تجريبي' : 'Trial'}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage stats */}
            <div style={{ background: '#fff', border: '1.5px solid #EAE4D9', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isAr ? 'البيانات المحلية' : 'Local Data'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '📋', label: isAr ? 'معاملات محفوظة' : 'Saved procedures', count: savedProcs.length },
                  { icon: '✅', label: isAr ? 'قوائم مستندات' : 'Saved checklists', count: checklists.length },
                  { icon: '💬', label: isAr ? 'سجل المحادثات' : 'Chat history', count: history.length },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#4A4035' }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.count > 0 ? '#8B1A1A' : '#9C8E80' }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isAdmin() && (
                <button onClick={() => router.push('/admin')} style={{ width: '100%', padding: '12px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: isAr ? 'right' : 'left' }}>
                  ⚙️ {isAr ? 'لوحة الإدارة' : 'Admin Dashboard'}
                </button>
              )}

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '12px 16px', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: isAr ? 'right' : 'left' }}>
                  🗑️ {isAr ? 'حذف جميع البيانات المحلية' : 'Delete all local data'}
                </button>
              ) : (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14, padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, margin: '0 0 10px' }}>{isAr ? 'هل أنت متأكد؟ لا يمكن التراجع.' : 'Are you sure? This cannot be undone.'}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={clearAllData} style={{ flex: 1, padding: '8px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {isAr ? 'نعم، احذف كل شيء' : 'Yes, delete all'}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '8px', background: '#fff', color: '#6B7280', border: '1px solid #EAE4D9', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              <button onClick={logout} style={{ width: '100%', padding: '12px 16px', background: '#fff', color: '#6B7280', border: '1.5px solid #EAE4D9', borderRadius: 14, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: isAr ? 'right' : 'left' }}>
                🚪 {isAr ? 'تسجيل الخروج' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, ar, en, isAr, action, actionLabel }: { icon: string; ar: string; en: string; isAr: boolean; action: () => void; actionLabel: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 14, color: '#9C8E80', margin: '0 0 16px' }}>{isAr ? ar : en}</p>
      <button onClick={action} style={{ padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: 14, fontSize: 13, fontFamily: "'Cairo','Inter',sans-serif", fontWeight: 700, cursor: 'pointer' }}>
        {actionLabel}
      </button>
    </div>
  )
}
