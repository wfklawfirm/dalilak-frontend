'use client'

/**
 * ProcedureNotesPanel — personal sticky notes per procedure.
 *
 * Saves notes to localStorage key: dalilak_note_{code}
 * Auto-saves on blur (or every 1s of inactivity after typing).
 * Shows character count + last-saved timestamp.
 *
 * Props:
 *   code   — procedure code (used as LS key suffix)
 *   isAr   — current language
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'

const LS_PREFIX = 'dalilak_note_'
const MAX_CHARS = 500

interface SavedNote {
  text: string
  savedAt: string // ISO
}

function loadNote(code: string): SavedNote | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + code)
    if (!raw) return null
    return JSON.parse(raw) as SavedNote
  } catch {
    return null
  }
}

function saveNote(code: string, text: string) {
  try {
    const data: SavedNote = { text, savedAt: new Date().toISOString() }
    localStorage.setItem(LS_PREFIX + code, JSON.stringify(data))
  } catch {}
}

function deleteNote(code: string) {
  try { localStorage.removeItem(LS_PREFIX + code) } catch {}
}

function formatSavedAt(iso: string, isAr: boolean): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(isAr ? 'ar-LB' : 'en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Beirut',
    })
  } catch { return '' }
}

interface Props {
  code: string
  isAr: boolean
}

export default function ProcedureNotesPanel({ code, isAr }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
    const note = loadNote(code)
    if (note) {
      setText(note.text)
      setSavedAt(note.savedAt)
    }
  }, [code])

  const persist = useCallback((value: string) => {
    if (value.trim()) {
      saveNote(code, value)
      setSavedAt(new Date().toISOString())
    } else {
      deleteNote(code)
      setSavedAt(null)
    }
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }, [code])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, MAX_CHARS)
    setText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => persist(val), 900)
  }

  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    persist(text)
  }

  function handleOpen() {
    setOpen(true)
    setTimeout(() => textareaRef.current?.focus(), 80)
  }

  const hasNote = mounted && text.trim().length > 0
  const charsLeft = MAX_CHARS - text.length

  if (!mounted) return null

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ marginBottom: 12 }}>
      {!open ? (
        /* Collapsed: show button, or note preview if note exists */
        <button
          type="button"
          onClick={handleOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            width: '100%', padding: '7px 10px', borderRadius: 9,
            background: hasNote ? '#FFFBEB' : '#F8F9FF',
            border: `1px dashed ${hasNote ? '#FDE68A' : '#BFDBFE'}`,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
          }}
        >
          <span style={{ fontSize: 14 }}>📝</span>
          <span style={{ flex: 1, fontSize: 11, color: hasNote ? '#78350F' : '#3B82F6', fontWeight: 600 }}>
            {hasNote
              ? (isAr ? `ملاحظاتي: ${text.slice(0, 50)}${text.length > 50 ? '…' : ''}` : `My note: ${text.slice(0, 50)}${text.length > 50 ? '…' : ''}`)
              : (isAr ? 'أضف ملاحظة شخصية لهذه المعاملة' : 'Add a personal note for this procedure')}
          </span>
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </button>
      ) : (
        /* Expanded: textarea */
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
          padding: '10px 12px',
          animation: 'slideDown 0.15s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <span style={{ fontSize: 13 }}>📝</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#92400E', flex: 1 }}>
              {isAr ? 'ملاحظاتي' : 'My Notes'}
            </span>
            {justSaved && (
              <span style={{ fontSize: 9.5, color: '#10b981', fontWeight: 700 }}>
                {isAr ? '✓ حُفظ' : '✓ Saved'}
              </span>
            )}
            {savedAt && !justSaved && (
              <span style={{ fontSize: 9, color: '#92400E', opacity: 0.6 }}>
                {isAr ? `آخر حفظ ${formatSavedAt(savedAt, isAr)}` : `Saved ${formatSavedAt(savedAt, isAr)}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#92400E', opacity: 0.5, fontSize: 13, padding: 0,
                display: 'flex', alignItems: 'center',
              }}
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >✕</button>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            dir={isAr ? 'rtl' : 'ltr'}
            placeholder={isAr
              ? 'اكتب ملاحظاتك هنا — تُحفظ تلقائياً...'
              : 'Write your notes here — auto-saved...'}
            rows={3}
            style={{
              width: '100%', resize: 'vertical', border: '1px solid #FDE68A',
              borderRadius: 7, padding: '7px 10px', fontSize: 12,
              fontFamily: 'inherit', background: '#fff', color: '#1C1410',
              outline: 'none', lineHeight: 1.6,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, alignItems: 'center' }}>
            <span style={{
              fontSize: 9.5, color: charsLeft < 50 ? '#EF4444' : '#92400E', opacity: 0.7,
            }}>
              {isAr ? `${charsLeft} حرف متبقي` : `${charsLeft} chars left`}
            </span>
            {text.trim() && (
              <button
                type="button"
                onClick={() => { setText(''); deleteNote(code); setSavedAt(null) }}
                style={{
                  fontSize: 9.5, color: '#EF4444', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                {isAr ? 'حذف الملاحظة' : 'Delete note'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
