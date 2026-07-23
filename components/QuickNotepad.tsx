'use client'

/**
 * QuickNotepad — scratch notepad for current browser session.
 * Persists in sessionStorage key `dalilak_notepad`.
 * Has copy-to-clipboard, clear, and collapsible header.
 * Appears in homepage empty state.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

const SS_KEY = 'dalilak_notepad'

export default function QuickNotepad() {
  const { isAr } = useLanguage()
  const [text, setText] = useState('')
  const [collapsed, setCollapsed] = useState(true)
  const [copied, setCopied] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // Load from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SS_KEY)
      if (saved) {
        setText(saved)
        setCollapsed(false) // auto-expand if content exists
      }
    } catch {}
  }, [])

  const handleChange = useCallback((val: string) => {
    setText(val)
    try { sessionStorage.setItem(SS_KEY, val) } catch {}
  }, [])

  const copyAll = async () => {
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  const clear = () => {
    setText('')
    try { sessionStorage.removeItem(SS_KEY) } catch {}
  }

  const toggle = () => {
    setCollapsed(c => !c)
    if (collapsed) {
      setTimeout(() => taRef.current?.focus(), 50)
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        animation: 'fadeUp 0.22s ease both',
      }}
    >
      {/* Header */}
      <div
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {isAr ? 'مفكرة سريعة' : 'Quick Notes'}
          </span>
          {text.trim() && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-4)',
              background: 'var(--surface-muted)', borderRadius: 99,
              padding: '1px 7px', border: '1px solid var(--border)',
            }}>
              {wordCount} {isAr ? 'كلمة' : 'words'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {text.trim() && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); copyAll() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: copied ? 'var(--success)' : 'var(--text-4)',
                  padding: '2px 6px', borderRadius: 5,
                  fontWeight: 600,
                }}
              >
                {copied ? (isAr ? '✓ نُسخ' : '✓ Copied') : (isAr ? 'نسخ' : 'Copy')}
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); clear() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--text-4)',
                  padding: '2px 6px', borderRadius: 5,
                }}
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
            </>
          )}
          <span style={{
            fontSize: 10, color: 'var(--text-4)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s', display: 'inline-block',
          }}>▾</span>
        </div>
      </div>

      {/* Notepad */}
      {!collapsed && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px 12px' }}>
          <textarea
            ref={taRef}
            dir={isAr ? 'rtl' : 'ltr'}
            value={text}
            onChange={e => handleChange(e.target.value)}
            placeholder={isAr
              ? 'سجّل ملاحظاتك هنا... (تُحفظ تلقائياً للجلسة الحالية)'
              : 'Jot your notes here... (auto-saved for this session)'}
            rows={4}
            style={{
              width: '100%', resize: 'vertical', minHeight: 80,
              padding: '9px 11px', border: '1px solid var(--border)',
              borderRadius: 9, fontSize: 12.5, lineHeight: 1.7,
              color: 'var(--text-1)', background: 'var(--bg)',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{
            marginTop: 5, fontSize: 10, color: 'var(--text-4)',
            textAlign: isAr ? 'left' : 'right',
          }}>
            {isAr
              ? 'تُحذف تلقائياً عند إغلاق التبويب'
              : 'Cleared automatically when you close this tab'}
          </div>
        </div>
      )}
    </div>
  )
}
