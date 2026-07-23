'use client'

/**
 * ProcedureOfficeMap — "open in Google Maps" quick link for the ministry
 * tied to a procedure, using a static area-name lookup (no API key needed).
 *
 * Props: { ministrySlug: string; isAr: boolean }
 */

import React from 'react'

interface Props {
  ministrySlug: string
  isAr: boolean
}

// Static search query per ministry — opens Google Maps search, no API key required.
const MAP_QUERY: Record<string, string> = {
  'isf':            'Internal Security Forces Lebanon office',
  'civil-registry': 'Nafous Civil Registry office Lebanon',
  'moe':            'Ministry of Education Lebanon',
  'moph':           'Ministry of Public Health Lebanon',
  'mol':            'Ministry of Labor Lebanon',
  'mof':            'Ministry of Finance Lebanon',
  'moim':           'Ministry of Interior Lebanon',
  'mofa':           'Ministry of Foreign Affairs Lebanon',
  'mopwt':          'Ministry of Public Works Lebanon',
  'cdm':            'Council for Development and Reconstruction Lebanon',
}

export default function ProcedureOfficeMap({ ministrySlug, isAr }: Props) {
  const query = MAP_QUERY[ministrySlug]
  if (!query) return null

  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 12px',
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 10,
        fontSize: 12, fontWeight: 700, color: '#1D4ED8',
        textDecoration: 'none',
      }}
    >
      <span>📍</span>
      <span>{isAr ? 'افتح الموقع على الخريطة' : 'Open location on map'}</span>
    </a>
  )
}
