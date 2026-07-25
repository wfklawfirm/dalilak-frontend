'use client'

/**
 * useFocusTrap — keeps keyboard Tab/Shift+Tab focus cycling inside an open
 * modal/dialog/sheet instead of leaking out to the page content behind it.
 *
 * WCAG 2.4.3 (Focus Order) gap found in batch #360's keyboard tab-order
 * audit: every role="dialog" component in this app (13 found — GlobalSearch,
 * MobileMenu, ServiceGroupSheet, MobileModeSheet, GuidedFlow, TransactionStarter,
 * ProcedureSearchModal, ProcedureFilterDrawer, PrintProcedureModal,
 * EscalationModal, DocumentIntelligenceView, AccessibilityBar,
 * FloatingHelpButton) already handles Escape-to-close and body-scroll-lock,
 * but none of them trap Tab — a keyboard user can Tab straight out of the
 * open dialog into background page elements hidden behind the overlay.
 *
 * Usage:
 *   const dialogRef = useRef<HTMLDivElement>(null)
 *   useFocusTrap(dialogRef, isOpen)
 *   <div ref={dialogRef} role="dialog"> ... </div>
 *
 * On open: moves focus to the first focusable element inside the container
 * (if nothing inside is already focused) and restores focus to whatever
 * was focused before the dialog opened, once it closes.
 * On Tab at the last focusable element: wraps to the first.
 * On Shift+Tab at the first: wraps to the last.
 */

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // If focus isn't already inside the dialog (e.g. a search input that
    // auto-focuses itself), move it to the first focusable element.
    if (!container.contains(document.activeElement)) {
      const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      first?.focus()
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetParent !== null) // skip hidden elements
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const activeEl = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (activeEl === last || !container.contains(activeEl)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Restore focus to whatever triggered the dialog, if it still exists.
      previouslyFocused.current?.focus?.()
    }
  }, [active, containerRef])
}
