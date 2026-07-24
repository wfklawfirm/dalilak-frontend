'use client'

/**
 * AccessibilityEffects — applies the user's saved accessibility preferences
 * (high contrast / large text / reduce motion) to <html> on every page load.
 *
 * Renders nothing. This is the fix for a regression introduced when
 * AccessibilityBar's floating FAB was removed from the global floating-
 * button stack (UX_AUDIT.md): AccessibilityBar used to be the only thing
 * that read localStorage and toggled these classes on mount, and it did so
 * unconditionally on every route because it lived in the root layout. Once
 * it stopped being rendered, nobody applied the stored preference on a
 * fresh page load anywhere except /settings (which has its own copy of
 * this same logic, but only runs while /settings itself is mounted).
 *
 * This component restores that "always applied, on every page" behavior
 * without reintroducing a floating button — it has no visible output at
 * all, just the effect. The actual CSS rules for .dalilak-high-contrast /
 * .dalilak-large-text / .dalilak-reduce-motion live in globals.css (also
 * moved there in the same fix, for the same reason).
 *
 * Toggling itself still happens from /settings (the only UI for these
 * three preferences now — see UX_AUDIT.md's floating-button consolidation).
 */

import { useEffect } from 'react'

const LS_HC = 'dalilak_a11y_hc'
const LS_LT = 'dalilak_a11y_lt'
const LS_RM = 'dalilak_a11y_rm'

function applyStoredPreferences() {
  try {
    const html = document.documentElement
    html.classList.toggle('dalilak-high-contrast', localStorage.getItem(LS_HC) === '1')
    html.classList.toggle('dalilak-large-text', localStorage.getItem(LS_LT) === '1')
    html.classList.toggle('dalilak-reduce-motion', localStorage.getItem(LS_RM) === '1')
  } catch {}
}

export default function AccessibilityEffects() {
  useEffect(() => {
    applyStoredPreferences()
    // Keep in sync if the user toggles a preference on /settings in
    // another tab, or if any future surface dispatches this event.
    window.addEventListener('storage', applyStoredPreferences)
    window.addEventListener('dalilak_saved_change', applyStoredPreferences)
    return () => {
      window.removeEventListener('storage', applyStoredPreferences)
      window.removeEventListener('dalilak_saved_change', applyStoredPreferences)
    }
  }, [])

  return null
}
