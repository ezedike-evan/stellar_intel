import type { Anchor, Corridor, StellarAsset } from '@/types'
import { USDC_ISSUER } from '../config'
// ─── USDC asset ───────────────────────────────────────────────────────────────

/** USDC on Stellar mainnet (Circle issuer). */
export const USDC_ASSET: StellarAsset = {
  code: 'USDC',
  issuer: USDC_ISSUER,
  name: 'USD Coin',
}

// ─── Anchors ──────────────────────────────────────────────────────────────────

/**
 * MoneyGram — all five corridors (USDC → NGN / KES / GHS / MXN / BRL).
 * Confirmed live SEP-24 anchor. USDC withdraw enabled, max $2,500/tx.
 * Cash pickup at MoneyGram agent locations worldwide.
 */
const MONEYGRAM: Anchor = {
  id: 'moneygram',
  name: 'MoneyGram',
  homeDomain: 'stellar.moneygram.com',
  corridors: ['usdc-ngn', 'usdc-kes', 'usdc-ghs', 'usdc-mxn', 'usdc-brl'],
  assetCode: 'USDC',
  assetIssuer: USDC_ISSUER,
}

/**
 * Cowrie Exchange — Nigeria corridor (USDC → NGN).
 * Uses SEP-6 (TRANSFER_SERVER), not SEP-24. Included for comparison.
 */
const COWRIE: Anchor = {
  id: 'cowrie',
  name: 'Cowrie Exchange',
  homeDomain: 'cowrie.exchange',
  corridors: ['usdc-ngn'],
  assetCode: 'USDC',
  assetIssuer: USDC_ISSUER,
}

/**
 * Anclap — Argentina and Peru corridors (USDC → ARS / PEN).
 * Confirmed live SEP-24 anchor. 2% withdrawal fee.
 */
const ANCLAP: Anchor = {
  id: 'anclap',
  name: 'Anclap',
  homeDomain: 'anclap.com',
  corridors: ['usdc-ars', 'usdc-pen'],
  assetCode: 'USDC',
  assetIssuer: USDC_ISSUER,
}

/** All supported anchors. */
export const ANCHORS: Anchor[] = [MONEYGRAM, COWRIE, ANCLAP] as const

/** Maps anchor ID → home domain for quick lookup during SEP-1 resolution. */
export const ANCHOR_HOME_DOMAINS: Record<string, string> = {
  moneygram: 'stellar.moneygram.com',
  cowrie: 'cowrie.exchange',
  anclap: 'anclap.com',
} as const

// ─── Corridors ────────────────────────────────────────────────────────────────

const CORRIDOR_NGN: Corridor = {
  id: 'usdc-ngn',
  from: 'USDC',
  to: 'NGN',
  countryCode: 'NG',
  countryName: 'Nigeria',
}

const CORRIDOR_KES: Corridor = {
  id: 'usdc-kes',
  from: 'USDC',
  to: 'KES',
  countryCode: 'KE',
  countryName: 'Kenya',
}

const CORRIDOR_GHS: Corridor = {
  id: 'usdc-ghs',
  from: 'USDC',
  to: 'GHS',
  countryCode: 'GH',
  countryName: 'Ghana',
}

const CORRIDOR_MXN: Corridor = {
  id: 'usdc-mxn',
  from: 'USDC',
  to: 'MXN',
  countryCode: 'MX',
  countryName: 'Mexico',
}

const CORRIDOR_BRL: Corridor = {
  id: 'usdc-brl',
  from: 'USDC',
  to: 'BRL',
  countryCode: 'BR',
  countryName: 'Brazil',
}

const CORRIDOR_ARS: Corridor = {
  id: 'usdc-ars',
  from: 'USDC',
  to: 'ARS',
  countryCode: 'AR',
  countryName: 'Argentina',
}

const CORRIDOR_PEN: Corridor = {
  id: 'usdc-pen',
  from: 'USDC',
  to: 'PEN',
  countryCode: 'PE',
  countryName: 'Peru',
}

const CORRIDOR_UGX: Corridor = {
  id: 'usdc-ugx',
  from: 'USDC',
  to: 'UGX',
  countryCode: 'UG',
  countryName: 'Uganda',
}

const CORRIDOR_TZS: Corridor = {
  id: 'usdc-tzs',
  from: 'USDC',
  to: 'TZS',
  countryCode: 'TZ',
  countryName: 'Tanzania',
}

const CORRIDOR_XOF: Corridor = {
  id: 'usdc-xof',
  from: 'USDC',
  to: 'XOF',
  countryCode: 'SN',
  countryName: 'Senegal',
}

const CORRIDOR_ZAR: Corridor = {
  id: 'usdc-zar',
  from: 'USDC',
  to: 'ZAR',
  countryCode: 'ZA',
  countryName: 'South Africa',
}

const CORRIDOR_COP: Corridor = {
  id: 'usdc-cop',
  from: 'USDC',
  to: 'COP',
  countryCode: 'CO',
  countryName: 'Colombia',
}

const CORRIDOR_CLP: Corridor = {
  id: 'usdc-clp',
  from: 'USDC',
  to: 'CLP',
  countryCode: 'CL',
  countryName: 'Chile',
}

const CORRIDOR_IDR: Corridor = {
  id: 'usdc-idr',
  from: 'USDC',
  to: 'IDR',
  countryCode: 'ID',
  countryName: 'Indonesia',
}

const CORRIDOR_VND: Corridor = {
  id: 'usdc-vnd',
  from: 'USDC',
  to: 'VND',
  countryCode: 'VN',
  countryName: 'Vietnam',
}

const CORRIDOR_THB: Corridor = {
  id: 'usdc-thb',
  from: 'USDC',
  to: 'THB',
  countryCode: 'TH',
  countryName: 'Thailand',
}

const CORRIDOR_INR: Corridor = {
  id: 'usdc-inr',
  from: 'USDC',
  to: 'INR',
  countryCode: 'IN',
  countryName: 'India',
}

const CORRIDOR_PKR: Corridor = {
  id: 'usdc-pkr',
  from: 'USDC',
  to: 'PKR',
  countryCode: 'PK',
  countryName: 'Pakistan',
}

const CORRIDOR_PHP: Corridor = {
  id: 'usdc-php',
  from: 'USDC',
  to: 'PHP',
  countryCode: 'PH',
  countryName: 'Philippines',
}

const CORRIDOR_EUR: Corridor = {
  id: 'usdc-eur',
  from: 'USDC',
  to: 'EUR',
  countryCode: 'DE',
  countryName: 'Germany',
}

/** All supported corridors. */
export const CORRIDORS: Corridor[] = [
  // Africa
  CORRIDOR_NGN,
  CORRIDOR_KES,
  CORRIDOR_GHS,
  CORRIDOR_UGX,
  CORRIDOR_TZS,
  CORRIDOR_XOF,
  CORRIDOR_ZAR,
  // Latin America
  CORRIDOR_MXN,
  CORRIDOR_BRL,
  CORRIDOR_ARS,
  CORRIDOR_PEN,
  CORRIDOR_COP,
  CORRIDOR_CLP,
  // Southeast Asia
  CORRIDOR_PHP,
  CORRIDOR_IDR,
  CORRIDOR_VND,
  CORRIDOR_THB,
  // South Asia
  CORRIDOR_INR,
  CORRIDOR_PKR,
  // Europe
  CORRIDOR_EUR,
] as const

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Returns the anchor with the given ID.
 * Throws a descriptive error if the ID is not found.
 */
export function getAnchorById(id: string): Anchor {
  const anchor = ANCHORS.find((a) => a.id === id)
  if (!anchor) {
    throw new Error(`Unknown anchor: "${id}". Valid IDs: ${ANCHORS.map((a) => a.id).join(', ')}`)
  }
  return anchor
}

/**
 * Returns all anchors that serve the given corridor.
 * Returns an empty array if no anchors support the corridor.
 */
export function getAnchorsByCorridorId(corridorId: string): Anchor[] {
  return ANCHORS.filter((a) => a.corridors.includes(corridorId))
}

/**
 * Returns the corridor with the given ID.
 * Throws a descriptive error if the ID is not found.
 */
export function getCorridorById(id: string): Corridor {
  const corridor = CORRIDORS.find((c) => c.id === id)
  if (!corridor) {
    throw new Error(
      `Unknown corridor: "${id}". Valid IDs: ${CORRIDORS.map((c) => c.id).join(', ')}`
    )
  }
  return corridor
}

/**
 * Returns true if the given string is a valid corridor ID.
 * Used to validate query parameters in API routes.
 */
export function isValidCorridorId(id: string): boolean {
  return CORRIDORS.some((c) => c.id === id)
}
