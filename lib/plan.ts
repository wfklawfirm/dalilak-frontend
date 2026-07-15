/**
 * Dalilak AI — Plan Tier Logic (Phase 14)
 *
 * Defines feature gates for Free / Pro / Business tiers.
 * Backend enforces limits; this module drives UI messaging.
 *
 * TODO: Replace mock limits with values fetched from /auth/me once
 * the backend returns plan_features in the user object.
 */

export type PlanTier = 'trial' | 'free' | 'paid' | 'admin'

export interface PlanFeatures {
  dailyMessageLimit: number       // -1 = unlimited
  fileUploadEnabled: boolean
  guidedFlowEnabled: boolean
  historyRetentionDays: number    // -1 = unlimited
  researchModeEnabled: boolean
  procedureDetailEnabled: boolean
  label_ar: string
  label_en: string
  color: string
  bg: string
}

const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  trial: {
    dailyMessageLimit: 10,
    fileUploadEnabled: false,
    guidedFlowEnabled: true,
    historyRetentionDays: 7,
    researchModeEnabled: false,
    procedureDetailEnabled: true,
    label_ar: 'تجريبي',
    label_en: 'Trial',
    color: '#5C4A3A',
    bg: '#EAE4D9',
  },
  free: {
    dailyMessageLimit: 5,
    fileUploadEnabled: false,
    guidedFlowEnabled: false,
    historyRetentionDays: 3,
    researchModeEnabled: false,
    procedureDetailEnabled: true,
    label_ar: 'مجاني',
    label_en: 'Free',
    color: '#5C4A3A',
    bg: '#EAE4D9',
  },
  paid: {
    dailyMessageLimit: -1,
    fileUploadEnabled: true,
    guidedFlowEnabled: true,
    historyRetentionDays: -1,
    researchModeEnabled: true,
    procedureDetailEnabled: true,
    label_ar: 'بروفيشنال',
    label_en: 'Pro',
    color: '#B8860B',
    bg: '#FFFBEB',
  },
  admin: {
    dailyMessageLimit: -1,
    fileUploadEnabled: true,
    guidedFlowEnabled: true,
    historyRetentionDays: -1,
    researchModeEnabled: true,
    procedureDetailEnabled: true,
    label_ar: 'إداري',
    label_en: 'Admin',
    color: '#8B1A1A',
    bg: '#FEF2F2',
  },
}

export function getPlanFeatures(plan?: string): PlanFeatures {
  return PLAN_FEATURES[(plan as PlanTier) ?? 'free'] ?? PLAN_FEATURES.free
}

export function isFeatureGated(plan: string | undefined, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan)
  const val = features[feature]
  if (typeof val === 'boolean') return !val
  if (typeof val === 'number') return val === 0
  return false
}

export function getUpgradeMessage(isAr: boolean): string {
  return isAr
    ? '⭐ هذه الميزة متاحة في خطة بروفيشنال. تواصل معنا للترقية.'
    : '⭐ This feature is available in the Pro plan. Contact us to upgrade.'
}
