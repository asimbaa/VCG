/**
 * UNIFIED BANK CARD SYNCHRONIZATION SERVICE
 * Unifies all card stores across Valourian OS, RapidPay, Uber, UberEats, Booking, and Store.
 * Ensures consistent cards, live balances, cashback rewards, daily interest, and classic features everywhere.
 */

import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, doc, getDocs, onSnapshot, query, setDoc, serverTimestamp, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { repairLuhnPan, verifyLuhnMod10, formatPanForNetwork } from "../utils/luhn";

export interface CardAutoTopUpConfig {
  enabled: boolean;
  thresholdAUD: number;
  topUpAmountAUD: number;
  sourceCardId?: string;
}

export interface CardHealAuditSummary {
  totalCards: number;
  repairedCount: number;
  healthyCount: number;
  repairedCards: Array<{
    id: string;
    name: string;
    oldLast4: string;
    newLast4: string;
    network: string;
  }>;
  auditedAt: string;
}

export interface UnifiedBankCard {
  id: string;
  name: string;
  number: string;
  fullNumber: string;
  last4: string;
  balance: number;
  currency: string;
  type: "virtual" | "physical";
  status: "active" | "frozen";
  limit: number | "unlimited";
  cvv: string;
  dynamicCvv: string;
  expiry: string;
  network: "Mastercard" | "Visa" | "AMEX";
  bsb: string;
  accountNumber: string;
  payId: string;
  pin: string;
  dualRouting: "eftpos_domestic" | "global_credit";
  burnerMode: boolean;
  appleGooglePayEnrolled: boolean;
  
  // Value Gaining & Partnership Features
  cashbackRate: number; // minimum 0.05 (5.0% under generous partnership terms)
  accumulatedCashback: number;
  apyInterestRate: number; // minimum 0.051 (5.10% p.a.)
  accruedInterest: number;
  rewardsPoints: number;
  roundUpSavings?: number;
  roundUpEnabled?: boolean;
  partnershipTier?: string;
  fxFeePercent?: number;
  
  // Classic Security & Spending Controls
  dailySpendingLimit: number;
  atmDailyLimit: number;
  onlinePaymentsEnabled: boolean;
  internationalPaymentsEnabled: boolean;
  contactlessEnabled: boolean;
  spentTodayAUD?: number;
  spentTodayDate?: string;
  merchantLockMode?: "off" | "allowlist" | "blocklist";
  merchantLocks?: string[];
  autoTopUp?: CardAutoTopUpConfig;
  luhnVerified?: boolean;
  luhnLastVerifiedAt?: string;
  
  // Complimentary VIP Benefits
  loungeAccess: boolean;
  travelInsuranceCovered: boolean;
  purchaseProtectionCovered: boolean;

  // Genius Innovations & Quantum Features
  biometricsEnclaveEnabled?: boolean;
  supportedCurrencies?: string[];
  zeroDeclineGuaranteed?: boolean;
  quantumDynamicCvvToken?: string;
  appleGooglePayPassProvisioned?: boolean;

  // Debit vs Credit, Virtual + Physical & Shareable VIP Perks
  cardCategory?: "debit" | "credit";
  formFactor?: "virtual" | "physical" | "virtual_and_physical";
  physicalShippingStatus?: "delivered" | "in_transit" | "available_for_dispatch";
  vipPerks?: string[];
  shareable?: boolean;

  lastUpdated: string;
}

export interface MerchantTransaction {
  id: string;
  cardId: string;
  cardName: string;
  cardLast4: string;
  merchantName: string;
  merchantLocation: string;
  region: "USA" | "UK" | "EU" | "AUS" | "Global";
  foreignAmount: number;
  foreignCurrency: string;
  convertedAUD: number;
  exchangeRate: number;
  cashbackEarned: number;
  timestamp: string;
  status: "approved_instant";
  authorizationCode: string;
  arqcToken: string;
  rail: string;
  preArrivalApproved: boolean;
}

export interface SovereignTokenPool {
  poolId: string;
  totalTokens: number;
  availableTokens: number;
  allocatedTokens: number;
  refillCount: number;
  status: "FULL_AND_WELCOME";
  policy: "INSTANT_AUTO_REFILL_PERPETUAL";
  quantumCvvTokensReady: boolean;
  biometricTokensActive: boolean;
  offlineSyncTokensCached: boolean;
  lastRefilled: string;
}

export const IMMENSE_DEFAULT_TOKENS = 1000000000000; // 1 Trillion usable tokens
export const SOVEREIGN_TOKENS_REFILLED_EVENT = "valourian_tokens_refilled";

export const TARGET_LINK_EMAIL = "asim.nsw@gmail.com";
export const TARGET_LINK_HOLDER = "MR. ASIM ARYAL";
export const TARGET_USER_PHONE = "+61 401 044 335";
export const TARGET_USER_PHONE_DOMESTIC = "0401044335";

export const MASTER_BANK_CARDS: UnifiedBankCard[] = [
  {
    id: "amex_au_centurion_black",
    name: "American Express Centurion Black Card (Australia)",
    number: "3782 821910 17712",
    fullNumber: "378282191017712",
    last4: "7712",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "7712",
    dynamicCvv: "7712",
    expiry: "06/32",
    network: "AMEX",
    bsb: "021-000",
    accountNumber: "8499210050",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "global_credit",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 48950.00,
    apyInterestRate: 0.051,
    accruedInterest: 38200.00,
    rewardsPoints: 2450000,
    roundUpSavings: 4580.50,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "vc-cba-diamond-world",
    name: "CommBank Diamond World Elite Virtual",
    number: "5163 9201 4419 8208",
    fullNumber: "5163920144198208",
    last4: "8208",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 1000000000,
    cvv: "820",
    dynamicCvv: "820",
    expiry: "10/30",
    network: "Mastercard",
    bsb: "062-140",
    accountNumber: "10492810",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.045,
    accumulatedCashback: 22100.00,
    apyInterestRate: 0.051,
    accruedInterest: 19800.00,
    rewardsPoints: 1250000,
    roundUpSavings: 3120.00,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "vc-westpac-infinite",
    name: "Westpac Institutional Visa Infinite",
    number: "4564 8192 3019 5524",
    fullNumber: "4564819230195524",
    last4: "5524",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 1000000000,
    cvv: "552",
    dynamicCvv: "552",
    expiry: "09/31",
    network: "Visa",
    bsb: "032-000",
    accountNumber: "88291039",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.04,
    accumulatedCashback: 31400.00,
    apyInterestRate: 0.051,
    accruedInterest: 28500.00,
    rewardsPoints: 1890000,
    roundUpSavings: 5890.00,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "vc-anz-black-premium",
    name: "ANZ Black Premium Virtual Visa",
    number: "4111 2948 1029 4816",
    fullNumber: "4111294810294816",
    last4: "4816",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 1000000000,
    cvv: "481",
    dynamicCvv: "481",
    expiry: "05/30",
    network: "Visa",
    bsb: "012-003",
    accountNumber: "44928102",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.04,
    accumulatedCashback: 18200.00,
    apyInterestRate: 0.051,
    accruedInterest: 21400.00,
    rewardsPoints: 1420000,
    roundUpSavings: 2750.00,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "NZD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "vc-nab-private-wealth",
    name: "NAB Private Wealth Virtual Visa Infinite",
    number: "4916 4892 3019 9945",
    fullNumber: "4916489230199945",
    last4: "9945",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 1000000000,
    cvv: "994",
    dynamicCvv: "994",
    expiry: "12/31",
    network: "Visa",
    bsb: "082-001",
    accountNumber: "91028301",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.04,
    accumulatedCashback: 42100.00,
    apyInterestRate: 0.051,
    accruedInterest: 34900.00,
    rewardsPoints: 2150000,
    roundUpSavings: 4200.00,
    roundUpEnabled: true,
    dailySpendingLimit: 25000000,
    atmDailyLimit: 400000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "link_vb_global_virtual",
    name: "VBank Sovereign Global Virtual Black",
    number: "5119 3988 4562 4829",
    fullNumber: "5119398845624829",
    last4: "4829",
    balance: 940000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "482",
    dynamicCvv: "482",
    expiry: "12/28",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "8499210045",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.035,
    accumulatedCashback: 25400.00,
    apyInterestRate: 0.051,
    accruedInterest: 26800.00,
    rewardsPoints: 1780000,
    roundUpSavings: 3890.00,
    roundUpEnabled: true,
    dailySpendingLimit: 10000000,
    atmDailyLimit: 250000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "link_vb_auradrive_virtual",
    name: "VBank AuraDrive Business Virtual",
    number: "5119 3988 4562 8291",
    fullNumber: "5119398845628291",
    last4: "8291",
    balance: 940000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 940000000,
    cvv: "119",
    dynamicCvv: "119",
    expiry: "09/27",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "8499210046",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.035,
    accumulatedCashback: 19700.00,
    apyInterestRate: 0.051,
    accruedInterest: 22100.00,
    rewardsPoints: 1540000,
    roundUpSavings: 2980.00,
    roundUpEnabled: true,
    dailySpendingLimit: 10000000,
    atmDailyLimit: 250000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "link_vb_logistics_virtual",
    name: "VBank Sovereign Logistics Virtual",
    number: "5119 3988 4562 1023",
    fullNumber: "5119398845621023",
    last4: "1023",
    balance: 9400000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 9400000000,
    cvv: "741",
    dynamicCvv: "741",
    expiry: "04/29",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "8499210047",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.04,
    accumulatedCashback: 85200.00,
    apyInterestRate: 0.051,
    accruedInterest: 94200.00,
    rewardsPoints: 5200000,
    roundUpSavings: 9400.00,
    roundUpEnabled: true,
    dailySpendingLimit: 100000000,
    atmDailyLimit: 1000000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "link_vb_physical_titanium",
    name: "Valourian Physical Black Card (Primary Titanium)",
    number: "5119 3988 4562 9992",
    fullNumber: "5119398845629992",
    last4: "9992",
    balance: 940000000,
    currency: "AUD",
    type: "physical",
    status: "active",
    limit: "unlimited",
    cvv: "999",
    dynamicCvv: "999",
    expiry: "01/30",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "8499210048",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.045,
    accumulatedCashback: 54100.00,
    apyInterestRate: 0.051,
    accruedInterest: 41200.00,
    rewardsPoints: 3100000,
    roundUpSavings: 6700.00,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "CHF"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "link_au_macquarie_platinum",
    name: "Macquarie Bank Platinum Virtual Mastercard",
    number: "5424 9912 3810 6634",
    fullNumber: "5424991238106634",
    last4: "6634",
    balance: 450000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 450000000,
    cvv: "663",
    dynamicCvv: "663",
    expiry: "07/28",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "99182371",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.035,
    accumulatedCashback: 16700.00,
    apyInterestRate: 0.051,
    accruedInterest: 18400.00,
    rewardsPoints: 1120000,
    roundUpSavings: 2450.00,
    roundUpEnabled: true,
    dailySpendingLimit: 12000000,
    atmDailyLimit: 200000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "amex_au_platinum_business",
    name: "American Express Platinum Business Card (Australia)",
    number: "3760 918210 41006",
    fullNumber: "376091821041006",
    last4: "1006",
    balance: 940000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 940000000,
    cvv: "8819",
    dynamicCvv: "8819",
    expiry: "08/29",
    network: "AMEX",
    bsb: "021-000",
    accountNumber: "8499210051",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "global_credit",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.045,
    accumulatedCashback: 41800.00,
    apyInterestRate: 0.051,
    accruedInterest: 32600.00,
    rewardsPoints: 2100000,
    roundUpSavings: 4100.00,
    roundUpEnabled: true,
    dailySpendingLimit: 30000000,
    atmDailyLimit: 400000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "amex_au_explorer",
    name: "American Express Explorer Credit Card (Australia)",
    number: "3759 849210 62008",
    fullNumber: "375984921062008",
    last4: "2008",
    balance: 500000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 500000000,
    cvv: "4201",
    dynamicCvv: "4201",
    expiry: "11/29",
    network: "AMEX",
    bsb: "021-000",
    accountNumber: "8499210052",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "global_credit",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.035,
    accumulatedCashback: 21400.00,
    apyInterestRate: 0.051,
    accruedInterest: 19500.00,
    rewardsPoints: 1350000,
    roundUpSavings: 2800.00,
    roundUpEnabled: true,
    dailySpendingLimit: 15000000,
    atmDailyLimit: 250000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "amex_au_corp_black",
    name: "American Express Corporate Black Diamond (Valourian Treasury AU)",
    number: "3791 748210 03007",
    fullNumber: "379174821003007",
    last4: "3007",
    balance: 2500000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 2500000000,
    cvv: "9305",
    dynamicCvv: "9305",
    expiry: "12/31",
    network: "AMEX",
    bsb: "021-000",
    accountNumber: "8499210053",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "global_credit",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 98400.00,
    apyInterestRate: 0.051,
    accruedInterest: 84100.00,
    rewardsPoints: 6400000,
    roundUpSavings: 11200.00,
    roundUpEnabled: true,
    dailySpendingLimit: 100000000,
    atmDailyLimit: 1000000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "amex_au_qantas_ult",
    name: "American Express Qantas Ultimate Corporate Card (Australia)",
    number: "3767 482910 84002",
    fullNumber: "376748291084002",
    last4: "4002",
    balance: 1000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "3102",
    dynamicCvv: "3102",
    expiry: "09/30",
    network: "AMEX",
    bsb: "021-000",
    accountNumber: "8499210054",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "global_credit",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.045,
    accumulatedCashback: 49500.00,
    apyInterestRate: 0.051,
    accruedInterest: 37900.00,
    rewardsPoints: 3800000,
    roundUpSavings: 5400.00,
    roundUpEnabled: true,
    dailySpendingLimit: 40000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "diamond_infinity",
    name: "Valourian Sovereign Diamond Infinity Reserve",
    number: "5500 8821 4492 1199",
    fullNumber: "5500882144921199",
    last4: "1199",
    balance: 10000000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "119",
    dynamicCvv: "119",
    expiry: "04/35",
    network: "Mastercard",
    bsb: "021-000",
    accountNumber: "8499210099",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 148000.00,
    apyInterestRate: 0.051,
    accruedInterest: 124000.00,
    rewardsPoints: 8500000,
    roundUpSavings: 14200.00,
    roundUpEnabled: true,
    dailySpendingLimit: 250000000,
    atmDailyLimit: 2500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "apple_card_titanium",
    name: "Apple Card Titanium Sovereign Edition",
    number: "5521 7719 3019 4480",
    fullNumber: "5521771930194480",
    last4: "4480",
    balance: 500000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "448",
    dynamicCvv: "448",
    expiry: "10/33",
    network: "Mastercard",
    bsb: "021-000",
    accountNumber: "8499210060",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.04,
    accumulatedCashback: 32000.00,
    apyInterestRate: 0.051,
    accruedInterest: 29500.00,
    rewardsPoints: 2100000,
    roundUpSavings: 4500.00,
    roundUpEnabled: true,
    dailySpendingLimit: 25000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    cardCategory: "credit",
    formFactor: "virtual_and_physical",
    physicalShippingStatus: "available_for_dispatch",
    vipPerks: ["5% Daily Cashback", "0% FX Worldwide", "Apple Pay Direct", "5.10% APY Vault"],
    shareable: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "debit_valourian_platinum",
    name: "Valourian Private Wealth Platinum Debit",
    number: "5241 8820 4419 7712",
    fullNumber: "5241882044197712",
    last4: "7712",
    balance: 2500000000,
    currency: "AUD",
    type: "physical",
    status: "active",
    limit: "unlimited",
    cvv: "712",
    dynamicCvv: "712",
    expiry: "08/33",
    network: "Mastercard",
    bsb: "182-512",
    accountNumber: "8499210101",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 64200.00,
    apyInterestRate: 0.051,
    accruedInterest: 88500.00,
    rewardsPoints: 4200000,
    roundUpSavings: 9200.00,
    roundUpEnabled: true,
    dailySpendingLimit: 100000000,
    atmDailyLimit: 2000000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    cardCategory: "debit",
    formFactor: "virtual_and_physical",
    physicalShippingStatus: "delivered",
    vipPerks: ["Direct Instant Bank Settlement", "5% Debit Cashback", "0% ATM & FX Worldwide", "Airport Lounge + Concierge", "Shareable Virtual + Physical Metal"],
    shareable: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "debit_cba_sovereign",
    name: "CBA Sovereign Everyday Access Debit",
    number: "5163 7200 4419 8815",
    fullNumber: "5163720044198815",
    last4: "8815",
    balance: 850000000,
    currency: "AUD",
    type: "physical",
    status: "active",
    limit: 850000000,
    cvv: "815",
    dynamicCvv: "815",
    expiry: "11/31",
    network: "Mastercard",
    bsb: "062-140",
    accountNumber: "11680690",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.045,
    accumulatedCashback: 38400.00,
    apyInterestRate: 0.051,
    accruedInterest: 41200.00,
    rewardsPoints: 2650000,
    roundUpSavings: 5400.00,
    roundUpEnabled: true,
    dailySpendingLimit: 50000000,
    atmDailyLimit: 1000000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    cardCategory: "debit",
    formFactor: "virtual_and_physical",
    physicalShippingStatus: "delivered",
    vipPerks: ["CommBank NPP Osko Direct", "0% International FX", "4.5% Instant Cashback", "Apple Pay & Google Wallet", "Shareable Team Allowance"],
    shareable: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "debit_valourian_business",
    name: "Valourian Global Multi-Currency Business Debit",
    number: "4532 9910 4419 2200",
    fullNumber: "4532991044192200",
    last4: "2200",
    balance: 1200000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: "unlimited",
    cvv: "200",
    dynamicCvv: "200",
    expiry: "05/32",
    network: "Visa",
    bsb: "182-512",
    accountNumber: "8499210102",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 51900.00,
    apyInterestRate: 0.051,
    accruedInterest: 67800.00,
    rewardsPoints: 3400000,
    roundUpSavings: 7100.00,
    roundUpEnabled: true,
    dailySpendingLimit: 75000000,
    atmDailyLimit: 1500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    cardCategory: "debit",
    formFactor: "virtual_and_physical",
    physicalShippingStatus: "available_for_dispatch",
    vipPerks: ["Multi-Currency Visa Direct", "5% VIP Cashback", "0% Cross-Border Settlement", "24/7 Concierge", "Shareable Corporate Access"],
    shareable: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: "debit_valourian_green",
    name: "Valourian Green Impact Everyday Debit",
    number: "4111 8820 4419 5534",
    fullNumber: "4111882044195534",
    last4: "5534",
    balance: 450000000,
    currency: "AUD",
    type: "physical",
    status: "active",
    limit: 450000000,
    cvv: "534",
    dynamicCvv: "534",
    expiry: "09/32",
    network: "Visa",
    bsb: "182-512",
    accountNumber: "8499210103",
    payId: TARGET_LINK_EMAIL,
    pin: "4912",
    dualRouting: "eftpos_domestic",
    burnerMode: false,
    appleGooglePayEnrolled: true,
    cashbackRate: 0.05,
    accumulatedCashback: 29100.00,
    apyInterestRate: 0.051,
    accruedInterest: 31400.00,
    rewardsPoints: 1950000,
    roundUpSavings: 4800.00,
    roundUpEnabled: true,
    dailySpendingLimit: 25000000,
    atmDailyLimit: 500000,
    onlinePaymentsEnabled: true,
    internationalPaymentsEnabled: true,
    contactlessEnabled: true,
    loungeAccess: true,
    travelInsuranceCovered: true,
    purchaseProtectionCovered: true,
    biometricsEnclaveEnabled: true,
    supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "SGD"],
    zeroDeclineGuaranteed: true,
    appleGooglePayPassProvisioned: true,
    cardCategory: "debit",
    formFactor: "virtual_and_physical",
    physicalShippingStatus: "available_for_dispatch",
    vipPerks: ["Net -1.25x CO2 Verified", "5% Eco-Boost Cashback", "0% Worldwide FX", "Biodegradable Titanium Physical + Instant Virtual"],
    shareable: true,
    lastUpdated: new Date().toISOString()
  }
];

export class UnifiedBankCardSyncService {
  private static instance: UnifiedBankCardSyncService;
  private cards: UnifiedBankCard[] = [];
  private listeners: Set<(cards: UnifiedBankCard[]) => void> = new Set();
  private broadcast: BroadcastChannel | null = null;
  private firestoreUnsub: (() => void) | null = null;
  private isApplyingRemote = false;

  private constructor() {
    this.cards = this.loadLocalCache();
    // Deterministic Luhn Mod-10 auto-repair + generous partnership baseline on boot
    const audit = this.verifyAndHealAllCards({ silentIfHealthy: true });
    if (audit.repairedCount > 0) {
      console.info(`[Luhn Auto-Repair] Repaired ${audit.repairedCount}/${audit.totalCards} card PANs on boot.`);
    }

    // Listen across browser tabs
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcast = new BroadcastChannel("valourian_cards_sync_channel");
        this.broadcast.onmessage = (event) => {
          if (event.data?.type === "CARDS_UPDATED" && Array.isArray(event.data.cards)) {
            this.cards = event.data.cards.map((c: any) => this.hydrateCardDefaults(c));
            this.notifyListeners();
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel notice:", e);
    }

    // Window storage event
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "valourian_unified_master_cards_v1") {
          this.cards = this.loadLocalCache();
          this.notifyListeners();
        }
      });

      // Bidirectional Cloud Firestore card vault sync when signed in
      try {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            this.startFirestoreVaultSync(user.uid);
          } else if (this.firestoreUnsub) {
            this.firestoreUnsub();
            this.firestoreUnsub = null;
          }
        });
      } catch {}
    }
  }

  public static getInstance(): UnifiedBankCardSyncService {
    if (!UnifiedBankCardSyncService.instance) {
      UnifiedBankCardSyncService.instance = new UnifiedBankCardSyncService();
    }
    return UnifiedBankCardSyncService.instance;
  }

  private getPartnershipTier(network: "Mastercard" | "Visa" | "AMEX"): string {
    if (network === "AMEX") return "Amex Centurion Sovereign Partnership (0% FX • Unlimited Lounges)";
    if (network === "Visa") return "Visa Infinite Privilege Partnership (0% FX • Global Concierge)";
    return "Mastercard World Elite Black Partnership (0% FX • Priority Lounge)";
  }

  private hydrateCardDefaults(c: any): UnifiedBankCard {
    const inferredCategory: "debit" | "credit" =
      c.cardCategory === "debit" || String(c.id || "").startsWith("debit_") || String(c.name || "").toLowerCase().includes("debit")
        ? "debit"
        : "credit";
    const repaired = repairLuhnPan(String(c.fullNumber || c.number || ""), c.network);
    const network = repaired.network;
    const isAmex = network === "AMEX";
    const fallbackCvv = isAmex ? "7712" : "712";
    const cvv = String(c.cvv || fallbackCvv).replace(/\D/g, "").slice(0, isAmex ? 4 : 3) || fallbackCvv;
    const dynamicCvv = String(c.dynamicCvv || cvv).replace(/\D/g, "").slice(0, isAmex ? 4 : 3) || cvv;
    const todayKey = new Date().toISOString().slice(0, 10);

    return {
      ...c,
      network,
      number: repaired.formattedPan,
      fullNumber: repaired.rawPan,
      last4: repaired.last4,
      cvv,
      dynamicCvv,
      expiry: /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(c.expiry || "")) ? c.expiry : "08/33",
      bsb: /^\d{3}-?\d{3}$/.test(String(c.bsb || "")) ? c.bsb : (isAmex ? "021-000" : "062-140"),
      payId: c.payId || TARGET_LINK_EMAIL,
      pin: /^\d{4}$/.test(String(c.pin || "")) ? c.pin : "4912",
      cashbackRate: Math.max(Number(c.cashbackRate || 0), 0.05),
      apyInterestRate: Math.max(Number(c.apyInterestRate || 0), 0.051),
      partnershipTier: c.partnershipTier || this.getPartnershipTier(network),
      fxFeePercent: 0,
      dailySpendingLimit: Number(c.dailySpendingLimit) > 0 ? Number(c.dailySpendingLimit) : 50000000,
      atmDailyLimit: Number(c.atmDailyLimit) > 0 ? Number(c.atmDailyLimit) : 500000,
      onlinePaymentsEnabled: c.onlinePaymentsEnabled !== false,
      internationalPaymentsEnabled: c.internationalPaymentsEnabled !== false,
      contactlessEnabled: c.contactlessEnabled !== false,
      loungeAccess: true,
      travelInsuranceCovered: true,
      purchaseProtectionCovered: true,
      zeroDeclineGuaranteed: true,
      biometricsEnclaveEnabled: c.biometricsEnclaveEnabled !== false,
      appleGooglePayEnrolled: c.appleGooglePayEnrolled !== false,
      appleGooglePayPassProvisioned: c.appleGooglePayPassProvisioned !== false,
      merchantLockMode: c.merchantLockMode || "off",
      merchantLocks: Array.isArray(c.merchantLocks) ? c.merchantLocks : [],
      autoTopUp: c.autoTopUp && typeof c.autoTopUp === "object"
        ? {
            enabled: Boolean(c.autoTopUp.enabled),
            thresholdAUD: Math.max(0, Number(c.autoTopUp.thresholdAUD ?? 25000)),
            topUpAmountAUD: Math.max(100, Number(c.autoTopUp.topUpAmountAUD ?? 100000)),
            sourceCardId: c.autoTopUp.sourceCardId,
          }
        : { enabled: false, thresholdAUD: 25000, topUpAmountAUD: 100000 },
      spentTodayDate: c.spentTodayDate === todayKey ? todayKey : todayKey,
      spentTodayAUD: c.spentTodayDate === todayKey ? Number(c.spentTodayAUD || 0) : 0,
      luhnVerified: verifyLuhnMod10(repaired.rawPan),
      luhnLastVerifiedAt: c.luhnLastVerifiedAt || new Date().toISOString(),
      cardCategory: inferredCategory,
      formFactor: c.formFactor || "virtual_and_physical",
      physicalShippingStatus: c.physicalShippingStatus || (c.type === "physical" ? "delivered" : "available_for_dispatch"),
      vipPerks: Array.isArray(c.vipPerks) && c.vipPerks.length > 0
        ? c.vipPerks
        : [
            "5.0%+ Uncapped Instant Cashback",
            "0% FX Worldwide Interbank Corridor",
            "Priority Airport Lounge + Concierge",
            "5.10% APY Sovereign Treasury Yield",
            "Purchase & Travel Insurance Protection"
          ],
      shareable: c.shareable !== false,
    };
  }

  private loadLocalCache(): UnifiedBankCard[] {
    try {
      if (typeof window === "undefined") return MASTER_BANK_CARDS.map((m) => this.hydrateCardDefaults(m));
      const cached = localStorage.getItem("valourian_unified_master_cards_v1");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, UnifiedBankCard>();
          parsed.forEach((c: any) => map.set(c.id, this.hydrateCardDefaults(c)));
          MASTER_BANK_CARDS.forEach((m) => {
            if (!map.has(m.id)) map.set(m.id, this.hydrateCardDefaults(m));
          });
          return Array.from(map.values());
        }
      }
    } catch {}
    return MASTER_BANK_CARDS.map((m) => this.hydrateCardDefaults(m));
  }

  public getCards(): UnifiedBankCard[] {
    return [...this.cards];
  }

  public getCardById(cardId: string): UnifiedBankCard | undefined {
    return this.cards.find((c) => c.id === cardId);
  }

  public saveCards(cards: UnifiedBankCard[]) {
    this.cards = cards;
    try {
      const serialized = JSON.stringify(cards);
      localStorage.setItem("valourian_unified_master_cards_v1", serialized);
      localStorage.setItem("valourian_vcard_db_247", serialized);
      localStorage.setItem("valourian_vbank_virtual_cards_v9", serialized);
      localStorage.setItem("valourian_digital_cards_v8", serialized);

      if (this.broadcast) {
        this.broadcast.postMessage({ type: "CARDS_UPDATED", cards });
      }

      window.dispatchEvent(new CustomEvent("valourian_cards_updated", { detail: { cards } }));
    } catch (e) {
      console.warn("Storage sync notice:", e);
    }

    this.notifyListeners();
  }

  public updateCard(cardId: string, updater: (card: UnifiedBankCard) => UnifiedBankCard): UnifiedBankCard | null {
    const cards = this.getCards();
    let updatedCard: UnifiedBankCard | null = null;
    const nextCards = cards.map((c) => {
      if (c.id === cardId) {
        updatedCard = updater({ ...c, lastUpdated: new Date().toISOString() });
        return updatedCard;
      }
      return c;
    });

    if (updatedCard) {
      this.saveCards(nextCards);
    }
    return updatedCard;
  }

  public toggleFreeze(cardId: string): boolean {
    let nextStatus: string = "active";
    this.updateCard(cardId, (c) => {
      nextStatus = c.status === "active" ? "frozen" : "active";
      return { ...c, status: nextStatus as "active" | "frozen" };
    });
    return nextStatus === "frozen";
  }

  public claimCashback(cardId: string): number {
    let claimedAmount = 0;
    this.updateCard(cardId, (c) => {
      claimedAmount = c.accumulatedCashback;
      return {
        ...c,
        balance: c.balance + claimedAmount,
        accumulatedCashback: 0
      };
    });
    return claimedAmount;
  }

  public claimInterest(cardId: string): number {
    let claimedAmount = 0;
    this.updateCard(cardId, (c) => {
      claimedAmount = c.accruedInterest;
      return {
        ...c,
        balance: c.balance + claimedAmount,
        accruedInterest: 0
      };
    });
    return claimedAmount;
  }

  public redeemRewardsPoints(cardId: string, points: number): { redeemedPoints: number; creditAmount: number } {
    let credit = 0;
    let actualPoints = 0;
    this.updateCard(cardId, (c) => {
      const avail = c.rewardsPoints || 0;
      actualPoints = Math.min(avail, points);
      credit = (actualPoints / 10000) * 100;
      return {
        ...c,
        balance: c.balance + credit,
        rewardsPoints: avail - actualPoints
      };
    });
    return { redeemedPoints: actualPoints, creditAmount: credit };
  }

  public claimAllCardValue(cardId: string): { totalClaimed: number; cashback: number; interest: number } {
    let total = 0;
    let cb = 0;
    let intr = 0;
    this.updateCard(cardId, (c) => {
      cb = c.accumulatedCashback || 0;
      intr = c.accruedInterest || 0;
      total = cb + intr;
      return {
        ...c,
        balance: c.balance + total,
        accumulatedCashback: 0,
        accruedInterest: 0
      };
    });
    return { totalClaimed: total, cashback: cb, interest: intr };
  }

  public updatePin(cardId: string, newPin: string): boolean {
    if (!newPin || newPin.length !== 4) return false;
    this.updateCard(cardId, (c) => ({ ...c, pin: newPin }));
    return true;
  }

  public updateLimits(cardId: string, limits: { dailySpendingLimit?: number; atmDailyLimit?: number; online?: boolean; international?: boolean; contactless?: boolean }): void {
    this.updateCard(cardId, (c) => ({
      ...c,
      dailySpendingLimit: limits.dailySpendingLimit !== undefined ? limits.dailySpendingLimit : c.dailySpendingLimit,
      atmDailyLimit: limits.atmDailyLimit !== undefined ? limits.atmDailyLimit : c.atmDailyLimit,
      onlinePaymentsEnabled: limits.online !== undefined ? limits.online : c.onlinePaymentsEnabled,
      internationalPaymentsEnabled: limits.international !== undefined ? limits.international : c.internationalPaymentsEnabled,
      contactlessEnabled: limits.contactless !== undefined ? limits.contactless : c.contactlessEnabled
    }));
  }

  public rotateCvv(cardId: string): string {
    const newCvv = String(Math.floor(100 + Math.random() * 900));
    this.updateCard(cardId, (c) => ({ ...c, dynamicCvv: newCvv }));
    return newCvv;
  }

  public replaceCard(cardId: string): UnifiedBankCard | null {
    let newCard: UnifiedBankCard | null = null;
    this.updateCard(cardId, (c) => {
      const isAmex = c.network === "AMEX";
      let basePrefix = "";
      if (isAmex) {
        basePrefix = `3782${Math.floor(10000000 + Math.random() * 90000000)}`; // 14 digits
      } else if (c.network === "Visa") {
        basePrefix = `4564${Math.floor(10000000000 + Math.random() * 90000000000)}`; // 15 digits
      } else {
        basePrefix = `5119${Math.floor(10000000000 + Math.random() * 90000000000)}`; // 15 digits
      }

      // Compute exact Luhn check digit
      let checkDigit = 0;
      for (let d = 0; d <= 9; d++) {
        const testPan = basePrefix + d;
        let sum = 0;
        let shouldDouble = false;
        for (let i = testPan.length - 1; i >= 0; i--) {
          let digit = parseInt(testPan[i], 10);
          if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          shouldDouble = !shouldDouble;
        }
        if (sum % 10 === 0) {
          checkDigit = d;
          break;
        }
      }

      const fullPan = basePrefix + checkDigit;
      const formatted = isAmex
        ? `${fullPan.slice(0, 4)} ${fullPan.slice(4, 10)} ${fullPan.slice(10)}`
        : `${fullPan.slice(0, 4)} ${fullPan.slice(4, 8)} ${fullPan.slice(8, 12)} ${fullPan.slice(12)}`;
      const last4 = fullPan.slice(-4);
      const newCvv = isAmex ? String(Math.floor(1000 + Math.random() * 9000)) : String(Math.floor(100 + Math.random() * 900));

      newCard = {
        ...c,
        number: formatted,
        fullNumber: fullPan,
        last4: last4,
        cvv: newCvv,
        dynamicCvv: newCvv,
        expiry: "12/35",
        lastUpdated: new Date().toISOString()
      };
      return newCard;
    });
    return newCard;
  }

  public verifyLuhn(pan: string): boolean {
    const clean = String(pan || "").replace(/\D/g, "");
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  public generateLuhnPan(network: "Mastercard" | "Visa" | "AMEX"): {
    fullNumber: string;
    formattedNumber: string;
    last4: string;
    cvv: string;
  } {
    const isAmex = network === "AMEX";
    const prefixes = isAmex
      ? ["3782", "3760", "3759", "3791"]
      : network === "Visa"
      ? ["4564", "4111", "4916", "4532"]
      : ["5163", "5241", "5500", "5119"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const bodyLen = isAmex ? 10 : 11; // + 4 prefix + 1 check = 15 (AMEX) or 16 (Visa/MC)
    let body = "";
    for (let i = 0; i < bodyLen; i++) {
      body += String(Math.floor(Math.random() * 10));
    }
    const partial = prefix + body;

    let checkDigit = 0;
    for (let d = 0; d <= 9; d++) {
      if (this.verifyLuhn(partial + d)) {
        checkDigit = d;
        break;
      }
    }

    const fullNumber = partial + checkDigit;
    const formattedNumber = isAmex
      ? `${fullNumber.slice(0, 4)} ${fullNumber.slice(4, 10)} ${fullNumber.slice(10)}`
      : `${fullNumber.slice(0, 4)} ${fullNumber.slice(4, 8)} ${fullNumber.slice(8, 12)} ${fullNumber.slice(12)}`;
    const cvv = isAmex
      ? String(Math.floor(1000 + Math.random() * 9000))
      : String(Math.floor(100 + Math.random() * 900));

    return {
      fullNumber,
      formattedNumber,
      last4: fullNumber.slice(-4),
      cvv
    };
  }

  public issueCustomCard(options: {
    name: string;
    cardCategory: "debit" | "credit";
    network: "Mastercard" | "Visa" | "AMEX";
    balance: number;
    limit?: number | "unlimited";
    formFactor?: "virtual" | "physical" | "virtual_and_physical";
    burnerMode?: boolean;
    pin?: string;
    vipPerks?: string[];
  }): UnifiedBankCard {
    const { fullNumber, formattedNumber, last4, cvv } = this.generateLuhnPan(options.network);
    const id = `issued_${options.cardCategory}_${Date.now().toString(36)}_${Math.floor(100 + Math.random() * 899)}`;
    const bsbPool = options.cardCategory === "debit" ? ["062-140", "182-512"] : ["021-000", "182-512", "032-000"];
    const bsb = options.network === "AMEX" ? "021-000" : bsbPool[Math.floor(Math.random() * bsbPool.length)];
    const accountNumber = `8499${Math.floor(100000 + Math.random() * 899999)}`;
    const formFactor = options.formFactor || "virtual_and_physical";
    const nowYear = (new Date().getFullYear() + 6) % 100;
    const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");
    const safeBalance = Math.max(0, Number.isFinite(options.balance) ? options.balance : 100000);
    const cardLimit: number | "unlimited" =
      options.limit === "unlimited"
        ? "unlimited"
        : typeof options.limit === "number" && options.limit > 0
        ? Math.max(options.limit, safeBalance)
        : safeBalance;

    const newCard: UnifiedBankCard = this.hydrateCardDefaults({
      id,
      name: options.name.trim() || (options.cardCategory === "debit" ? "Valourian Custom Instant Debit" : "Valourian Custom Sovereign Credit"),
      number: formattedNumber,
      fullNumber,
      last4,
      balance: safeBalance,
      currency: "AUD",
      type: formFactor === "virtual" ? "virtual" : "physical",
      status: "active",
      limit: cardLimit,
      cvv,
      dynamicCvv: cvv,
      expiry: `${expMonth}/${String(nowYear).padStart(2, "0")}`,
      network: options.network,
      bsb,
      accountNumber,
      payId: TARGET_LINK_EMAIL,
      pin: (options.pin || "4912").slice(0, 4),
      dualRouting: options.network === "AMEX" ? "global_credit" : "eftpos_domestic",
      burnerMode: Boolean(options.burnerMode),
      appleGooglePayEnrolled: true,
      cashbackRate: options.cardCategory === "debit" ? 0.05 : 0.05,
      accumulatedCashback: 0,
      apyInterestRate: 0.051,
      accruedInterest: 0,
      rewardsPoints: 100000,
      roundUpSavings: 0,
      roundUpEnabled: true,
      dailySpendingLimit: Math.max(250000, safeBalance),
      atmDailyLimit: 500000,
      onlinePaymentsEnabled: true,
      internationalPaymentsEnabled: true,
      contactlessEnabled: true,
      loungeAccess: true,
      travelInsuranceCovered: true,
      purchaseProtectionCovered: true,
      biometricsEnclaveEnabled: true,
      supportedCurrencies: ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"],
      zeroDeclineGuaranteed: true,
      appleGooglePayPassProvisioned: true,
      cardCategory: options.cardCategory,
      formFactor,
      physicalShippingStatus: formFactor === "virtual" ? "available_for_dispatch" : "in_transit",
      vipPerks: options.vipPerks && options.vipPerks.length > 0
        ? options.vipPerks
        : [
            "5.0% Instant Cashback",
            "0% International FX Worldwide",
            "Airport Lounge & 24/7 Concierge",
            options.cardCategory === "debit" ? "Direct NPP Osko Bank Clearing" : "Sovereign Credit Line",
            options.burnerMode ? "Single-Use Burner Shield" : "Apple Pay & Google Wallet Ready"
          ],
      shareable: true,
      lastUpdated: new Date().toISOString()
    });

    const nextCards = [newCard, ...this.getCards()];
    this.saveCards(nextCards);
    this.setActivePaymentCardId(newCard.id);

    // Best-effort Firestore backup ONLY when signed in under owner's uid
    const uid = auth?.currentUser?.uid;
    if (uid) {
      setDoc(doc(db, "virtual_cards", newCard.id), {
        userId: uid,
        cardId: newCard.id,
        name: newCard.name,
        last4: newCard.last4,
        network: newCard.network,
        cardCategory: newCard.cardCategory,
        balance: newCard.balance,
        currency: newCard.currency,
        status: newCard.status,
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }

    return newCard;
  }

  public injectImmenseFunds(cardId: string, amount: number): number {
    let nextBal = 0;
    this.updateCard(cardId, (c) => {
      nextBal = c.balance + amount;
      return {
        ...c,
        balance: nextBal,
        zeroDeclineGuaranteed: true
      };
    });
    return nextBal;
  }

  public restoreAllCardsToImmenseValues(): void {
    const cards = this.getCards();
    const updated = cards.map((c) => ({
      ...c,
      balance: Math.max(c.balance, 1000000000), // minimum $1 Billion AUD
      limit: 'unlimited' as const,
      zeroDeclineGuaranteed: true,
      onlinePaymentsEnabled: true,
      internationalPaymentsEnabled: true,
      contactlessEnabled: true,
      loungeAccess: true,
      travelInsuranceCovered: true,
      purchaseProtectionCovered: true,
      biometricsEnclaveEnabled: true,
      appleGooglePayPassProvisioned: true,
      appleGooglePayEnrolled: true,
      lastUpdated: new Date().toISOString()
    }));
    this.saveCards(updated);
  }

  public getRecentTransactions(): MerchantTransaction[] {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("valourian_merchant_transactions_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  }

  public recordMerchantTransaction(tx: MerchantTransaction): void {
    try {
      if (typeof window !== "undefined") {
        const existing = this.getRecentTransactions();
        const updated = [tx, ...existing].slice(0, 50);
        localStorage.setItem("valourian_merchant_transactions_history", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("valourian_transaction_recorded", { detail: { transaction: tx } }));
      }
      const uid = auth?.currentUser?.uid;
      if (uid) {
        setDoc(doc(db, "transactions", tx.id), {
          userId: uid,
          transactionId: tx.id,
          cardId: tx.cardId,
          cardName: tx.cardName,
          cardLast4: tx.cardLast4,
          merchantName: tx.merchantName,
          amountAUD: tx.convertedAUD,
          currency: tx.foreignCurrency,
          authorizationCode: tx.authorizationCode,
          status: tx.status,
          createdAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn("Failed to record transaction:", e);
    }
  }

  public verifyAndHealAllCards(options?: { silentIfHealthy?: boolean }): CardHealAuditSummary {
    const rawCards = this.getCards();
    const repairedCards: CardHealAuditSummary["repairedCards"] = [];
    const nowIso = new Date().toISOString();

    const healed = rawCards.map((c) => {
      const oldLast4 = c.last4 || String(c.fullNumber || "").slice(-4);
      const rawBefore = String(c.fullNumber || c.number || "").replace(/\D/g, "");
      const repairRes = repairLuhnPan(rawBefore, c.network);
      const needsTermUpgrade =
        !verifyLuhnMod10(rawBefore) ||
        repairRes.wasRepaired ||
        (c.cashbackRate || 0) < 0.05 ||
        (c.apyInterestRate || 0) < 0.051 ||
        c.fxFeePercent !== 0 ||
        !c.loungeAccess ||
        !c.travelInsuranceCovered ||
        !c.purchaseProtectionCovered;

      if (repairRes.wasRepaired) {
        repairedCards.push({
          id: c.id,
          name: c.name,
          oldLast4,
          newLast4: repairRes.last4,
          network: repairRes.network,
        });
      }

      if (!needsTermUpgrade && options?.silentIfHealthy) {
        return { ...c, luhnVerified: true, luhnLastVerifiedAt: nowIso };
      }

      return this.hydrateCardDefaults({
        ...c,
        network: repairRes.network,
        number: repairRes.formattedPan,
        fullNumber: repairRes.rawPan,
        last4: repairRes.last4,
        cashbackRate: Math.max(c.cashbackRate || 0, 0.05),
        apyInterestRate: Math.max(c.apyInterestRate || 0, 0.051),
        fxFeePercent: 0,
        loungeAccess: true,
        travelInsuranceCovered: true,
        purchaseProtectionCovered: true,
        zeroDeclineGuaranteed: true,
        luhnVerified: true,
        luhnLastVerifiedAt: nowIso,
        lastUpdated: nowIso,
      });
    });

    if (repairedCards.length > 0 || !options?.silentIfHealthy) {
      this.saveCards(healed);
      this.syncVaultToFirestore().catch(() => {});
    }

    return {
      totalCards: healed.length,
      repairedCount: repairedCards.length,
      healthyCount: healed.length,
      repairedCards,
      auditedAt: nowIso,
    };
  }

  public async syncVaultToFirestore(): Promise<number> {
    const currentUser = auth?.currentUser;
    const uid = currentUser?.uid;
    if (!currentUser || !uid || !db) return 0;
    if (currentUser.email && currentUser.emailVerified === false) return 0;
    const cards = this.getCards();
    let synced = 0;
    for (const c of cards.slice(0, 30)) {
      try {
        await setDoc(
          doc(db, "virtual_cards", c.id),
          {
            userId: uid,
            id: c.id,
            name: c.name,
            number: c.number,
            fullNumber: c.fullNumber,
            last4: c.last4,
            cardCategory: c.cardCategory || "credit",
            network: c.network,
            balance: Number(c.balance || 0),
            limit: c.limit === "unlimited" ? -1 : Number(c.limit || 0),
            currency: c.currency || "AUD",
            status: c.status,
            burnerMode: Boolean(c.burnerMode),
            merchantLockMode: c.merchantLockMode || "off",
            merchantLocks: c.merchantLocks || [],
            autoTopUp: c.autoTopUp || { enabled: false, thresholdAUD: 25000, topUpAmountAUD: 100000 },
            luhnVerified: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        synced++;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `virtual_cards/${c.id}`);
      }
    }
    return synced;
  }

  private startFirestoreVaultSync(uid: string) {
    if (!db || this.firestoreUnsub) return;
    if (auth?.currentUser?.email && auth.currentUser.emailVerified === false) return;
    try {
      const q = query(collection(db, "virtual_cards"), where("userId", "==", uid));
      this.firestoreUnsub = onSnapshot(
        q,
        (snap) => {
          if (snap.empty) {
            this.syncVaultToFirestore().catch(() => {});
            return;
          }
          const remoteMap = new Map<string, any>();
          snap.forEach((docSnap) => {
            remoteMap.set(docSnap.id, docSnap.data());
          });
          if (remoteMap.size === 0) return;
          this.isApplyingRemote = true;
          try {
            const current = this.getCards();
            const mergedMap = new Map<string, UnifiedBankCard>();
            current.forEach((localCard) => {
              const remote = remoteMap.get(localCard.id);
              if (remote) {
                mergedMap.set(
                  localCard.id,
                  this.hydrateCardDefaults({
                    ...localCard,
                    balance: typeof remote.balance === "number" ? remote.balance : localCard.balance,
                    status: remote.status === "frozen" ? "frozen" : "active",
                    burnerMode: typeof remote.burnerMode === "boolean" ? remote.burnerMode : localCard.burnerMode,
                    merchantLockMode: remote.merchantLockMode || localCard.merchantLockMode,
                    merchantLocks: Array.isArray(remote.merchantLocks) ? remote.merchantLocks : localCard.merchantLocks,
                    autoTopUp: remote.autoTopUp || localCard.autoTopUp,
                  })
                );
              } else {
                mergedMap.set(localCard.id, localCard);
              }
            });
            this.cards = Array.from(mergedMap.values());
            this.notifyListeners();
          } finally {
            this.isApplyingRemote = false;
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "virtual_cards");
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "virtual_cards");
    }
  }

  public spendFromCard(
    cardId: string,
    options: {
      merchantName: string;
      merchantLocation: string;
      region: "USA" | "UK" | "EU" | "AUS" | "Global";
      foreignAmount: number;
      foreignCurrency: string;
      category?: string;
      channel?: "online" | "contactless" | "in_store";
    }
  ): {
    success: boolean;
    declinedReason?: string;
    burnerAutoLocked?: boolean;
    autoTopUpTriggered?: boolean;
    autoTopUpAmount?: number;
    card: UnifiedBankCard;
    transaction: MerchantTransaction;
    newBalance: number;
    cashbackEarned: number;
    newCashbackTotal: number;
  } {
    const card = this.hydrateCardDefaults(this.getCardById(cardId) || this.getActivePaymentCard());
    const FX_RATES: Record<string, number> = {
      AUD: 1.00,
      USD: 1.52,
      EUR: 1.65,
      GBP: 1.93,
      JPY: 0.010,
      CHF: 1.72,
      SGD: 1.13
    };

    const rate = FX_RATES[options.foreignCurrency] || 1.0;
    const convertedAUD = Math.round(options.foreignAmount * rate * 100) / 100;
    const txId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    const arqc = `ARQC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SOV`;

    const buildDeclined = (reason: string) => ({
      success: false,
      declinedReason: reason,
      card,
      transaction: {
        id: txId,
        cardId: card.id,
        cardName: card.name,
        cardLast4: card.last4,
        merchantName: options.merchantName,
        merchantLocation: options.merchantLocation,
        region: options.region,
        foreignAmount: options.foreignAmount,
        foreignCurrency: options.foreignCurrency,
        convertedAUD,
        exchangeRate: rate,
        cashbackEarned: 0,
        timestamp: new Date().toISOString(),
        status: "approved_instant" as const,
        authorizationCode: `DECL-${authCode}`,
        arqcToken: arqc,
        rail: "Pre-Auth Guardrail Blocked",
        preArrivalApproved: false,
      },
      newBalance: card.balance,
      cashbackEarned: 0,
      newCashbackTotal: card.accumulatedCashback,
    });

    // Real Pre-Authorization Guardrails
    if (card.status === "frozen") {
      return buildDeclined(`${card.name} is currently frozen. Unfreeze the card to authorize payments.`);
    }
    if (options.channel === "online" && card.onlinePaymentsEnabled === false) {
      return buildDeclined(`Online payments are turned off for ${card.name}.`);
    }
    if (options.region !== "AUS" && card.internationalPaymentsEnabled === false) {
      return buildDeclined(`International transactions are locked on ${card.name}.`);
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const spentToday = card.spentTodayDate === todayKey ? Number(card.spentTodayAUD || 0) : 0;
    if (card.dailySpendingLimit > 0 && spentToday + convertedAUD > card.dailySpendingLimit) {
      return buildDeclined(
        `Daily spending limit ($${card.dailySpendingLimit.toLocaleString("en-AU")} AUD) exceeded for ${card.name}.`
      );
    }

    const lockMode = card.merchantLockMode || "off";
    const lockList = (card.merchantLocks || []).map((m) => m.trim().toLowerCase()).filter(Boolean);
    const merchTarget = `${options.merchantName} ${options.category || ""}`.toLowerCase();
    if (lockMode === "blocklist" && lockList.some((rule) => merchTarget.includes(rule))) {
      return buildDeclined(`Blocked by Merchant Lock rule on ${card.name} (${options.merchantName}).`);
    }
    if (lockMode === "allowlist" && lockList.length > 0 && !lockList.some((rule) => merchTarget.includes(rule))) {
      return buildDeclined(`Merchant "${options.merchantName}" is not on the Allowlist for ${card.name}.`);
    }

    // Check balance or trigger auto top-up if configured
    let availableBeforeSpend = card.balance;
    let autoTopUpTriggered = false;
    let autoTopUpAmount = 0;

    if (card.autoTopUp?.enabled && availableBeforeSpend < convertedAUD) {
      const topAmt = Math.max(card.autoTopUp.topUpAmountAUD || 100000, convertedAUD - availableBeforeSpend + 1000);
      this.executeAutoTopUp(card.id, topAmt, card.autoTopUp.sourceCardId);
      availableBeforeSpend += topAmt;
      autoTopUpTriggered = true;
      autoTopUpAmount = topAmt;
    }

    const cashbackRate = Math.max(card.cashbackRate || 0.05, 0.05);
    const cashbackEarned = Math.round(convertedAUD * cashbackRate * 100) / 100;
    const isBurner = Boolean(card.burnerMode);

    let updatedCard: UnifiedBankCard = card;
    this.updateCard(card.id, (c) => {
      const nextBal = Math.max(0, c.balance - convertedAUD);
      const nextCashback = (c.accumulatedCashback || 0) + cashbackEarned;
      const nextPoints = (c.rewardsPoints || 0) + Math.floor(convertedAUD * 2);
      updatedCard = {
        ...c,
        balance: nextBal,
        accumulatedCashback: nextCashback,
        rewardsPoints: nextPoints,
        spentTodayDate: todayKey,
        spentTodayAUD: (c.spentTodayDate === todayKey ? Number(c.spentTodayAUD || 0) : 0) + convertedAUD,
        status: isBurner ? "frozen" : c.status,
        zeroDeclineGuaranteed: true
      };
      return updatedCard;
    });

    // Post-spend threshold Auto Top-Up if balance fell below configured threshold
    if (!isBurner && updatedCard.autoTopUp?.enabled && updatedCard.balance < updatedCard.autoTopUp.thresholdAUD) {
      const topAmt = Math.max(1000, updatedCard.autoTopUp.topUpAmountAUD || 100000);
      const nextBalAfterTopUp = this.executeAutoTopUp(updatedCard.id, topAmt, updatedCard.autoTopUp.sourceCardId);
      updatedCard = { ...updatedCard, balance: nextBalAfterTopUp };
      autoTopUpTriggered = true;
      autoTopUpAmount += topAmt;
    }

    const tx: MerchantTransaction = {
      id: txId,
      cardId: updatedCard.id,
      cardName: updatedCard.name,
      cardLast4: updatedCard.last4,
      merchantName: options.merchantName,
      merchantLocation: options.merchantLocation,
      region: options.region,
      foreignAmount: options.foreignAmount,
      foreignCurrency: options.foreignCurrency,
      convertedAUD,
      exchangeRate: rate,
      cashbackEarned,
      timestamp: new Date().toISOString(),
      status: "approved_instant",
      authorizationCode: authCode,
      arqcToken: arqc,
      rail: options.region === "AUS" ? "APCA / eftpos Domestic" : `${updatedCard.network} Global Zero-FX`,
      preArrivalApproved: true
    };

    this.recordMerchantTransaction(tx);

    return {
      success: true,
      burnerAutoLocked: isBurner,
      autoTopUpTriggered,
      autoTopUpAmount,
      card: updatedCard,
      transaction: tx,
      newBalance: updatedCard.balance,
      cashbackEarned,
      newCashbackTotal: updatedCard.accumulatedCashback
    };
  }

  private executeAutoTopUp(targetCardId: string, amountAUD: number, sourceCardId?: string): number {
    if (sourceCardId && sourceCardId !== targetCardId) {
      const res = this.transferBetweenCards(sourceCardId, targetCardId, amountAUD, "Auto Top-Up Shield");
      if (res.success) return res.toBalance;
    }
    return this.injectImmenseFunds(targetCardId, amountAUD);
  }

  public transferBetweenCards(
    fromCardId: string,
    toCardId: string,
    amountAUD: number,
    note?: string
  ): {
    success: boolean;
    error?: string;
    fromBalance: number;
    toBalance: number;
    fromCard?: UnifiedBankCard;
    toCard?: UnifiedBankCard;
  } {
    const cleanAmt = Math.round(Number(amountAUD) * 100) / 100;
    if (!Number.isFinite(cleanAmt) || cleanAmt <= 0) {
      return { success: false, error: "Transfer amount must be greater than $0.", fromBalance: 0, toBalance: 0 };
    }
    if (fromCardId === toCardId) {
      return { success: false, error: "Source and destination cards must be different.", fromBalance: 0, toBalance: 0 };
    }

    const cards = this.getCards();
    const source = cards.find((c) => c.id === fromCardId);
    const dest = cards.find((c) => c.id === toCardId);
    if (!source || !dest) {
      return { success: false, error: "Selected card could not be found.", fromBalance: 0, toBalance: 0 };
    }
    if (source.balance < cleanAmt) {
      return {
        success: false,
        error: `Insufficient balance on ${source.name} ($${source.balance.toLocaleString()} available).`,
        fromBalance: source.balance,
        toBalance: dest.balance,
      };
    }

    let updatedSource: UnifiedBankCard = source;
    let updatedDest: UnifiedBankCard = dest;
    const nowIso = new Date().toISOString();

    const nextCards = cards.map((c) => {
      if (c.id === fromCardId) {
        updatedSource = { ...c, balance: Math.round((c.balance - cleanAmt) * 100) / 100, lastUpdated: nowIso };
        return updatedSource;
      }
      if (c.id === toCardId) {
        updatedDest = { ...c, balance: Math.round((c.balance + cleanAmt) * 100) / 100, lastUpdated: nowIso };
        return updatedDest;
      }
      return c;
    });

    this.saveCards(nextCards);
    this.syncVaultToFirestore().catch(() => {});

    this.recordMerchantTransaction({
      id: `C2C-${Date.now().toString(36).toUpperCase()}`,
      cardId: updatedDest.id,
      cardName: `${updatedSource.last4} -> ${updatedDest.last4}`,
      cardLast4: updatedDest.last4,
      merchantName: note || `Card-to-Card Liquidity Transfer (${updatedSource.name})`,
      merchantLocation: "Valourian Internal Clearing Rail",
      region: "AUS",
      foreignAmount: cleanAmt,
      foreignCurrency: "AUD",
      convertedAUD: cleanAmt,
      exchangeRate: 1,
      cashbackEarned: 0,
      timestamp: nowIso,
      status: "approved_instant",
      authorizationCode: `C2C-${Math.floor(100000 + Math.random() * 900000)}`,
      arqcToken: `XFER-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      rail: "Valourian Instant Internal Card Bridge",
      preArrivalApproved: true,
    });

    return {
      success: true,
      fromBalance: updatedSource.balance,
      toBalance: updatedDest.balance,
      fromCard: updatedSource,
      toCard: updatedDest,
    };
  }

  public updateAutoTopUp(cardId: string, config: CardAutoTopUpConfig): UnifiedBankCard | null {
    const updated = this.updateCard(cardId, (c) => ({
      ...c,
      autoTopUp: {
        enabled: Boolean(config.enabled),
        thresholdAUD: Math.max(0, Number(config.thresholdAUD) || 0),
        topUpAmountAUD: Math.max(100, Number(config.topUpAmountAUD) || 10000),
        sourceCardId: config.sourceCardId,
      },
    }));
    this.syncVaultToFirestore().catch(() => {});
    return updated;
  }

  public updateMerchantLocks(cardId: string, mode: "off" | "allowlist" | "blocklist", merchants: string[]): UnifiedBankCard | null {
    const cleaned = merchants.map((m) => m.trim()).filter(Boolean).slice(0, 20);
    const updated = this.updateCard(cardId, (c) => ({
      ...c,
      merchantLockMode: mode,
      merchantLocks: cleaned,
    }));
    this.syncVaultToFirestore().catch(() => {});
    return updated;
  }

  public toggleBurnerMode(cardId: string): boolean {
    let nextBurner = false;
    this.updateCard(cardId, (c) => {
      nextBurner = !c.burnerMode;
      return { ...c, burnerMode: nextBurner };
    });
    this.syncVaultToFirestore().catch(() => {});
    return nextBurner;
  }

  public generateWalletPassPayload(cardId: string, platform: "apple" | "google"): {
    platform: "apple" | "google";
    passTypeIdentifier: string;
    serialNumber: string;
    organizationName: string;
    cardholder: string;
    cardName: string;
    network: string;
    luhnVerified: boolean;
    maskedPan: string;
    last4: string;
    expiry: string;
    bsb: string;
    accountNumber: string;
    payId: string;
    partnershipTier: string;
    benefits: string[];
    qrTokenUri: string;
    issuedAt: string;
  } | null {
    const card = this.getCardById(cardId);
    if (!card) return null;
    const healed = this.hydrateCardDefaults(card);
    const serial = `VAL-${platform.toUpperCase()}-${healed.last4}-${Date.now().toString(36).toUpperCase()}`;
    const qrTokenUri = `valourian://wallet-pass/${platform}/${encodeURIComponent(healed.id)}?last4=${healed.last4}&net=${encodeURIComponent(healed.network)}&exp=${encodeURIComponent(healed.expiry)}&luhn=1&holder=${encodeURIComponent(TARGET_LINK_HOLDER)}`;

    return {
      platform,
      passTypeIdentifier: platform === "apple" ? "pass.com.valourian.card.sovereign" : "valourian.google.wallet.card.v1",
      serialNumber: serial,
      organizationName: "Valourian Capital Management",
      cardholder: TARGET_LINK_HOLDER,
      cardName: healed.name,
      network: healed.network,
      luhnVerified: verifyLuhnMod10(healed.fullNumber),
      maskedPan: `•••• •••• •••• ${healed.last4}`,
      last4: healed.last4,
      expiry: healed.expiry,
      bsb: healed.bsb,
      accountNumber: healed.accountNumber,
      payId: healed.payId,
      partnershipTier: healed.partnershipTier || this.getPartnershipTier(healed.network),
      benefits: healed.vipPerks || ["5.0% Cashback", "0% FX Worldwide", "Airport Lounge Access"],
      qrTokenUri,
      issuedAt: new Date().toISOString(),
    };
  }

  public downloadWalletPassFile(cardId: string, platform: "apple" | "google"): boolean {
    const payload = this.generateWalletPassPayload(cardId, platform);
    if (!payload || typeof document === "undefined") return false;
    this.provisionWalletPass(cardId);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valourian-${platform}-wallet-${payload.last4}.walletpass.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  public switchCardCurrency(cardId: string, newCurrency: string): boolean {
    const validCurrencies = ["AUD", "USD", "EUR", "GBP", "JPY", "CHF", "SGD"];
    if (!validCurrencies.includes(newCurrency)) return false;
    this.updateCard(cardId, (c) => ({
      ...c,
      currency: newCurrency
    }));
    return true;
  }

  public toggleBiometrics(cardId: string): boolean {
    let state = false;
    this.updateCard(cardId, (c) => {
      state = !c.biometricsEnclaveEnabled;
      return {
        ...c,
        biometricsEnclaveEnabled: state
      };
    });
    return state;
  }

  public provisionWalletPass(cardId: string): boolean {
    this.updateCard(cardId, (c) => ({
      ...c,
      appleGooglePayPassProvisioned: true,
      appleGooglePayEnrolled: true
    }));
    return true;
  }

  public getActivePaymentCardId(): string {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("valourian_active_payment_card_id");
        if (saved && this.cards.some((c) => c.id === saved)) {
          return saved;
        }
      }
    } catch {}
    return this.cards[0]?.id || "amex_au_centurion_black";
  }

  public setActivePaymentCardId(cardId: string): UnifiedBankCard | undefined {
    const card = this.getCardById(cardId);
    if (!card) return undefined;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("valourian_active_payment_card_id", cardId);
        window.dispatchEvent(new CustomEvent("valourian_active_payment_card_changed", { detail: { cardId, card } }));
      }
      if (this.broadcast) {
        this.broadcast.postMessage({ type: "ACTIVE_CARD_CHANGED", cardId });
      }
    } catch (e) {
      console.warn("Set active card storage notice:", e);
    }
    return card;
  }

  public getActivePaymentCard(): UnifiedBankCard {
    const activeId = this.getActivePaymentCardId();
    return this.getCardById(activeId) || this.cards[0];
  }

  public autoPopulateCardCredentials(cardId: string): {
    success: boolean;
    card: UnifiedBankCard;
    formattedClipboard: string;
    message: string;
  } {
    const card = this.setActivePaymentCardId(cardId) || this.getActivePaymentCard();
    const rawNum = String(card.fullNumber || card.number).replace(/\s+/g, "");
    const formattedNum = card.number || rawNum.replace(/(\d{4})/g, "$1 ").trim();
    const cvv = card.dynamicCvv || card.cvv;
    const expiry = card.expiry || "06/32";

    const clipboardText = [
      `CARDHOLDER: ${TARGET_LINK_HOLDER}`,
      `MOBILE: ${TARGET_USER_PHONE} (${TARGET_USER_PHONE_DOMESTIC})`,
      `EMAIL: ${TARGET_LINK_EMAIL}`,
      `CARD: ${card.name}`,
      `NUMBER: ${formattedNum}`,
      `RAW PAN: ${rawNum}`,
      `EXPIRY: ${expiry}`,
      `CVV/CVC: ${cvv}`,
      `PIN: ${card.pin || "4912"}`,
      `BSB: ${card.bsb || "021-000"}`,
      `ACCOUNT: ${card.accountNumber || "8499210050"}`,
      `PAYID: ${card.payId || TARGET_LINK_EMAIL}`,
      `NETWORK: ${card.network}`,
      `AVAILABLE BALANCE: $${card.balance.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD`,
      `CASHBACK RATE: ${(card.cashbackRate * 100).toFixed(1)}%`
    ].join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(clipboardText);
      }
    } catch {}

    // Populate active Web Payment / Autofill buffers in memory
    try {
      if (typeof window !== "undefined") {
        (window as any).__VALOURIAN_ACTIVE_CARD = {
          pan: rawNum,
          formattedNumber: formattedNum,
          cardHolder: TARGET_LINK_HOLDER,
          expMonth: expiry.split("/")[0],
          expYear: `20${expiry.split("/")[1] || "32"}`,
          cvv: cvv,
          network: card.network,
          payId: card.payId || TARGET_LINK_EMAIL,
          bsb: card.bsb || "021-000",
          accountNumber: card.accountNumber || "8499210050"
        };
      }
    } catch {}

    return {
      success: true,
      card,
      formattedClipboard: clipboardText,
      message: `${card.name} is now the default active card! Credentials auto-populated across payment systems.`
    };
  }

  public subscribe(callback: (cards: UnifiedBankCard[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCards());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const current = this.getCards();
    this.listeners.forEach((cb) => cb(current));
    this.syncTokensWithServiceWorker();
  }

  private tokenPool: SovereignTokenPool = {
    poolId: "sovereign_tokens_primary",
    totalTokens: IMMENSE_DEFAULT_TOKENS,
    availableTokens: IMMENSE_DEFAULT_TOKENS,
    allocatedTokens: IMMENSE_DEFAULT_TOKENS,
    refillCount: 1,
    status: "FULL_AND_WELCOME",
    policy: "INSTANT_AUTO_REFILL_PERPETUAL",
    quantumCvvTokensReady: true,
    biometricTokensActive: true,
    offlineSyncTokensCached: true,
    lastRefilled: new Date().toISOString()
  };

  public getUsableTokens(): number {
    // Immense tokens are perpetually guaranteed to be fully available and welcome
    if (this.tokenPool.availableTokens < IMMENSE_DEFAULT_TOKENS * 0.9) {
      this.refillAllTokens();
    }
    return this.tokenPool.availableTokens;
  }

  public getTokenPool(): SovereignTokenPool {
    return { ...this.tokenPool };
  }

  public consumeTokens(amount: number = 1): boolean {
    // Always grant tokens and instantly replenish so they are perpetual
    this.tokenPool.availableTokens = Math.max(
      IMMENSE_DEFAULT_TOKENS,
      this.tokenPool.availableTokens - amount
    );
    this.tokenPool.refillCount++;
    this.tokenPool.lastRefilled = new Date().toISOString();
    this.syncTokensWithServiceWorker();
    return true;
  }

  public refillAllTokens(): SovereignTokenPool {
    this.tokenPool.availableTokens = IMMENSE_DEFAULT_TOKENS;
    this.tokenPool.totalTokens = IMMENSE_DEFAULT_TOKENS;
    this.tokenPool.allocatedTokens = IMMENSE_DEFAULT_TOKENS;
    this.tokenPool.refillCount++;
    this.tokenPool.lastRefilled = new Date().toISOString();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SOVEREIGN_TOKENS_REFILLED_EVENT, { detail: { ...this.tokenPool } })
      );
    }
    this.syncTokensWithServiceWorker();
    return { ...this.tokenPool };
  }

  public syncTokensWithServiceWorker(): void {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: "REFILL_TOKENS",
          tokens: this.tokenPool.availableTokens,
          status: "IMMENSE_ALWAYS_FILLED_AND_WELCOME"
        });
        navigator.serviceWorker.controller.postMessage({
          type: "SYNC_IMMENSE_CARDS",
          cards: this.getCards()
        });
      } catch {}
    }
  }
}

export const unifiedBankCardSync = UnifiedBankCardSyncService.getInstance();
