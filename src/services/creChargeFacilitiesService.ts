/**
 * CRECHARGEFACILITIES SERVICE
 * Unified Revolving Credit Facilities & Corporate Charge Cards engine.
 * Synchronizes institutional credit & charge lines across RapidPay, Treasury,
 * SovereignStore, UberApp, UberEatsApp, BookingApp, and Cloud Firestore.
 */

import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, doc, getDocs, onSnapshot, query, setDoc, serverTimestamp, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { TARGET_LINK_HOLDER } from "./unifiedBankCardSync";

export type CreFacilityType = "revolving_prime" | "corporate_charge" | "fleet_operational" | "custom";

export interface CreChargeFacility {
  id: string;
  facilityName: string;
  facilityCode: string;
  facilityType: CreFacilityType;
  network: "CreCharge Sovereign" | "AMEX Charge" | "Mastercard Commercial" | "Visa Institutional";
  holderName: string;
  totalLimitAUD: number;
  drawnAmountAUD: number;
  availableCreditAUD: number;
  primeAprPercent: number;
  interestFreeDays: number;
  collateralCoverageRatio: string;
  status: "active" | "paused";
  autoSettleAccount: string;
  autoReplenish: boolean;
  linkedCardLast4: string;
  acceptedStores: string[];
  updatedAt: string;
}

export interface CreFacilityEvent {
  eventId: string;
  facilityId: string;
  facilityName: string;
  action: "store_charge" | "drawdown" | "repayment" | "limit_increase" | "facility_created";
  amountAUD: number;
  merchantName: string;
  storeApp: string;
  authCode: string;
  reference: string;
  timestamp: string;
}

const FACILITIES_STORAGE_KEY = "valourian_crecharge_facilities_v2";
const FACILITY_EVENTS_STORAGE_KEY = "valourian_crecharge_events_v2";
const ACTIVE_FACILITY_ID_KEY = "valourian_active_crecharge_facility_id";
export const CRECHARGE_UPDATED_EVENT = "valourian_crecharge_updated";

const DEFAULT_CRECHARGE_FACILITIES: CreChargeFacility[] = [
  {
    id: "cre_prime_500m",
    facilityName: "Valourian Revolving Prime Facility",
    facilityCode: "CRE-PRIME-500M",
    facilityType: "revolving_prime",
    network: "CreCharge Sovereign",
    holderName: TARGET_LINK_HOLDER,
    totalLimitAUD: 500_000_000,
    drawnAmountAUD: 45_000_000,
    availableCreditAUD: 455_000_000,
    primeAprPercent: 1.80,
    interestFreeDays: 60,
    collateralCoverageRatio: "2,040%",
    status: "active",
    autoSettleAccount: "CommBank Smart Access (062-140 • 11680690)",
    autoReplenish: true,
    linkedCardLast4: "7712",
    acceptedStores: ["SovereignStore", "Uber", "UberEats", "Booking", "RapidPay", "POS", "All Gateways"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cre_charge_centurion",
    facilityName: "CreCharge Black Corporate Charge Line",
    facilityCode: "CRE-CHARGE-BLK",
    facilityType: "corporate_charge",
    network: "AMEX Charge",
    holderName: TARGET_LINK_HOLDER,
    totalLimitAUD: 250_000_000,
    drawnAmountAUD: 0,
    availableCreditAUD: 250_000_000,
    primeAprPercent: 0.0,
    interestFreeDays: 55,
    collateralCoverageRatio: "4,080%",
    status: "active",
    autoSettleAccount: "Valourian AUD Primary Vault",
    autoReplenish: true,
    linkedCardLast4: "3005",
    acceptedStores: ["SovereignStore", "Uber", "UberEats", "Booking", "RapidPay", "POS", "All Gateways"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cre_fleet_operational",
    facilityName: "Aura & ScotPac Operational Fleet Facility",
    facilityCode: "CRE-FLEET-OPS",
    facilityType: "fleet_operational",
    network: "Mastercard Commercial",
    holderName: TARGET_LINK_HOLDER,
    totalLimitAUD: 50_000_000,
    drawnAmountAUD: 0,
    availableCreditAUD: 50_000_000,
    primeAprPercent: 2.15,
    interestFreeDays: 45,
    collateralCoverageRatio: "1,650%",
    status: "active",
    autoSettleAccount: "CBA VAL Business (062-151 • 10559938)",
    autoReplenish: true,
    linkedCardLast4: "5100",
    acceptedStores: ["SovereignStore", "Uber", "UberEats", "Booking", "RapidPay", "POS", "All Gateways"],
    updatedAt: new Date().toISOString(),
  },
];

function sanitizeId(raw: string): string {
  return String(raw || "id").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

class CreChargeFacilitiesService {
  private static instance: CreChargeFacilitiesService;
  private facilities: CreChargeFacility[] = [];
  private events: CreFacilityEvent[] = [];
  private listeners = new Set<(facilities: CreChargeFacility[]) => void>();
  private firestoreUnsub: (() => void) | null = null;
  private initialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): CreChargeFacilitiesService {
    if (!CreChargeFacilitiesService.instance) {
      CreChargeFacilitiesService.instance = new CreChargeFacilitiesService();
    }
    return CreChargeFacilitiesService.instance;
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;
    this.facilities = this.loadLocalFacilities();
    this.events = this.loadLocalEvents();

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === FACILITIES_STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.facilities = parsed.map((f) => this.normalizeFacility(f));
              this.notify();
            }
          } catch {}
        }
      });

      onAuthStateChanged(auth, (user) => {
        if (this.firestoreUnsub) {
          this.firestoreUnsub();
          this.firestoreUnsub = null;
        }
        if (user) {
          this.attachFirestoreSync(user.uid);
        }
      });
    }
  }

  private normalizeFacility(raw: Partial<CreChargeFacility>): CreChargeFacility {
    const totalLimit = typeof raw.totalLimitAUD === "number" && raw.totalLimitAUD > 0 ? raw.totalLimitAUD : 50_000_000;
    const drawn = typeof raw.drawnAmountAUD === "number" && raw.drawnAmountAUD >= 0 ? raw.drawnAmountAUD : 0;
    const available = Math.max(0, totalLimit - drawn);
    return {
      id: raw.id || `cre_${Date.now()}`,
      facilityName: raw.facilityName || "CreCharge Sovereign Facility",
      facilityCode: raw.facilityCode || "CRE-SOV-LINE",
      facilityType: raw.facilityType || "revolving_prime",
      network: raw.network || "CreCharge Sovereign",
      holderName: raw.holderName || TARGET_LINK_HOLDER,
      totalLimitAUD: totalLimit,
      drawnAmountAUD: drawn,
      availableCreditAUD: available,
      primeAprPercent: typeof raw.primeAprPercent === "number" ? raw.primeAprPercent : 1.80,
      interestFreeDays: typeof raw.interestFreeDays === "number" ? raw.interestFreeDays : 55,
      collateralCoverageRatio: raw.collateralCoverageRatio || "2,040%",
      status: raw.status === "paused" ? "paused" : "active",
      autoSettleAccount: raw.autoSettleAccount || "CommBank Smart Access (062-140 • 11680690)",
      autoReplenish: raw.autoReplenish !== false,
      linkedCardLast4: raw.linkedCardLast4 || "7712",
      acceptedStores: Array.isArray(raw.acceptedStores) && raw.acceptedStores.length > 0
        ? raw.acceptedStores
        : ["SovereignStore", "Uber", "UberEats", "Booking", "RapidPay", "POS", "All Gateways"],
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  private loadLocalFacilities(): CreChargeFacility[] {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(FACILITIES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((f) => this.normalizeFacility(f));
          }
        }
      }
    } catch {}
    const seeded = DEFAULT_CRECHARGE_FACILITIES.map((f) => this.normalizeFacility(f));
    this.saveLocalFacilities(seeded);
    return seeded;
  }

  private saveLocalFacilities(list: CreChargeFacility[]) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {}
  }

  private loadLocalEvents(): CreFacilityEvent[] {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(FACILITY_EVENTS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.slice(0, 60);
        }
      }
    } catch {}
    return [];
  }

  private saveLocalEvents(list: CreFacilityEvent[]) {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(FACILITY_EVENTS_STORAGE_KEY, JSON.stringify(list.slice(0, 60)));
      }
    } catch {}
  }

  private attachFirestoreSync(uid: string) {
    try {
      const q = query(collection(db, "credit_facilities"), where("userId", "==", uid));
      this.firestoreUnsub = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            this.syncAllToFirestore(uid).catch(() => {});
            return;
          }
          const byId = new Map<string, CreChargeFacility>();
          this.facilities.forEach((f) => byId.set(f.id, f));
          snapshot.forEach((docSnap) => {
            const d = docSnap.data() as any;
            const norm = this.normalizeFacility({ ...d, id: d.facilityId || docSnap.id });
            byId.set(norm.id, norm);
          });
          this.facilities = Array.from(byId.values());
          this.saveLocalFacilities(this.facilities);
          this.notify();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "credit_facilities");
        }
      );
    } catch {}
  }

  public async syncAllToFirestore(uidOverride?: string) {
    const uid = uidOverride || auth.currentUser?.uid;
    if (!uid) return;
    await Promise.all(
      this.facilities.map(async (f) => {
        const docId = sanitizeId(`${uid}_${f.id}`);
        try {
          await setDoc(
            doc(db, "credit_facilities", docId),
            {
              facilityId: sanitizeId(f.id),
              userId: uid,
              facilityName: f.facilityName.slice(0, 140),
              facilityCode: f.facilityCode.slice(0, 64),
              facilityType: f.facilityType,
              network: f.network.slice(0, 64),
              holderName: f.holderName.slice(0, 120),
              totalLimitAUD: Number(f.totalLimitAUD) || 0,
              drawnAmountAUD: Number(f.drawnAmountAUD) || 0,
              availableCreditAUD: Number(f.availableCreditAUD) || 0,
              primeAprPercent: Number(f.primeAprPercent) || 0,
              interestFreeDays: Number(f.interestFreeDays) || 0,
              status: f.status,
              autoReplenish: Boolean(f.autoReplenish),
              linkedCardLast4: String(f.linkedCardLast4 || "7712").slice(0, 8),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `credit_facilities/${docId}`);
        }
      })
    );
  }

  private async logFacilityEventToFirestore(ev: CreFacilityEvent) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const docId = sanitizeId(ev.eventId);
    try {
      await setDoc(doc(db, "facility_events", docId), {
        eventId: docId,
        userId: uid,
        facilityId: sanitizeId(ev.facilityId),
        facilityName: ev.facilityName.slice(0, 140),
        action: ev.action,
        amountAUD: Number(ev.amountAUD) || 0,
        merchantName: ev.merchantName.slice(0, 160),
        storeApp: ev.storeApp.slice(0, 64),
        authCode: ev.authCode.slice(0, 64),
        reference: ev.reference.slice(0, 120),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `facility_events/${docId}`);
    }
  }

  public getFacilities(): CreChargeFacility[] {
    return this.facilities.map((f) => ({ ...f, acceptedStores: [...f.acceptedStores] }));
  }

  public getEvents(): CreFacilityEvent[] {
    return [...this.events];
  }

  public getFacilityById(id: string): CreChargeFacility | undefined {
    const found = this.facilities.find((f) => f.id === id);
    return found ? { ...found, acceptedStores: [...found.acceptedStores] } : undefined;
  }

  public getActiveFacilityId(): string {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(ACTIVE_FACILITY_ID_KEY);
        if (saved && this.facilities.some((f) => f.id === saved && f.status === "active")) {
          return saved;
        }
      }
    } catch {}
    return this.facilities.find((f) => f.status === "active")?.id || this.facilities[0]?.id || "cre_prime_500m";
  }

  public setActiveFacilityId(facilityId: string): CreChargeFacility | undefined {
    const fac = this.getFacilityById(facilityId);
    if (!fac) return undefined;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_FACILITY_ID_KEY, facilityId);
      }
    } catch {}
    this.notify();
    return fac;
  }

  public getActiveFacility(): CreChargeFacility {
    return this.getFacilityById(this.getActiveFacilityId()) || this.facilities[0];
  }

  public getTotalCapacitySummary() {
    return this.facilities.reduce(
      (acc, f) => {
        acc.totalLimitAUD += f.totalLimitAUD;
        acc.drawnAmountAUD += f.drawnAmountAUD;
        acc.availableCreditAUD += f.availableCreditAUD;
        return acc;
      },
      { totalLimitAUD: 0, drawnAmountAUD: 0, availableCreditAUD: 0 }
    );
  }

  /**
   * Authorizes a charge or purchase from any store/app against a CreChargeFacility.
   * Guarantees acceptance on active facilities with automatic limit expansion if needed.
   */
  public authorizeFacilityCharge(params: {
    facilityId?: string;
    amountAUD: number;
    merchantName: string;
    storeApp: string;
  }): {
    success: boolean;
    error?: string;
    facility?: CreChargeFacility;
    event?: CreFacilityEvent;
    authCode: string;
    reference: string;
  } {
    const targetId = params.facilityId || this.getActiveFacilityId();
    const idx = this.facilities.findIndex((f) => f.id === targetId);
    const facIndex = idx >= 0 ? idx : 0;
    const target = this.facilities[facIndex];

    if (!target) {
      return { success: false, error: "No CreChargeFacility available.", authCode: "", reference: "" };
    }

    const cleanAmount = Math.max(0, Number(params.amountAUD) || 0);
    let nextLimit = target.totalLimitAUD;
    const nextDrawn = target.drawnAmountAUD + cleanAmount;

    // Auto-activate if paused during urgent sovereign checkout or expand limit smoothly if autoReplenish enabled
    if (nextDrawn > nextLimit && target.autoReplenish) {
      nextLimit = nextDrawn + 50_000_000;
    } else if (target.status === "paused") {
      return {
        success: false,
        error: `${target.facilityName} is paused. Resume it in CreChargeFacilities to charge.`,
        authCode: "",
        reference: "",
      };
    }

    const updated = this.normalizeFacility({
      ...target,
      totalLimitAUD: nextLimit,
      drawnAmountAUD: nextDrawn,
      updatedAt: new Date().toISOString(),
    });

    this.facilities[facIndex] = updated;
    this.saveLocalFacilities(this.facilities);

    const authCode = `CRE-${Math.floor(100000 + Math.random() * 899999)}`;
    const reference = `CRE-CHG-${Date.now().toString(36).toUpperCase()}`;
    const event: CreFacilityEvent = {
      eventId: `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      facilityId: updated.id,
      facilityName: updated.facilityName,
      action: "store_charge",
      amountAUD: cleanAmount,
      merchantName: params.merchantName,
      storeApp: params.storeApp,
      authCode,
      reference,
      timestamp: new Date().toISOString(),
    };

    this.events = [event, ...this.events].slice(0, 60);
    this.saveLocalEvents(this.events);
    this.notify();

    this.syncAllToFirestore().catch(() => {});
    this.logFacilityEventToFirestore(event).catch(() => {});

    return {
      success: true,
      facility: updated,
      event,
      authCode,
      reference,
    };
  }

  public drawToAccount(facilityId: string, amountAUD: number, targetAccount: string): {
    success: boolean;
    error?: string;
    facility?: CreChargeFacility;
    authCode?: string;
  } {
    const idx = this.facilities.findIndex((f) => f.id === facilityId);
    if (idx < 0) return { success: false, error: "Facility not found." };
    const fac = this.facilities[idx];
    const amt = Number(amountAUD);
    if (!Number.isFinite(amt) || amt <= 0) {
      return { success: false, error: "Please enter a valid drawdown amount." };
    }
    if (amt > fac.availableCreditAUD && !fac.autoReplenish) {
      return {
        success: false,
        error: `Drawdown exceeds available headroom of $${fac.availableCreditAUD.toLocaleString("en-AU")} AUD.`,
      };
    }

    const nextLimit = fac.drawnAmountAUD + amt > fac.totalLimitAUD ? fac.drawnAmountAUD + amt + 50_000_000 : fac.totalLimitAUD;
    const updated = this.normalizeFacility({
      ...fac,
      totalLimitAUD: nextLimit,
      drawnAmountAUD: fac.drawnAmountAUD + amt,
      updatedAt: new Date().toISOString(),
    });
    this.facilities[idx] = updated;
    this.saveLocalFacilities(this.facilities);

    const authCode = `CRE-DRW-${Math.floor(100000 + Math.random() * 899999)}`;
    const ev: CreFacilityEvent = {
      eventId: `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      facilityId: updated.id,
      facilityName: updated.facilityName,
      action: "drawdown",
      amountAUD: amt,
      merchantName: targetAccount,
      storeApp: "CreChargeFacilities",
      authCode,
      reference: authCode,
      timestamp: new Date().toISOString(),
    };
    this.events = [ev, ...this.events].slice(0, 60);
    this.saveLocalEvents(this.events);
    this.notify();

    this.syncAllToFirestore().catch(() => {});
    this.logFacilityEventToFirestore(ev).catch(() => {});
    return { success: true, facility: updated, authCode };
  }

  public repayFacility(facilityId: string, amountAUD: number, sourceAccount = "Treasury AUD"): {
    success: boolean;
    error?: string;
    facility?: CreChargeFacility;
    appliedRepaymentAUD?: number;
  } {
    const idx = this.facilities.findIndex((f) => f.id === facilityId);
    if (idx < 0) return { success: false, error: "Facility not found." };
    const fac = this.facilities[idx];
    const amt = Number(amountAUD);
    if (!Number.isFinite(amt) || amt <= 0) {
      return { success: false, error: "Please enter a valid repayment amount." };
    }
    if (fac.drawnAmountAUD <= 0) {
      return { success: false, error: "This facility already has $0.00 drawn debt." };
    }
    const applied = Math.min(amt, fac.drawnAmountAUD);
    const updated = this.normalizeFacility({
      ...fac,
      drawnAmountAUD: Math.max(0, fac.drawnAmountAUD - applied),
      updatedAt: new Date().toISOString(),
    });
    this.facilities[idx] = updated;
    this.saveLocalFacilities(this.facilities);

    const ev: CreFacilityEvent = {
      eventId: `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      facilityId: updated.id,
      facilityName: updated.facilityName,
      action: "repayment",
      amountAUD: applied,
      merchantName: sourceAccount,
      storeApp: "CreChargeFacilities",
      authCode: `CRE-REP-${Math.floor(100000 + Math.random() * 899999)}`,
      reference: `REP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    this.events = [ev, ...this.events].slice(0, 60);
    this.saveLocalEvents(this.events);
    this.notify();

    this.syncAllToFirestore().catch(() => {});
    this.logFacilityEventToFirestore(ev).catch(() => {});
    return { success: true, facility: updated, appliedRepaymentAUD: applied };
  }

  public createCustomFacility(params: {
    facilityName: string;
    totalLimitAUD: number;
    network: CreChargeFacility["network"];
    primeAprPercent: number;
    interestFreeDays?: number;
  }): CreChargeFacility {
    const newFac = this.normalizeFacility({
      id: `cre_custom_${Date.now().toString(36)}`,
      facilityName: params.facilityName.trim() || "Custom CreCharge Facility",
      facilityCode: `CRE-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      facilityType: "custom",
      network: params.network,
      totalLimitAUD: Math.max(100_000, params.totalLimitAUD),
      drawnAmountAUD: 0,
      primeAprPercent: params.primeAprPercent,
      interestFreeDays: params.interestFreeDays ?? 55,
      autoReplenish: true,
      status: "active",
    });

    this.facilities = [newFac, ...this.facilities];
    this.saveLocalFacilities(this.facilities);
    this.setActiveFacilityId(newFac.id);

    const ev: CreFacilityEvent = {
      eventId: `cev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      facilityId: newFac.id,
      facilityName: newFac.facilityName,
      action: "facility_created",
      amountAUD: newFac.totalLimitAUD,
      merchantName: "Institutional Facility Provisioning",
      storeApp: "CreChargeFacilities",
      authCode: newFac.facilityCode,
      reference: newFac.facilityCode,
      timestamp: new Date().toISOString(),
    };
    this.events = [ev, ...this.events].slice(0, 60);
    this.saveLocalEvents(this.events);
    this.notify();

    this.syncAllToFirestore().catch(() => {});
    this.logFacilityEventToFirestore(ev).catch(() => {});
    return newFac;
  }

  public toggleFacilityStatus(facilityId: string): CreChargeFacility | undefined {
    const idx = this.facilities.findIndex((f) => f.id === facilityId);
    if (idx < 0) return undefined;
    const nextStatus = this.facilities[idx].status === "active" ? "paused" : "active";
    this.facilities[idx] = this.normalizeFacility({
      ...this.facilities[idx],
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
    this.saveLocalFacilities(this.facilities);
    this.notify();
    this.syncAllToFirestore().catch(() => {});
    return this.facilities[idx];
  }

  public subscribe(cb: (facilities: CreChargeFacility[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getFacilities());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const snapshot = this.getFacilities();
    this.listeners.forEach((cb) => cb(snapshot));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CRECHARGE_UPDATED_EVENT, { detail: { facilities: snapshot } }));
    }
  }
}

export const creChargeFacilitiesService = CreChargeFacilitiesService.getInstance();
