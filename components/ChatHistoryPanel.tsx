'use client'

/**
 * ChatHistoryPanel — saves and restores previous chat sessions.
 *
 * LS key: dalilak_chat_sessions = ChatSession[]
 * A session is saved when:
 *   - messages.length >= 3
 *   - onSave() is called (typically when starting a new chat or navigating away)
 *
 * Shows last 3 sessions as collapsible rows:
 *   date, first user message preview, message count, restore button
 *
 * onRestore(messages) — parent sets messages from saved session
 * onSave(messages)    — parent calls to persist current session
 *
 * NOTE: ChatMessage objects contain {role, content, streaming?}
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export interface SavedMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  id: string
  savedAt: string
  messageCount: number
  preview: string          // first user message, truncated
  messages: SavedMessage[]
}

export function saveChatSession(messages: SavedMessage[]) {
  if (messages.length < 3) return
  try {
    const firstUser = messages.find(m => m.role === 'user')?.content || ''
    const session: ChatSession = {
      id: `sess_${Date.now()}`,
      savedAt: new Date().toISOString(),
      messageCount: messages.length,
      preview: firstUser.slice(0, 100),
      messages: messages.slice(0, 40).map(m => ({ role: m.role, content: m.content.slice(0, 2000) })),
    }
    const existing: ChatSession[] = JSON.parse(localStorage.getItem('dalilak_chat_sessions') || '[]')
    const updated = [session, ...existing].slice(0, 5)
    localStorage.setItem('dalilak_chat_sessions', JSON.stringify(updated))
    window.dispatchEvent(new Event('dalilak_chat_sessions_change'))
  } catch {}
}

export function getChatSessions(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem('dalilak_chat_sessions') || '[]') } catch { return [] }
}

interface Props {
  onRestore: (messages: SavedMessage[]) => void
}

export default function ChatHistoryPanel({ onRestore }: Props) {
  const { isAr } = useLanguage()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted]   = useState(false)

  const refresh = useCallback(() => setSessions(getChatSessions()), [])

  useEffect(() => {
    setMounted(true)
    refresh()
    window.addEventListener('dalilak_chat_sessions_change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('dalilak_chat_sessions_change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  if (!mounted || sessions.length === 0) return null

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(isAr ? 'ar-LB' : 'en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Beirut',
      })
    } catch { return '' }
  }

  function deleteSession(id: string) {
    try {
      const updated = getChatSessions().filter(s => s.id !== id)
      localStorage.setItem('dalilak_chat_sessions', JSON.stringify(updated))
      refresh()
    } catch {}
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ background: '#fff', border: '1.5px solid #E6E2DC', borderRadius: 13, overflow: 'hidden', marginBottom: 10 }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 16 }}>🕘</span>
        <div style={{ flex: 1, textAlign: isAr ? 'right' : 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#191713' }}>
            {isAr ? 'المحادثات السابقة' : 'Previous Chats'}
          </div>
          <div style={{ fontSize: 10, color: '#918B82' }}>
            {isAr ? `${sessions.length} ${sessions.length === 1 ? 'محادثة' : 'محادثات'} محفوظة` : `${sessions.length} saved`}
          </div>
        </div>
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#918B82" strokeWidth="2.5"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #E6E2DC', padding: '8px 14px 10px' }}>
          {sessions.map(s => (
            <div key={s.id} style={{
              padding: '8px 10px', borderRadius: 10, marginBottom: 6,
              background: '#FAFAF8', border: '1px solid #F0EDE8',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#191713', lineHeight: 1.4 }}>
                    {s.preview.length > 70 ? s.preview.slice(0, 70) + '…' : s.preview || (isAr ? 'محادثة محفوظة' : 'Saved chat')}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#918B82', marginTop: 3, display: 'flex', gap: 8 }}>
                    <span>{formatDate(s.savedAt)}</span>
                    <span>·</span>
                    <span>{s.messageCount} {isAr ? 'رسالة' : 'msgs'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => onRestore(s.messages)}
                    style={{
                      fontSize: 10, fontWeight: 700, color: '#8F1D2C',
                      background: '#F8EDEF', border: '1px solid rgba(143,29,44,0.2)',
                      borderRadius: 8, padding: '3px 9px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {isAr ? 'استعادة' : 'Restore'}
                  </button>
                  <button type="button" onClick={() => deleteSession(s.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8C2BB', fontSize: 13 }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button type="button"
            onClick={() => {
              try { localStorage.removeItem('dalilak_chat_sessions') } catch {}
              refresh()
            }}
            style={{ fontSize: 10, color: '#918B82', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', marginTop: 2 }}
          >
            {isAr ? 'حذف السجل' : 'Clear history'}
          </button>
        </div>
      )}
    </div>
  )
}
