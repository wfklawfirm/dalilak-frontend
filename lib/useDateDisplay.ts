/**
 * useDateDisplay — utility hook for bilingual date formatting in Lebanon timezone.
 * Provides formatDate(), formatRelative(), formatTime(), and isToday() helpers.
 * All times rendered in Asia/Beirut timezone.
 */

const LB_TZ = 'Asia/Beirut'

/** Returns a Lebanon-local Date for a given ISO string or Date */
export function toLebTime(d: Date | string): Date {
  const source = typeof d === 'string' ? new Date(d) : d
  return new Date(source.toLocaleString('en-US', { timeZone: LB_TZ }))
}

/** Format a date as a human-readable string in AR or EN */
export function formatDate(
  d: Date | string,
  lang: 'ar' | 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const source = typeof d === 'string' ? new Date(d) : d
  const defaultOpts: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'long', day: 'numeric',
    timeZone: LB_TZ,
    ...(options || {}),
  }
  return source.toLocaleDateString(
    lang === 'ar' ? 'ar-LB' : 'en-GB',
    defaultOpts
  )
}

/** Format a time as HH:MM in Lebanon timezone */
export function formatTime(d: Date | string, lang: 'ar' | 'en'): string {
  const source = typeof d === 'string' ? new Date(d) : d
  return source.toLocaleTimeString(
    lang === 'ar' ? 'ar-LB' : 'en-US',
    { hour: '2-digit', minute: '2-digit', timeZone: LB_TZ }
  )
}

/** Returns true if the given date is today (Lebanon time) */
export function isToday(d: Date | string): boolean {
  const lb = toLebTime(typeof d === 'string' ? new Date(d) : d)
  const now = toLebTime(new Date())
  return lb.getFullYear() === now.getFullYear()
    && lb.getMonth() === now.getMonth()
    && lb.getDate() === now.getDate()
}

/** Returns true if the given date is tomorrow (Lebanon time) */
export function isTomorrow(d: Date | string): boolean {
  const lb = toLebTime(typeof d === 'string' ? new Date(d) : d)
  const tomorrow = toLebTime(new Date(Date.now() + 86_400_000))
  return lb.getFullYear() === tomorrow.getFullYear()
    && lb.getMonth() === tomorrow.getMonth()
    && lb.getDate() === tomorrow.getDate()
}

/** Relative date label: "today", "tomorrow", "in 3 days", "Mar 15", etc. */
export function formatRelative(dateStr: string, lang: 'ar' | 'en'): string {
  const isAr = lang === 'ar'
  try {
    const d = new Date(dateStr)
    if (isToday(d)) return isAr ? 'اليوم' : 'Today'
    if (isTomorrow(d)) return isAr ? 'غداً' : 'Tomorrow'
    const diff = Math.round((d.getTime() - Date.now()) / 86_400_000)
    if (diff > 0 && diff < 7) {
      return isAr ? `خلال ${diff} أيام` : `In ${diff} days`
    }
    if (diff < 0 && diff > -7) {
      const abs = Math.abs(diff)
      return isAr ? `منذ ${abs} أيام` : `${abs} days ago`
    }
    return formatDate(d, lang, { month: 'short', day: 'numeric', timeZone: LB_TZ })
  } catch {
    return dateStr
  }
}

/** Short date like "15 مارس" or "Mar 15" */
export function formatShort(dateStr: string, lang: 'ar' | 'en'): string {
  try {
    return formatDate(new Date(dateStr), lang, { month: 'short', day: 'numeric', timeZone: LB_TZ })
  } catch { return dateStr }
}

/** Day of week: "الإثنين" / "Monday" */
export function formatDayOfWeek(dateStr: string, lang: 'ar' | 'en'): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      lang === 'ar' ? 'ar-LB' : 'en-US',
      { weekday: 'long', timeZone: LB_TZ }
    )
  } catch { return '' }
}
