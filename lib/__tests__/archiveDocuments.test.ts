import { describe, it, expect } from 'vitest'
import { findArchiveDocByTitle, ARCHIVE_DOCS } from '../archiveDocuments'

// These tests import the real archive dataset (5,234 real government
// documents, see lib/archiveDocuments.ts header) -- no mock data, per this
// project's standing rule against mock data. findArchiveDocByTitle is what
// powers the "real download link" feature in chat responses (batch #497)
// and the related-documents strip on procedure pages (batch #518), so a
// silent regression here would quietly break real download links sitewide.

describe('ARCHIVE_DOCS (sanity check on the real dataset)', () => {
  it('loads the full real archive (5,234 documents, per the file header)', () => {
    expect(ARCHIVE_DOCS.length).toBe(5234)
  })

  it('every document has a non-empty title and a real pdfUrl', () => {
    // Spot-check rather than iterating all 5,234 -- this is a sanity check,
    // not a full-dataset validator.
    for (const d of ARCHIVE_DOCS.slice(0, 50)) {
      expect(d.title.length).toBeGreaterThan(0)
      expect(d.pdfUrl.length).toBeGreaterThan(0)
    }
  })
})

describe('findArchiveDocByTitle', () => {
  const REAL_TITLE = ARCHIVE_DOCS[0].title // 'Ministry of Economy and Trade — metrology-1952 (1952)'

  it('returns undefined for an empty or whitespace-only title', () => {
    expect(findArchiveDocByTitle('')).toBeUndefined()
    expect(findArchiveDocByTitle('   ')).toBeUndefined()
  })

  it('finds an exact match on the real, unmodified title field', () => {
    const found = findArchiveDocByTitle(REAL_TITLE)
    expect(found).toBeDefined()
    expect(found!.id).toBe(ARCHIVE_DOCS[0].id)
  })

  it('returns undefined for a short (<6 char) query with no exact match', () => {
    expect(findArchiveDocByTitle('xyz')).toBeUndefined()
  })

  it('falls back to a prefix match when the query is a truncated real title', () => {
    const truncated = REAL_TITLE.slice(0, 20) // 'Ministry of Economy '
    const found = findArchiveDocByTitle(truncated)
    expect(found).toBeDefined()
    expect(found!.id).toBe(ARCHIVE_DOCS[0].id)
  })

  it('falls back to a prefix match when the query extends past the real title', () => {
    const extended = `${REAL_TITLE} plus some extra trailing text a user might type`
    const found = findArchiveDocByTitle(extended)
    expect(found).toBeDefined()
    expect(found!.id).toBe(ARCHIVE_DOCS[0].id)
  })

  it('is case-insensitive for the prefix-match fallback (not for the exact match)', () => {
    const found = findArchiveDocByTitle(REAL_TITLE.slice(0, 20).toUpperCase())
    expect(found).toBeDefined()
    expect(found!.id).toBe(ARCHIVE_DOCS[0].id)
  })

  it('returns undefined for a long but clearly nonexistent title (no invented match)', () => {
    expect(findArchiveDocByTitle('This title definitely does not exist in the archive dataset')).toBeUndefined()
  })
})
