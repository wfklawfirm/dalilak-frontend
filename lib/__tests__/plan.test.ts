import { describe, it, expect } from 'vitest'
import { getPlanFeatures, isFeatureGated, getUpgradeMessage } from '../plan'

describe('getPlanFeatures', () => {
  it('returns paid features for "paid"', () => {
    expect(getPlanFeatures('paid').fileUploadEnabled).toBe(true)
    expect(getPlanFeatures('paid').dailyMessageLimit).toBe(-1)
  })

  it('falls back to free features when plan is undefined', () => {
    expect(getPlanFeatures(undefined)).toEqual(getPlanFeatures('free'))
  })

  it('falls back to free features for an unrecognized plan string', () => {
    // Defensive fallback: an unknown/garbage plan value should never leave a
    // user with `undefined` features (which would throw downstream) -- it
    // should silently degrade to the most restrictive real tier (free).
    expect(getPlanFeatures('bogus-plan')).toEqual(getPlanFeatures('free'))
  })

  it('falls back to free features for an empty string plan', () => {
    expect(getPlanFeatures('')).toEqual(getPlanFeatures('free'))
  })
})

describe('isFeatureGated', () => {
  it('gates a boolean feature that is false on the given plan', () => {
    expect(isFeatureGated('free', 'fileUploadEnabled')).toBe(true)
  })

  it('does not gate a boolean feature that is true on the given plan', () => {
    expect(isFeatureGated('paid', 'fileUploadEnabled')).toBe(false)
  })

  it('does not gate a positive numeric limit (only 0 counts as gated)', () => {
    expect(isFeatureGated('free', 'dailyMessageLimit')).toBe(false) // 5, not gated
  })

  it('treats -1 (unlimited sentinel) as not gated', () => {
    expect(isFeatureGated('paid', 'dailyMessageLimit')).toBe(false) // -1 = unlimited
  })

  it('never gates a non-boolean, non-numeric field (e.g. a label/color string)', () => {
    expect(isFeatureGated('free', 'label_ar')).toBe(false)
    expect(isFeatureGated('free', 'color')).toBe(false)
  })
})

describe('getUpgradeMessage', () => {
  it('returns an Arabic message when isAr is true', () => {
    expect(getUpgradeMessage(true)).toContain('بروفيشنال')
  })

  it('returns an English message when isAr is false', () => {
    expect(getUpgradeMessage(false)).toContain('Pro')
  })
})
