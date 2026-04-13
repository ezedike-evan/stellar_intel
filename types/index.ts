// ─── Anchor / Off-ramp / On-ramp ────────────────────────────────────────────

export type DepositMethod = 'bank_transfer' | 'mobile_money' | 'cash' | 'card';

export interface AnchorInfo {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
  depositMethods: DepositMethod[];
}

export interface AnchorRate {
  anchorId: string;
  anchorName: string;
  logoUrl?: string;
  // Off-ramp: USDC → fiat
  exchangeRate: number; // units of local currency per 1 USDC
  fee: number; // flat fee in USDC
  feePercent: number; // percentage fee (0.01 = 1%)
  minAmount: number; // minimum in USDC
  maxAmount: number; // maximum in USDC
  estimatedTime: string; // e.g. "1–2 hours"
  depositMethods: DepositMethod[];
  country: string;
  currency: string; // ISO 4217
  totalReceived?: number; // computed: (amount - fee) * exchangeRate
  isBest?: boolean;
  isWorst?: boolean;
  lastUpdated: Date;
  isMock?: boolean;
}

// ─── Swap routing (SDEX path results) ────────────────────────────────────────

export type SwapSource = 'SDEX' | 'Soroswap' | 'Phoenix' | 'Aquarius';

export interface SwapRoute {
  routeId: string;
  source: SwapSource;
  fromAsset: StellarAsset;
  toAsset: StellarAsset;
  fromAmount: number;
  toAmount: number;
  price: number;
  priceImpact: number;
  fee: number;
  path: StellarAsset[];
  estimatedTime: string;
  isBest?: boolean;
  lastUpdated: Date;
}

// ─── Stellar assets ───────────────────────────────────────────────────────────

export interface StellarAsset {
  code: string;
  issuer?: string; // undefined for XLM (native)
  name: string;
  logoUrl?: string;
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type SortDirection = 'asc' | 'desc';
export type OfframpSortKey = 'rate' | 'fee' | 'time' | 'total';

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string; // ISO 4217
  currencySymbol: string;
  flag: string;
}
