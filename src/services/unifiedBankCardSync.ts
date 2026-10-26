/**
 * UNIFIED BANK CARD SYNCHRONIZATION SERVICE
 * Unifies all card stores across Valourian OS, RapidPay, Uber, UberEats, Booking, and Store.
 * Ensures consistent cards, live balances, cashback rewards, daily interest, and classic features everywhere.
 */

import { db } from "../firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

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
  
  // Value Gaining Features
  cashbackRate: number; // e.g. 0.05 for 5.0%
  accumulatedCashback: number; // e.g. 48950.00
  apyInterestRate: number; // e.g. 0.051 for 5.10% p.a.
  accruedInterest: number; // e.g. 38200.00
  rewardsPoints: number; // e.g. 2450000
  roundUpSavings?: number;
  roundUpEnabled?: boolean;
  
  // Classic Security & Spending Controls
  dailySpendingLimit: number;
  atmDailyLimit: number;
  onlinePaymentsEnabled: boolean;
  internationalPaymentsEnabled: boolean;
  contactlessEnabled: boolean;
  
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
  
  lastUpdated: string;
}

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
    balance: 500000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 500000000,
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
    cashbackRate: 0.035,
    accumulatedCashback: 22100.00,
    apyInterestRate: 0.051,
    accruedInterest: 19800.00,
    rewardsPoints: 1250000,
    roundUpSavings: 3120.00,
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
    balance: 750000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 750000000,
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
    cashbackRate: 0.035,
    accumulatedCashback: 31400.00,
    apyInterestRate: 0.051,
    accruedInterest: 28500.00,
    rewardsPoints: 1890000,
    roundUpSavings: 5890.00,
    roundUpEnabled: true,
    dailySpendingLimit: 20000000,
    atmDailyLimit: 300000,
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
    balance: 600000000,
    currency: "AUD",
    type: "virtual",
    status: "active",
    limit: 600000000,
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
    cashbackRate: 0.035,
    accumulatedCashback: 18200.00,
    apyInterestRate: 0.051,
    accruedInterest: 21400.00,
    rewardsPoints: 1420000,
    roundUpSavings: 2750.00,
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
  }
];

export class UnifiedBankCardSyncService {
  private static instance: UnifiedBankCardSyncService;
  private cards: UnifiedBankCard[] = [];
  private listeners: Set<(cards: UnifiedBankCard[]) => void> = new Set();
  private broadcast: BroadcastChannel | null = null;

  private constructor() {
    this.cards = this.loadLocalCache();

    // Listen across browser tabs
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcast = new BroadcastChannel("valourian_cards_sync_channel");
        this.broadcast.onmessage = (event) => {
          if (event.data?.type === "CARDS_UPDATED" && Array.isArray(event.data.cards)) {
            this.cards = event.data.cards;
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
    }
  }

  public static getInstance(): UnifiedBankCardSyncService {
    if (!UnifiedBankCardSyncService.instance) {
      UnifiedBankCardSyncService.instance = new UnifiedBankCardSyncService();
    }
    return UnifiedBankCardSyncService.instance;
  }

  private loadLocalCache(): UnifiedBankCard[] {
    try {
      if (typeof window === "undefined") return MASTER_BANK_CARDS;
      const cached = localStorage.getItem("valourian_unified_master_cards_v1");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge newly introduced cards
          const map = new Map<string, UnifiedBankCard>();
          parsed.forEach((c: any) => map.set(c.id, c));
          MASTER_BANK_CARDS.forEach((m) => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          return Array.from(map.values());
        }
      }
    } catch {}
    return MASTER_BANK_CARDS;
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
  }
}

export const unifiedBankCardSync = UnifiedBankCardSyncService.getInstance();
