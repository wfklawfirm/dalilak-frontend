import { describe, it, expect } from 'vitest'
import { buildBreadcrumbJsonLd, SITE_URL } from '../breadcrumbJsonLd'

describe('buildBreadcrumbJsonLd', () => {
  it('builds a valid schema.org BreadcrumbList with 1-based positions', () => {
    const result = buildBreadcrumbJsonLd([
      { name: 'الرئيسية', url: SITE_URL },
      { name: 'الإجراءات', url: `${SITE_URL}/procedures` },
      { name: 'جواز السفر', url: `${SITE_URL}/procedures/passport` },
    ])

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'الرئيسية',
      item: SITE_URL,
    })
    expect(result.itemListElement[2].position).toBe(3)
    expect(result.itemListElement[2].name).toBe('جواز السفر')
  })

  it('returns an empty itemListElement for an empty input array', () => {
    const result = buildBreadcrumbJsonLd([])
    expect(result.itemListElement).toEqual([])
  })

  it('preserves item order exactly (breadcrumbs are order-sensitive)', () => {
    const items = [
      { name: 'A', url: `${SITE_URL}/a` },
      { name: 'B', url: `${SITE_URL}/a/b` },
    ]
    const result = buildBreadcrumbJsonLd(items)
    expect(result.itemListElement.map(i => i.name)).toEqual(['A', 'B'])
  })
})
