'use client'

/**
 * ChatSaveToNotes — saves an AI message snippet to QuickNotepad.
 *
 * LS key: dalilak_notepad  — same key used by QuickNotepad
 * Appends a separator + first 400 chars of the message.
 *
 * Props: { text: string; isAr: boolean }
 */

import React, { useState, useCallback } from 'react'

const LS_KEY = 'dalilak_notepad'
const MAX_CHARS = 400

interface Props {
  text: string
  isAr: boolean
}

export default function ChatSaveToNotes({ text, isAr }: Props) {
  const [saved, setSaved] = useState(false)

  const save = useCallback(() => {
    try {
      const snippet  = text.trim().slice(0, MAX_CHARS) + (text.length > MAX_CHARS ? '…' : '')
      const existing = localStorage.getItem(LS_KEY) ?? ''
      const sep      = existing ? '\n\n---\n\n' : ''
      localStorage.setItem(LS_KEY, existing + sep + snippet)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }, [text])

  return (
    <button
      type="button"
      onClick={save}
      title={isAr ? 'حفظ في الملاحظات' : 'Save to notepad'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px',
        background: saved ? '#ECFDF5' : 'transparent',
        color: saved ? '#065F46' : '#6B7280',
        border: `1px solid ${saved ? '#6EE7B7' : 'transparent'}`,
        borderRadius: 7,
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s',
      }}
      aria-label={isAr ? 'حفظ في الملاحظات' : 'Save to notepad'}
    >
      {saved ? '✓' : '📝'}
      <span style={{ display: 'none' }}>
        {isAr ? 'حفظ' : 'Note'}
      </span>
    </button>
  )
}
