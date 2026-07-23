'use client'

/**
 * ServiceMapPlaceholder — "Find government offices near you" entry point.
 *
 * Shows a card on the /services page with a map pin icon.
 * When geolocation is available: "Use my location" opens Google Maps
 * centered on the user's coordinates, searching for Lebanese ministries.
 * When not available (or denied): opens a generic Google Maps search.
 *
 * Quick links below the card for the most common office types.
 */

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

interface OfficeLink {
  icon: string
  labelAr: string
  labelEn: string
  query: string
}

const OFFICE_LINKS: OfficeLink[] = [
  { icon: '🏛️', labelAr: 'وزارة الداخلية',    labelEn: 'Ministry of Interior', query: 'وزارة الداخلية لبنان' },
  { icon: '🏥', labelAr: 'المركز الصحي',      labelEn: 'Health Center',        query: 'مركز صحي لبنان' },
  { icon: '🚔', labelAr: 'مركز قوى الأمن',   labelEn: 'ISF Station',          query: 'قوى الأمن الداخلي لبنان' },
  { icon: '🏙️', labelAr: 'مبنى البلدية',     labelEn: 'Municipality',         query: 'بلدية لبنان' },
  { icon: '🏦', labelAr: 'مصرف لبنان',        labelEn: 'Banque du Liban',     query: 'مصرف لبنان' },
  { icon: '📮', labelAr: 'مكتب البريد',       labelEn: 'Post Office',          query: 'مكتب بريد لبنان LibanPost' },
]

function openGoogleMaps(query: string, lat?: number, lng?: number) {
  let url: string
  if (lat !== undefined && lng !== undefined) {
    url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},14z`
  } else {
    url = `https://www.google.com/maps/search/${encodeURIComponent(query)}+لبنان`
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function ServiceMapPlaceholder() {
  const { isAr } = useLanguage()
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ready' | 'denied'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if geolocation is available
    if (!navigator.geolocation) setGeoState('denied')
    else setGeoState('idle')
  }, [])

  function handleLocate() {
    if (!navigator.geolocation) {
      openGoogleMaps('وزارات لبنان government offices')
      return
    }
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })
        setGeoState('ready')
        openGoogleMaps('وزارات لبنان مكاتب حكومية', lat, lng)
      },
      () => {
        setGeoState('denied')
        openGoogleMaps('وزارات لبنان government offices')
      },
      { timeout: 8000 }
    )
  }

  function handleOfficeLink(link: OfficeLink) {
    if (coords) {
      openGoogleMaps(link.query, coords.lat, coords.lng)
    } else {
      openGoogleMaps(link.query)
    }
  }

  if (!mounted) return null

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        background: '#fff',
        border: '1.5px solid #E6E2DC',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      {/* Map preview placeholder */}
      <div style={{
        height: 90,
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Fake map grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(147,197,253,0.25) 0px, rgba(147,197,253,0.25) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(147,197,253,0.25) 0px, rgba(147,197,253,0.25) 1px, transparent 1px, transparent 40px)',
        }} />

        {/* Map pin */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>📍</div>
          <div style={{
            position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
            background: '#8F1D2C', color: '#fff',
            fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
            whiteSpace: 'nowrap',
          }}>
            {isAr ? 'لبنان' : 'Lebanon'}
          </div>
        </div>

        {/* Locate button overlay */}
        <button
          type="button"
          onClick={handleLocate}
          disabled={geoState === 'loading'}
          style={{
            position: 'absolute', bottom: 8, [isAr ? 'left' : 'right']: 8,
            padding: '5px 12px', borderRadius: 8,
            background: geoState === 'ready' ? '#059669' : '#8F1D2C',
            color: '#fff', border: 'none',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
            opacity: geoState === 'loading' ? 0.7 : 1,
          }}
        >
          {geoState === 'loading' ? '⏳' : geoState === 'ready' ? '✅' : '📍'}
          {geoState === 'loading'
            ? (isAr ? 'جارٍ التحديد...' : 'Locating...')
            : geoState === 'ready'
              ? (isAr ? 'تم تحديد موقعك' : 'Location found')
              : (isAr ? 'استخدم موقعي' : 'Use my location')
          }
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#191713', marginBottom: 3 }}>
          {isAr ? '🏛️ ابحث عن دوائر حكومية قريبة منك' : '🏛️ Find Nearby Government Offices'}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {isAr
            ? 'اعثر على أقرب وزارة أو مركز خدمة أو مكتب حكومي'
            : 'Locate the nearest ministry, service center, or government office'
          }
        </div>
      </div>

      {/* Quick office links */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        padding: '0 14px 14px',
      }}>
        {OFFICE_LINKS.map(link => (
          <button
            key={link.query}
            type="button"
            onClick={() => handleOfficeLink(link)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: '#F8F5F2', border: '1px solid #E6E2DC',
              fontSize: 11, fontWeight: 600, color: '#4B3B3B',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span>{link.icon}</span>
            {isAr ? link.labelAr : link.labelEn}
          </button>
        ))}
      </div>
    </div>
  )
}
