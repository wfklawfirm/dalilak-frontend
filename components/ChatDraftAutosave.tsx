'use client'

/**
 * ChatDraftAutosave — invisible helper that persists whatever the user is
 * currently typing in the chat input so it survives an accidental refresh
 * or tab close. Restores the draft once on mount (only if the input is
 * still empty at that point, so it never clobbers text already there),
 * and keeps localStorage in sync as the user types. Clears itself once
 * the draft is sent (input becomes empty again after the initial restore).
 *
 * LS key: dalilak_chat_input_draft
 * Props: { input: string; setInput: (v: string) => void }
 */

import { useEffect, useState } from 'react'

const LS_KEY = 'dalilak_chat_input_draft'

interface Props {
  input: string
  setInput: (v: string) => void
}

export default function ChatDraftAutosave({ input, setInput }: Props) {
  const [hydrated, setHydrated] = useState(false)

  // Restore once on mount, only if the input box is currently empty.
  // Only flips `hydrated` on a later commit, so the sync effect below
  // never fires in the same tick and can't clobber the restored draft.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved && !input.trim()) setInput(saved)
    } catch {}
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep localStorage in sync as the user types (after hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      if (input.trim()) localStorage.setItem(LS_KEY, input)
      else localStorage.removeItem(LS_KEY)
    } catch {}
  }, [input, hydrated])

  return null
}
