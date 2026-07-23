'use client'

/**
 * HomepageWeatherWidget — Beirut weather via Open-Meteo (no API key).
 *
 * Fetches: https://api.open-meteo.com/v1/forecast?latitude=33.89&longitude=35.50
 *           &current_weather=true&timezone=Asia%2FBeirut
 *
 * Shows temperature + WMO weather code icon.
 * Caches in localStorage for 30 min: dalilak_weather_cache
 * Falls back gracefully on network error.
 *
 * Props: { isAr: boolean }
 */

import React, { useState, useEffect } from 'react'

interface Props {
  isAr: boolean
}

interface WeatherData {
  temperature: number
  windspeed: number
  weathercode: number
  fetchedAt: number
}

const CACHE_KEY = 'dalilak_weather_cache'
const CACHE_TTL = 30 * 60 * 1000 // 30 min

function wmoIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2)  return '🌤️'
  if (code <= 3)  return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

function wmoLabel(code: number, isAr: boolean): string {
  const labels: Record<string, [string, string]> = {
    '0':  ['صافٍ', 'Clear sky'],
    '1':  ['غائم جزئياً', 'Mostly clear'],
    '2':  ['غائم جزئياً', 'Partly cloudy'],
    '3':  ['غائم', 'Overcast'],
    '45': ['ضبابي', 'Foggy'],
    '61': ['مطر خفيف', 'Light rain'],
    '63': ['مطر', 'Rain'],
    '65': ['مطر غزير', 'Heavy rain'],
    '71': ['ثلج خفيف', 'Light snow'],
    '80': ['زخات مطر', 'Rain showers'],
    '95': ['عاصفة رعدية', 'Thunderstorm'],
  }
  const bucket = Object.keys(labels)
    .filter(k => parseInt(k) <= code)
    .sort((a, b) => parseInt(b) - parseInt(a))[0] ?? '0'
  const [ar, en] = labels[bucket]
  return isAr ? ar : en
}

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=33.89&longitude=35.50&current_weather=true&timezone=Asia%2FBeirut',
      { cache: 'no-store' }
    )
    if (!r.ok) return null
    const j = await r.json()
    const cw = j?.current_weather
    if (!cw) return null
    return { temperature: Math.round(cw.temperature), windspeed: Math.round(cw.windspeed), weathercode: cw.weathercode, fetchedAt: Date.now() }
  } catch {
    return null
  }
}

export default function HomepageWeatherWidget({ isAr }: Props) {
  const [mounted, setMounted]   = useState(false)
  const [data, setData]         = useState<WeatherData | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setMounted(true)
    // check cache
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached: WeatherData = JSON.parse(raw)
        if (Date.now() - cached.fetchedAt < CACHE_TTL) {
          setData(cached)
          setLoading(false)
          return
        }
      }
    } catch {}
    // fetch fresh
    fetchWeather().then(w => {
      if (w) {
        setData(w)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(w)) } catch {}
      }
      setLoading(false)
    })
  }, [])

  if (!mounted) return null
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F0F9FF', borderRadius: 12, fontSize: 12, color: '#64748B' }}>
      <span style={{ fontSize: 18 }}>🌡️</span>
      <span>{isAr ? 'جاري تحميل الطقس…' : 'Loading weather…'}</span>
    </div>
  )
  if (!data) return null

  const icon = wmoIcon(data.weathercode)
  const label = wmoLabel(data.weathercode, isAr)

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        borderRadius: 14,
        border: '1px solid #7DD3FC',
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0C4A6E' }}>
          {data.temperature}°C
          <span style={{ fontWeight: 400, fontSize: 12, color: '#0369A1', marginInlineStart: 6 }}>{label}</span>
        </div>
        <div style={{ fontSize: 11, color: '#0284C7', marginTop: 1 }}>
          {isAr ? `بيروت • رياح ${data.windspeed} كم/س` : `Beirut • Wind ${data.windspeed} km/h`}
        </div>
      </div>
    </div>
  )
}
