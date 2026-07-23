/**
 * arabicNormalize — Arabic text normalization for search and matching.
 *
 * Handles:
 *   - Tashkeel (diacritics) removal
 *   - Alef variants: أ إ آ ٱ → ا
 *   - Teh marbuta: ة → ه
 *   - Waw with hamza: ؤ → و
 *   - Yeh variants: ى → ي , ئ → ي
 *   - Hamza: ء → (removed)
 *   - Tatweel (kashida): ـ → (removed)
 *   - Whitespace normalization
 *
 * Usage:
 *   import { normalizeAr, matchesAr } from '@/lib/arabicNormalize'
 *   const results = list.filter(item => matchesAr(item.titleAr, query))
 */

/** Remove all tashkeel (Arabic diacritics / harakat) */
function removeTashkeel(text: string): string {
  // Unicode range U+064B–U+065F covers all standard Arabic diacritics
  return text.replace(/[ً-ٰٟ]/g, '')
}

/** Normalize alef variants to bare alef (ا) */
function normalizeAlef(text: string): string {
  return text
    .replace(/[آأإٱ]/g, 'ا') // آ أ إ ٱ → ا
}

/** Normalize other letter variants */
function normalizeLetters(text: string): string {
  return text
    .replace(/ة/g, 'ه')  // ة → ه
    .replace(/ؤ/g, 'و')  // ؤ → و
    .replace(/ئ/g, 'ي')  // ئ → ي
    .replace(/ى/g, 'ي')  // ى → ي
    .replace(/ء/g, '')        // ء → remove
    .replace(/ـ/g, '')        // ـ tatweel → remove
}

/**
 * Full normalization pipeline for Arabic text.
 * Safe to call on mixed Arabic/English strings — only Arabic characters are affected.
 */
export function normalizeAr(text: string): string {
  if (!text) return ''
  let result = text
  result = removeTashkeel(result)
  result = normalizeAlef(result)
  result = normalizeLetters(result)
  result = result.replace(/\s+/g, ' ').trim()
  return result
}

/**
 * Normalize and lowercase for case-insensitive search.
 * Works for both Arabic and English strings.
 */
export function normalizeForSearch(text: string): string {
  return normalizeAr(text).toLowerCase()
}

/**
 * Returns true if `haystack` contains `needle` after normalization.
 * Case-insensitive for Latin, diacritic-insensitive for Arabic.
 */
export function matchesAr(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true
  const normalizedHaystack = normalizeForSearch(haystack)
  const normalizedNeedle = normalizeForSearch(needle)
  return normalizedHaystack.includes(normalizedNeedle)
}

/**
 * Filter an array of strings that match a query after normalization.
 */
export function filterByQuery<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items
  const norm = normalizeForSearch(query)
  return items.filter(item =>
    getFields(item).some(field => normalizeForSearch(field).includes(norm))
  )
}
