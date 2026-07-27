'use client'

/**
 * ChatEmojiReactions — emoji reaction bar on assistant messages.
 *
 * LS key: dalilak_reaction_{contentHash}  → emoji string
 * Props: { content: string; isAr: boolean }
 *
 * Shows 4 reaction buttons. Selected one is highlighted.
 * Selecting the same emoji again clears it.
 *
 * batch #547: previously keyed by `msgId`, which the only caller
 * (app/page.tsx) passed as `String(i)` — the message's position in the
 * live `messages` render array. That array is reused across sessions:
 * "New chat" resets it to [], and ChatHistoryPanel's restore feature
 * (up to 5 saved sessions) replaces it wholesale — so every conversation's
 * 3rd assistant reply, 5th reply, etc. shared the same `dalilak_reaction_2`
 * / `dalilak_reaction_4` key. Reacting in one chat could make an unrelated
 * chat (new or restored) appear pre-reacted at the same position, and
 * toggling it there would silently overwrite the original chat's reaction.
 * Sibling controls in the same row (ChatPinButton, ChatVoicePlayback,
 * ChatSaveToNotes) already key off the message's actual text, not its
 * position — switched this component to match: derive a stable key from
 * the message content itself (a short hash) instead of array index.
 */

import React, { useState, useEffect, useCallback } from 'react'

const EMOJIS = ['👍', '❤️', '💡', '🙏']

interface Props {
  content: string
  isAr: boolean
}

// Small stable string hash (djb2) — content-derived, not position-derived.
function hashContent(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

function lsKey(content: string) { return `dalilak_reaction_${hashContent(content)}` }

export default function ChatEmojiReactions({ content, isAr }: Props) {
  const [mounted, setMounted]     = useState(false)
  const [selected, setSelected]   = useState<string>('')
  const [flash, setFlash]         = useState<string>('')

  useEffect(() => {
    setMounted(true)
    try { setSelected(localStorage.getItem(lsKey(content)) ?? '') } catch {}
  }, [content])

  const pick = useCallback((emoji: string) => {
    const next = selected === emoji ? '' : emoji
    setSelected(next)
    try { next ? localStorage.setItem(lsKey(content), next) : localStorage.removeItem(lsKey(content)) } catch {}
    if (next) { setFlash(emoji); setTimeout(() => setFlash(''), 400) }
  }, [selected, content])

  if (!mounted) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ display: 'flex', gap: 2, alignItems: 'center' }}
      title={isAr ? 'أضف تفاعلاً' : 'React'}
    >
      {EMOJIS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => pick(e)}
          style={{
            background: selected === e ? '#FEF3C7' : 'transparent',
            border: selected === e ? '1px solid #F59E0B' : '1px solid transparent',
            borderRadius: 8,
            padding: '2px 5px',
            fontSize: 14,
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'all 0.15s',
            transform: flash === e ? 'scale(1.4)' : 'scale(1)',
            outline: 'none',
          }}
          aria-pressed={selected === e}
          aria-label={e}
        >
          {e}
        </button>
      ))}
    </div>
  )
}
