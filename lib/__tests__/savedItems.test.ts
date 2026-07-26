import { describe, it, expect, beforeEach } from 'vitest'
import { loadSavedItems, saveItem, unsaveItem, isSaved, type SavedItem } from '../savedItems'

// batch #524: lib/savedItems.ts reads/writes `localStorage` directly, which
// doesn't exist in Vitest's default `node` test environment (adding jsdom
// just for one small module isn't worth a new dependency neither installed
// nor verifiable in this session's sandbox -- see UX_AUDIT.md batch #522).
// A minimal in-memory stand-in implementing the 3 methods this module
// actually calls (getItem/setItem) is enough and needs zero extra packages.
function makeMockLocalStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => store.clear(),
  }
}

const baseItem = (id: string): Omit<SavedItem, 'savedAt'> => ({
  id, type: 'procedure', icon: '📄', titleAr: 'عنوان', titleEn: 'Title', subtitleAr: '', subtitleEn: '',
})

beforeEach(() => {
  // @ts-expect-error -- test-only global stand-in, see comment above
  globalThis.localStorage = makeMockLocalStorage()
})

describe('loadSavedItems', () => {
  it('returns an empty array when nothing has been saved yet', () => {
    expect(loadSavedItems()).toEqual([])
  })

  it('returns an empty array (not a throw) if the stored value is corrupted JSON', () => {
    localStorage.setItem('dalilak_saved_items', '{not valid json')
    expect(loadSavedItems()).toEqual([])
  })
})

describe('saveItem', () => {
  it('saves a new item and it becomes loadable', () => {
    saveItem(baseItem('a'))
    const items = loadSavedItems()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('a')
    expect(typeof items[0].savedAt).toBe('number')
  })

  it('does not create a duplicate entry when the same id is saved twice', () => {
    saveItem(baseItem('a'))
    saveItem(baseItem('a'))
    expect(loadSavedItems()).toHaveLength(1)
  })

  it('caps the list at 30 items, keeping the most recently saved', () => {
    for (let i = 0; i < 35; i++) saveItem(baseItem(`id${i}`))
    const items = loadSavedItems()
    expect(items).toHaveLength(30)
    expect(items[0].id).toBe('id34') // most recent first
    expect(items[29].id).toBe('id5') // oldest 5 (id0-id4) dropped
  })
})

describe('unsaveItem', () => {
  it('removes exactly the targeted item and leaves the rest', () => {
    saveItem(baseItem('a'))
    saveItem(baseItem('b'))
    unsaveItem('a')
    const items = loadSavedItems()
    expect(items.map(i => i.id)).toEqual(['b'])
  })
})

describe('isSaved', () => {
  it('reflects current saved state accurately', () => {
    saveItem(baseItem('a'))
    expect(isSaved('a')).toBe(true)
    expect(isSaved('missing')).toBe(false)
    unsaveItem('a')
    expect(isSaved('a')).toBe(false)
  })
})
