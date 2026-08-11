import { RoleCode } from '../enums/index.js';

export interface ISubscriptionTier {
  code: string;
  name: string;
  targetRole: RoleCode;
  priceXAF: number;
  currency: string;
  includesRoles: RoleCode[];
  description: string;
}

/**
 * RECHERCHE V1 Approved Subscription Pricing Matrix (Configurable)
 * Currency: CFA Franc (XAF)
 */
export const RECHERCHE_SUBSCRIPTION_PRICING: Record<string, ISubscriptionTier> = {
  BETREUER_BASE: {
    code: 'BETREUER_BASE',
    name: 'Betreuer Role Access',
    targetRole: RoleCode.BETREUER,
    priceXAF: 2000,
    currency: 'XAF',
    includesRoles: [RoleCode.BETREUER],
    description: 'Unlocks Betreuer provider profile and role dashboard.',
  },
  LEHRER_SOLO: {
    code: 'LEHRER_SOLO',
    name: 'Lehrer Role Access',
    targetRole: RoleCode.LEHRER,
    priceXAF: 5000,
    currency: 'XAF',
    includesRoles: [RoleCode.LEHRER],
    description: 'Unlocks Lehrer provider profile and role dashboard.',
  },
  LEHRER_WITH_BETREUER: {
    code: 'LEHRER_WITH_BETREUER',
    name: 'Lehrer + Betreuer Access',
    targetRole: RoleCode.LEHRER,
    priceXAF: 6000,
    currency: 'XAF',
    includesRoles: [RoleCode.LEHRER, RoleCode.BETREUER],
    description: 'Unlocks Lehrer profile and grants eligibility for Betreuer role access.',
  },
  VISA_COMPANION_SOLO: {
    code: 'VISA_COMPANION_SOLO',
    name: 'Visa Companion Role Access',
    targetRole: RoleCode.VISA_COMPANION,
    priceXAF: 10000,
    currency: 'XAF',
    includesRoles: [RoleCode.VISA_COMPANION],
    description: 'Unlocks Visa Companion provider profile and role dashboard.',
  },
  VISA_COMPANION_FULL: {
    code: 'VISA_COMPANION_FULL',
    name: 'Visa Companion + Underlying Roles Access',
    targetRole: RoleCode.VISA_COMPANION,
    priceXAF: 15000,
    currency: 'XAF',
    includesRoles: [RoleCode.VISA_COMPANION, RoleCode.LEHRER, RoleCode.BETREUER],
    description: 'Unlocks Visa Companion profile and grants eligibility for underlying provider roles.',
  },
  DEUTSCH_INSTITUT_SOLO: {
    code: 'DEUTSCH_INSTITUT_SOLO',
    name: 'Deutsch Institut Role Access',
    targetRole: RoleCode.DEUTSCH_INSTITUT,
    priceXAF: 12500,
    currency: 'XAF',
    includesRoles: [RoleCode.DEUTSCH_INSTITUT],
    description: 'Unlocks Deutsch Institut provider profile, campus manager, and course manager.',
  },
  DEUTSCH_INSTITUT_ALL: {
    code: 'DEUTSCH_INSTITUT_ALL',
    name: 'Deutsch Institut + All Underlying Roles Access',
    targetRole: RoleCode.DEUTSCH_INSTITUT,
    priceXAF: 20000,
    currency: 'XAF',
    includesRoles: [
      RoleCode.DEUTSCH_INSTITUT,
      RoleCode.VISA_COMPANION,
      RoleCode.LEHRER,
      RoleCode.BETREUER,
    ],
    description: 'Unlocks Deutsch Institut profile and grants eligibility for all underlying provider roles.',
  },
};
