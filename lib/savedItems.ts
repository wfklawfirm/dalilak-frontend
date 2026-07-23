/**
 * Dalilak — Saved Items (Bookmarks)
 * localStorage-persisted bookmark system.
 * Key: `dalilak_saved_items`
 */

export interface SavedItem {
  id: string
  type: 'procedure' | 'enriched' | 'service' | 'journey' | 'faq'
  icon: string
  titleAr: string
  titleEn: string
  subtitleAr: string
  subtitleEn: string
  /** AI prompt to pre-fill on click */
  aiPrompt?: string
  /** Page href to navigate to (fallback) */
  href?: string
  savedAt: number  // Date.now()
}

const LS_KEY = 'dalilak_saved_items'

export function loadSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as SavedItem[]) : []
  } catch {
    return []
  }
}

export function saveItem(item: Omit<SavedItem, 'savedAt'>): void {
  const items = loadSavedItems()
  const exists = items.some(i => i.id === item.id)
  if (exists) return
  const updated = [{ ...item, savedAt: Date.now() }, ...items].slice(0, 30) // cap at 30
  try { localStorage.setItem(LS_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
}

export function unsaveItem(id: string): void {
  const items = loadSavedItems().filter(i => i.id !== id)
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}

export function isSaved(id: string): boolean {
  return loadSavedItems().some(i => i.id === id)
}

// ── Recently Viewed ───────────────────────────────────────────────────────────
const RECENT_KEY = 'dalilak_recently_viewed'
const RECENT_MAX = 8

export type RecentItem = Omit<SavedItem, 'savedAt'> & { viewedAt: number }

export function loadRecentItems(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentItem[]) : []
  } catch {
    return []
  }
}

export function trackView(item: Omit<SavedItem, 'savedAt'>): void {
  const items = loadRecentItems().filter(i => i.id !== item.id) // dedupe
  const updated = [{ ...item, viewedAt: Date.now() }, ...items].slice(0, RECENT_MAX)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('dalilak_recent_change'))
  } catch { /* ignore */ }
}
