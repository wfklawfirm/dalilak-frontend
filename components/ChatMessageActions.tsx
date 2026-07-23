'use client'

/**
 * ChatMessageActions — compact action bar shown below an assistant message.
 *
 * Actions:
 *   📋 Copy     — copies message text to clipboard
 *   📤 Share    — opens WhatsApp with the message text
 *   🔖 Bookmark — saves snippet to dalilak_bookmarks (localStorage)
 *
 * LS key: dalilak_bookmarks = JSON array of BookmarkEntry
 *
 * Usage inside the messages map:
 *   {msg.role === 'assistant' && !msg.streaming && (
 *     <ChatMessageActions text={msg.content} isAr={isAr} />
 *   )}
 */

import React, { useState, useCallback } from 'react'

export interface BookmarkEntry {
  id: string
  text: string
  savedAt: string
}

export function getBookmarks(): BookmarkEntry[] {
  try {
    return JSON.parse(localStorage.getItem('dalilak_bookmarks') || '[]')
  } catch { return [] }
}

export function addBookmark(text: string): BookmarkEntry {
  const entry: BookmarkEntry = {
    id: `bm_${Date.now()}`,
    text: text.slice(0, 800),
    savedAt: new Date().toISOString(),
  }
  try {
    const existing = getBookmarks()
    // Deduplicate by first 60 chars
    if (!existing.some(b => b.text.slice(0, 60) === entry.text.slice(0, 60))) {
      localStorage.setItem('dalilak_bookmarks', JSON.stringify([entry, ...existing].slice(0, 20)))
      window.dispatchEvent(new Event('dalilak_bookmarks_change'))
    }
  } catch {}
  return entry
}

export function removeBookmark(id: string) {
  try {
    const updated = getBookmarks().filter(b => b.id !== id)
    localStorage.setItem('dalilak_bookmarks', JSON.stringify(updated))
    window.dispatchEvent(new Event('dalilak_bookmarks_change'))
  } catch {}
}

interface Props {
  text: string
  isAr: boolean
}

type ActionState = 'idle' | 'copied' | 'bookmarked'

export default function ChatMessageActions({ text, isAr }: Props) {
  const [state, setState] = useState<ActionState>('idle')
  const plainText = text.replace(/\*\*/g, '').replace(/#{1,3} /g, '').trim()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainText)
      setState('copied')
      setTimeout(() => setState('idle'), 1800)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = plainText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setState('copied')
      setTimeout(() => setState('idle'), 1800)
    }
  }, [plainText])

  const handleShare = useCallback(() => {
    const excerpt = plainText.slice(0, 600)
    const msg = `${isAr ? '📋 من دليلك:' : '📋 From Dalilak:'}\n\n${excerpt}${plainText.length > 600 ? '...' : ''}\n\nhttps://dalilak-frontend.vercel.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }, [plainText, isAr])

  const handleBookmark = useCallback(() => {
    addBookmark(plainText)
    setState('bookmarked')
    setTimeout(() => setState('idle'), 1800)
  }, [plainText])

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 12,
    background: active ? '#F8EDEF' : 'transparent',
    border: `1px solid ${active ? 'rgba(143,29,44,0.25)' : 'transparent'}`,
    color: active ? '#8F1D2C' : '#918B82',
    fontSize: 10, fontWeight: active ? 700 : 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  })

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', gap: 2, marginTop: 4,
        opacity: 0.72,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.72' }}
    >
      {/* Copy */}
      <button
        type="button"
        onClick={handleCopy}
        style={btnStyle(state === 'copied')}
        title={isAr ? 'نسخ' : 'Copy'}
        onMouseEnter={e => { if (state !== 'copied') { (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F3'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E6E2DC' } }}
        onMouseLeave={e => { if (state !== 'copied') { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' } }}
      >
        {state === 'copied' ? (
          <>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {isAr ? 'تم النسخ' : 'Copied'}
          </>
        ) : (
          <>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            {isAr ? 'نسخ' : 'Copy'}
          </>
        )}
      </button>

      {/* Share */}
      <button
        type="button"
        onClick={handleShare}
        style={btnStyle(false)}
        title={isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F3'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E6E2DC' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' }}
      >
        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a11.7 11.7 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
        {isAr ? 'مشاركة' : 'Share'}
      </button>

      {/* Bookmark */}
      <button
        type="button"
        onClick={handleBookmark}
        style={btnStyle(state === 'bookmarked')}
        title={isAr ? 'حفظ الرد' : 'Bookmark'}
        onMouseEnter={e => { if (state !== 'bookmarked') { (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F3'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E6E2DC' } }}
        onMouseLeave={e => { if (state !== 'bookmarked') { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent' } }}
      >
        {state === 'bookmarked' ? (
          <>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            {isAr ? 'محفوظ' : 'Saved'}
          </>
        ) : (
          <>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>
            {isAr ? 'حفظ' : 'Save'}
          </>
        )}
      </button>
    </div>
  )
}
