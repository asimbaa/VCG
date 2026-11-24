import { doc, setDoc, addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";

export const FOUNDER_EMAILS = [
  "asim.nsw@gmail.com",
  "asimaryal2@gmail.com",
  "asim.aryal@protonmail.com",
  "valouriancapital@gmail.com",
  "asimmaryal@gmail.com",
  "asimaryal10@gmail.com",
  "asimausco@gmail.com",
  "valourianbank@gmail.com",
];

export const BENEFIT_VOUCHERS_KEY = "valourian_benefit_vouchers";
export const LOCAL_TRANSACTIONS_KEY = "valourian_local_transactions";
export const LOCAL_EMAILS_KEY = "valourian_local_workspace_emails";

export interface SharedBenefitVoucher {
  code: string;
  title: string;
  amountAUD: number;
  storeScope: string;
  issuedAt: string;
  claimed?: boolean;
  claimedAt?: string;
}

/**
 * Returns the real Firebase Auth UID ONLY when Firebase Auth holds a verified
 * active session. Never returns mock/override UIDs like "ceo-founder-override"
 * so Firestore rules never reject unauthenticated reads/writes.
 */
export function getVerifiedCloudUid(): string | null {
  try {
    const cu = auth?.currentUser;
    if (!cu || !cu.uid || cu.uid === "ceo-founder-override" || cu.uid === "mock-user-123") {
      return null;
    }
    if (cu.email && cu.emailVerified === false) {
      return null;
    }
    return cu.uid;
  } catch {
    return null;
  }
}

export function isAsimCloudSession(): boolean {
  try {
    const cu = auth?.currentUser;
    if (!cu || !cu.email || !cu.emailVerified) return false;
    return FOUNDER_EMAILS.includes(cu.email.toLowerCase());
  } catch {
    return false;
  }
}

export function sanitizeDocId(rawId: string): string {
  const cleaned = String(rawId || `id_${Date.now()}`).replace(/[^a-zA-Z0-9_\-.@]/g, "_");
  return cleaned.slice(0, 128) || `id_${Date.now()}`;
}

export const DEFAULT_TREASURY_BALANCES: Record<string, number> = {
  USD: 4084659661658.95,
  EUR: 600000000000.0,
  GBP: 600000000000.0,
  AUD: 590826943045.98,
  AUD_RESERVE: 2450000000000.0,
  JPY: 1000000000000,
  CAD: 1000000000000,
  CHF: 1000000000000,
  CNY: 1000000000000,
  NZD: 1000000000000,
  SGD: 1000000000000,
  HKD: 1000000000000,
  INR: 1000000000000,
};

export function loadSyncedBalances(): Record<string, number> {
  if (typeof window === "undefined") return { ...DEFAULT_TREASURY_BALANCES };
  try {
    const vip = JSON.parse(window.localStorage.getItem("commbank_vip_balances") || "null");
    if (vip && typeof vip === "object" && typeof vip.AUD === "number") {
      return { ...DEFAULT_TREASURY_BALANCES, ...vip };
    }
    const val = JSON.parse(window.localStorage.getItem("valourian_balances") || "null");
    if (val && typeof val === "object" && typeof val.AUD === "number") {
      return { ...DEFAULT_TREASURY_BALANCES, ...val };
    }
  } catch {}
  return { ...DEFAULT_TREASURY_BALANCES };
}

export async function safeUpdateUserBalances(
  nextBalances: Record<string, number>,
  extraUserFields?: Record<string, any>
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem("commbank_vip_balances", JSON.stringify(nextBalances));
      window.localStorage.setItem("valourian_balances", JSON.stringify(nextBalances));
      window.dispatchEvent(
        new CustomEvent("valourian_balances_updated", {
          detail: { balances: nextBalances },
        })
      );
    } catch {}
  }

  const cloudUid = getVerifiedCloudUid();
  if (cloudUid && db) {
    try {
      await setDoc(
        doc(db, "users", cloudUid),
        {
          ...(extraUserFields || {}),
          balances: nextBalances,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cloudUid}`);
    }
  }
}

export function getLocalTransactions(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TRANSACTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordUnifiedTransaction(
  payload: Record<string, any>
): Promise<string> {
  const localId = payload.id || `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const entry = {
    ...payload,
    id: localId,
    date: payload.date || new Date().toISOString(),
    status: payload.status || "completed",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getLocalTransactions();
      const next = [entry, ...existing.filter((t) => t.id !== localId)].slice(0, 100);
      window.localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("valourian_payment_settled", {
          detail: { transaction: entry },
        })
      );
    } catch {}
  }

  const cloudUid = getVerifiedCloudUid();
  if (cloudUid && db) {
    try {
      const ref = await addDoc(collection(db, "transactions"), {
        ...entry,
        userId: cloudUid,
      });
      return ref.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "transactions");
    }
  }

  return localId;
}

export function getLocalWorkspaceEmails(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EMAILS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordLocalWorkspaceEmail(emailObj: Record<string, any>): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalWorkspaceEmails();
    const idStr = String(emailObj.id || Date.now());
    const normalized = {
      ...emailObj,
      id: emailObj.id || Date.now(),
      date: emailObj.date || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const next = [normalized, ...existing.filter((e) => String(e.id) !== idStr)].slice(0, 80);
    window.localStorage.setItem(LOCAL_EMAILS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("valourian_emails_updated", { detail: { email: normalized } }));
  } catch {}
}

export function getAvailableBenefitVouchers(
  appFilter?: "uber" | "ubereats" | "booking" | "store" | "all"
): SharedBenefitVoucher[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BENEFIT_VOUCHERS_KEY);
    const list: SharedBenefitVoucher[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const active = list.filter((v) => !v.claimed && Number(v.amountAUD) > 0);
    if (!appFilter || appFilter === "all") return active;
    return active.filter((v) => {
      const scope = `${v.storeScope || ""} ${v.title || ""}`.toLowerCase();
      if (scope.includes("universal") || scope.includes("all")) return true;
      if (appFilter === "uber") return scope.includes("uber") && !scope.includes("ubereats");
      if (appFilter === "ubereats") return scope.includes("ubereats") || scope.includes("dining");
      if (appFilter === "booking") return scope.includes("booking") || scope.includes("suite") || scope.includes("hotel") || scope.includes("flight");
      if (appFilter === "store") return scope.includes("sovereignstore") || scope.includes("procurement") || scope.includes("store");
      return true;
    });
  } catch {
    return [];
  }
}

export async function redeemBenefitVoucher(code: string): Promise<SharedBenefitVoucher | null> {
  if (typeof window === "undefined" || !code) return null;
  let redeemed: SharedBenefitVoucher | null = null;
  try {
    const raw = window.localStorage.getItem(BENEFIT_VOUCHERS_KEY);
    const list: SharedBenefitVoucher[] = raw ? JSON.parse(raw) : [];
    const next = list.map((v) => {
      if (v.code.toUpperCase() === code.trim().toUpperCase() && !v.claimed) {
        redeemed = { ...v, claimed: true, claimedAt: new Date().toISOString() };
        return redeemed;
      }
      return v;
    });
    if (redeemed) {
      window.localStorage.setItem(BENEFIT_VOUCHERS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("valourian_vouchers_updated", { detail: { voucher: redeemed } }));
    }
  } catch {}

  const cloudUid = getVerifiedCloudUid();
  if (redeemed && cloudUid && db) {
    try {
      const snap = await getDocs(query(collection(db, "vouchers"), where("code", "==", redeemed.code)));
      for (const d of snap.docs) {
        await setDoc(
          doc(db, "vouchers", d.id),
          { claimed: true, claimedBy: cloudUid, claimedAt: new Date().toISOString() },
          { merge: true }
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "vouchers");
    }
  }

  return redeemed;
}
