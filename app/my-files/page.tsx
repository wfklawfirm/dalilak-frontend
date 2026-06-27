'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearToken, isAdmin, type User } from '@/lib/auth'

const LS_KEY = 'dalilak_qa_cache'
interface QAEntry { q: string; a: string; ts: number }

export default function MyFilesPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [user, setUser] = useState<User | null>(null)
  const [history, setHistory] = useState<QAEntry[]>([])
  const isAr = lang === 'ar'

  useEffect(() => {
    setUser(getUser())
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(LS_KEY)
    setHistory([])
  }

  const openConversation = (q: string) => {
    router.push(`/?q=${encodeURIComponent(q)}`)
  }

  const logout = () => { clearToken(); router.push('/login') }

  const timeAgo = (ts: number) => {
    const d = Date.now() - ts
    if (d < 60000) return isAr ? 'للتو' : 'Just now'
    if (d < 3600000) return `${Math.floor(d / 60000)} ${isAr ? 'د' : 'm'}`
    if (d < 86400000) return `${Math.floor(d / 3600000)} ${isAr ? 'س' : 'h'}`
    return `${Math.floor(d / 86400000)} ${isAr ? 'يوم' : 'd'}`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Cairo', 'Inter', sans-serif" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #EAE4D9; }`}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #7a1a1a 0%, #8B1A1A 60%, #7a1a1a 100%)',
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
            fontSize: 12, fontFamily: 'inherit',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
          <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
            {isAr ? 'حسابي' : 'My Account'}
          </h1>
          <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')} style={{
            background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#fff', borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
            fontSize: 11, fontFamily: 'inherit', fontWeight: 700,
          }}>
            {isAr ? 'EN' : 'AR'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 100px' }}>

        {/* User Card */}
        {user && (
          <div style={{
            background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1313 100%)',
            borderRadius: 18, padding: '20px', marginBottom: 20, color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                👤
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{user.username}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{user.email}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: user.plan === 'paid' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)',
                    border: `1px solid ${user.plan === 'paid' ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.4)'}`,
                    color: user.plan === 'paid' ? '#6EE7B7' : '#FDE68A',
                    borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                  }}>
                    {user.plan === 'paid' ? (isAr ? '✨ مشترك' : '✨ Paid') : (isAr ? '⏱️ تجريبي' : '⏱️ Trial')}
                  </span>
                  {isAdmin() && (
                    <span style={{
                      background: 'rgba(245,200,66,0.2)', border: '1px solid rgba(245,200,66,0.4)',
                      color: '#f5c842', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                    }}>🛡️ Admin</span>
                  )}
                  {user.plan === 'trial' && user.days_left !== undefined && (
                    <span style={{
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#FCA5A5', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 600,
                    }}>
                      {user.days_left} {isAr ? 'أيام متبقية' : 'days left'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '🏠', label_ar: 'الصفحة الرئيسية', label_en: 'Home', action: () => router.push('/') },
            { icon: '📋', label_ar: 'المعاملات', label_en: 'Procedures', action: () => router.push('/procedures') },
            { icon: '📄', label_ar: 'النماذج', label_en: 'Forms', action: () => router.push('/forms') },
            { icon: '🛡️', label_ar: 'لوحة الإدارة', label_en: 'Admin Panel', action: () => router.push('/admin'), adminOnly: true },
          ].filter(a => !a.adminOnly || isAdmin()).map((a, i) => (
            <button key={i} onClick={a.action} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 14, border: '1.5px solid #EAE4D9',
              background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(139,26,26,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1208' }}>{isAr ? a.label_ar : a.label_en}</span>
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1208', margin: 0 }}>
              {isAr ? `سجل المحادثات (${history.length})` : `Chat History (${history.length})`}
            </h2>
            {history.length > 0 && (
              <button onClick={clearHistory} style={{
                fontSize: 11, color: '#dc2626', background: '#FEF2F2',
                border: '1px solid #FECACA', borderRadius: 20, padding: '4px 10px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {isAr ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9C8E80' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 12 }}>
                {isAr ? 'لا توجد محادثات محفوظة بعد' : 'No saved conversations yet'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((entry, i) => (
                <button key={i} onClick={() => openConversation(entry.q)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', borderRadius: 14,
                  background: '#fff', border: '1.5px solid #EAE4D9',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: isAr ? 'right' : 'left',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B1A1A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EAE4D9' }}
                onTouchStart={e => { e.currentTarget.style.background = '#FEF2F2' }}
                onTouchEnd={e => { e.currentTarget.style.background = '#fff' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%)',
                    border: '1px solid rgba(139,26,26,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>💬</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: 600, color: '#1A1208',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.q.replace(/^\[.*?\] /, '').slice(0, 70)}
                    </div>
                    <div style={{ fontSize: 10, color: '#9C8E80', marginTop: 3 }}>
                      {timeAgo(entry.ts)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: '#FEF2F2', border: '1.5px solid #FECACA',
          color: '#dc2626', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit', marginTop: 8,
        }}>
          {isAr ? '⬅️ تسجيل الخروج' : '⬅️ Logout'}
        </button>
      </div>
    </div>
  )
}
