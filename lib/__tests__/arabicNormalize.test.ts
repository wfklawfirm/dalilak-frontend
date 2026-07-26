import { describe, it, expect } from 'vitest'
import { normalizeAr, normalizeForSearch, matchesAr, filterByQuery } from '../arabicNormalize'

describe('normalizeAr', () => {
  it('returns empty string for empty/falsy input', () => {
    expect(normalizeAr('')).toBe('')
  })

  it('strips tashkeel (diacritics)', () => {
    // "مَرْحَبًا" with full diacritics should normalize to bare "مرحبا"
    expect(normalizeAr('مَرْحَبًا')).toBe('مرحبا')
  })

  it('does NOT strip Arabic-Indic digits (regression: historical bug)', () => {
    // Documented bug (see arabicNormalize.ts comment): the tashkeel regex
    // range once accidentally extended one code point too far and also
    // swallowed U+0660-U+0669 (Arabic-Indic digits 0-9), silently turning
    // any query typed in Eastern Arabic numerals into an empty string that
    // matched everything. Real data (lib/lifeJourneys.ts) uses these digits,
    // e.g. "٤ إجراءات — ٣٠ يوماً" -- guard against this regressing.
    // Digits themselves survive; other normalization (إ->ا, ء removed) still
    // applies as usual, so this is not a byte-for-byte passthrough -- the
    // regression this guards against is the digits being wiped to ''.
    expect(normalizeAr('٤ إجراءات')).toBe('٤ اجراات')
    expect(normalizeAr('٣٠ يوماً')).not.toBe('')
    expect(normalizeAr('٣٠ يوماً')).toContain('٣٠')
  })

  it('normalizes alef variants to bare alef', () => {
    expect(normalizeAr('أحمد')).toBe('احمد')
    expect(normalizeAr('إحسان')).toBe('احسان')
    expect(normalizeAr('آمال')).toBe('امال')
  })

  it('normalizes teh marbuta, hamza-carrying letters, and tatweel', () => {
    expect(normalizeAr('مدرسة')).toBe('مدرسه')
    expect(normalizeAr('سؤال')).toBe('سوال')
    expect(normalizeAr('مسؤول')).toBe('مسوول')
    expect(normalizeAr('بيئة')).toBe('بييه') // ئ -> ي, ة -> ه
    expect(normalizeAr('شيء')).toBe('شي')
    expect(normalizeAr('طـويل')).toBe('طويل')
  })

  it('collapses repeated whitespace and trims', () => {
    expect(normalizeAr('  مرحبا   بالعالم  ')).toBe('مرحبا بالعالم')
  })

  it('leaves Latin text untouched aside from whitespace', () => {
    expect(normalizeAr('  Hello   World  ')).toBe('Hello World')
  })
})

describe('normalizeForSearch', () => {
  it('lowercases Latin text after normalizing', () => {
    expect(normalizeForSearch('Ministry OF Economy')).toBe('ministry of economy')
  })
})

describe('matchesAr', () => {
  it('returns true for an empty/whitespace-only needle (no filter applied)', () => {
    expect(matchesAr('أي نص', '')).toBe(true)
    expect(matchesAr('أي نص', '   ')).toBe(true)
  })

  it('matches regardless of diacritics or alef variant differences', () => {
    expect(matchesAr('أحمد الأمين', 'احمد الامين')).toBe(true)
  })

  it('is case-insensitive for Latin text', () => {
    expect(matchesAr('Ministry of Justice', 'JUSTICE')).toBe(true)
  })

  it('returns false when the needle is not contained', () => {
    expect(matchesAr('وزارة الاقتصاد', 'الصحة')).toBe(false)
  })
})

describe('filterByQuery', () => {
  const items = [
    { name: 'جواز السفر', name_en: 'Passport' },
    { name: 'رخصة القيادة', name_en: 'Driving License' },
    { name: 'الهوية الشخصية', name_en: 'National ID' },
  ]

  it('returns all items unchanged when query is empty', () => {
    expect(filterByQuery(items, '', it => [it.name, it.name_en])).toEqual(items)
  })

  it('filters by any matching field, normalization-insensitive', () => {
    const result = filterByQuery(items, 'جواز', it => [it.name, it.name_en])
    expect(result).toEqual([items[0]])
  })

  it('matches the English field too', () => {
    const result = filterByQuery(items, 'license', it => [it.name, it.name_en])
    expect(result).toEqual([items[1]])
  })

  it('returns an empty array when nothing matches', () => {
    expect(filterByQuery(items, 'xyz-nonexistent', it => [it.name, it.name_en])).toEqual([])
  })
})
