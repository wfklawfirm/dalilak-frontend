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

// NOTE: a "Recently Viewed" subsystem (trackView/loadRecentItems, writing to
// dalilak_recently_viewed) used to live here, called from app/procedures/page.tsx
// and app/services/page.tsx on every card expand/click. Its only display
// surface, RecentlyViewedPanel.tsx, was intentionally removed as UI clutter in
// an earlier declutter pass (see push.sh's batch #386 dead-file list) — but the
// trackView() call sites were left behind, silently writing JSON to localStorage
// and firing a dalilak_recent_change event with zero listeners on every click,
// for a feature no longer visible anywhere. Removed the orphaned writer calls
// and this dead code together (batch #458) rather than reviving a widget that
// was deliberately decluttered.
