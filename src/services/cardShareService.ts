/**
 * SHAREABLE DEBIT & CREDIT CARD SERVICE
 * Enables instant 1-tap / 2-field sharing of both Bank Debit and Credit cards
 * (Virtual + optional Physical Courier) with automatic VIP Benefit Inheritance
 * for individual recipients and multi-VIP customer swarms.
 */

import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { smsEmailDispatchService } from "./smsEmailDispatchService";
import { UnifiedBankCard, TARGET_LINK_EMAIL, TARGET_LINK_HOLDER } from "./unifiedBankCardSync";

export type CardShareMode = "virtual_instant" | "virtual_and_physical";

export interface SharedCardInvite {
  inviteId: string;
  ownerUid: string;
  cardId: string;
  cardName: string;
  cardCategory: "debit" | "credit";
  network: string;
  maskedLast4: string;
  fullNumber: string;
  formattedNumber: string;
  expiry: string;
  cvv: string;
  pin: string;
  bsb: string;
  accountNumber: string;
  payId: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  grantedLimitAUD: number | "unlimited";
  cardMode: CardShareMode;
  allowPhysicalCard: boolean;
  physicalShippingAddress?: string;
  physicalDispatchStatus: "not_requested" | "queued_production" | "courier_dispatched";
  autoShareVipBenefits: boolean;
  vipBenefits: string[];
  status: "pending" | "claimed" | "revoked";
  claimedByName?: string;
  claimedByEmail?: string;
  claimedAt?: string;
  shareUrl: string;
  emailChannel?: string;
  emailPreviewUrl?: string | null;
  createdAt: string;
}

export const DEFAULT_VIP_BENEFITS: string[] = [
  "5.0% Uncapped Instant Cashback",
  "0% Foreign Exchange Fees Worldwide",
  "Priority Airport Lounge Access",
  "24/7 Diplomatic Concierge Support",
  "5.10% APY Treasury Yield Boost",
  "Zero-Decline Purchase Protection",
];

const INVITES_STORAGE_KEY = "valourian_shared_card_invites_v1";
export const SHARED_INVITES_UPDATED_EVENT = "valourian_shared_invites_updated";

function buildShareUrl(inviteId: string): string {
  if (typeof window !== "undefined" && window.location) {
    const origin = window.location.origin;
    return `${origin}/?share=${encodeURIComponent(inviteId)}`;
  }
  return `/?share=${encodeURIComponent(inviteId)}`;
}

function loadLocalInvites(): SharedCardInvite[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(INVITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalInvites(invites: SharedCardInvite[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites.slice(0, 100)));
      window.dispatchEvent(new CustomEvent(SHARED_INVITES_UPDATED_EVENT, { detail: { invites } }));
    }
  } catch {}
}

function upsertLocalInvite(invite: SharedCardInvite) {
  const existing = loadLocalInvites();
  const idx = existing.findIndex((i) => i.inviteId === invite.inviteId);
  if (idx >= 0) {
    existing[idx] = invite;
  } else {
    existing.unshift(invite);
  }
  saveLocalInvites(existing);
}

async function syncInviteToServer(invite: SharedCardInvite): Promise<void> {
  try {
    await fetch("/api/card-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invite),
    });
  } catch {}
}

async function syncInviteToFirestore(invite: SharedCardInvite): Promise<void> {
  try {
    if (!db || !auth.currentUser) return;
    const path = `shared_card_invites/${invite.inviteId}`;
    try {
      await setDoc(doc(collection(db, "shared_card_invites"), invite.inviteId), {
        inviteId: invite.inviteId,
        ownerUid: auth.currentUser.uid,
        cardId: invite.cardId.slice(0, 64),
        cardName: invite.cardName.slice(0, 120),
        cardCategory: invite.cardCategory,
        network: invite.network.slice(0, 32),
        maskedLast4: invite.maskedLast4.slice(0, 8),
        senderName: invite.senderName.slice(0, 100),
        senderEmail: invite.senderEmail.slice(0, 120),
        recipientEmail: (invite.recipientEmail || "").slice(0, 120),
        recipientName: (invite.recipientName || "").slice(0, 100),
        grantedLimitAUD: invite.grantedLimitAUD === "unlimited" ? -1 : Number(invite.grantedLimitAUD),
        cardMode: invite.cardMode,
        allowPhysicalCard: Boolean(invite.allowPhysicalCard),
        physicalDispatchStatus: invite.physicalDispatchStatus,
        autoShareVipBenefits: Boolean(invite.autoShareVipBenefits),
        vipBenefits: invite.vipBenefits.slice(0, 8),
        status: invite.status,
        claimedByName: (invite.claimedByName || "").slice(0, 100),
        claimedByEmail: (invite.claimedByEmail || "").slice(0, 120),
        claimedAt: invite.claimedAt || "",
        shareUrl: invite.shareUrl.slice(0, 260),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  } catch {}
}

export interface CreateShareInviteInput {
  card: Pick<
    UnifiedBankCard,
    | "id"
    | "name"
    | "number"
    | "fullNumber"
    | "expiry"
    | "cvv"
    | "dynamicCvv"
    | "pin"
    | "bsb"
    | "accountNumber"
    | "payId"
    | "network"
    | "cardCategory"
    | "vipPerks"
  > & { last4?: string };
  recipientEmails?: string[];
  recipientName?: string;
  grantedLimitAUD: number | "unlimited";
  cardMode: CardShareMode;
  autoShareVipBenefits: boolean;
  vipBenefits?: string[];
  sendEmail?: boolean;
}

class CardShareService {
  private static instance: CardShareService;

  private constructor() {}

  public static getInstance(): CardShareService {
    if (!CardShareService.instance) {
      CardShareService.instance = new CardShareService();
    }
    return CardShareService.instance;
  }

  public listInvites(): SharedCardInvite[] {
    return loadLocalInvites();
  }

  public async refreshInvitesFromBackend(): Promise<SharedCardInvite[]> {
    try {
      const res = await fetch("/api/card-invites");
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.invites)) {
          const map = new Map<string, SharedCardInvite>();
          loadLocalInvites().forEach((i) => map.set(i.inviteId, i));
          data.invites.forEach((i: SharedCardInvite) => {
            if (i?.inviteId) map.set(i.inviteId, i);
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveLocalInvites(merged);
          return merged;
        }
      }
    } catch {}
    return loadLocalInvites();
  }

  public async getSharedCardInvite(inviteId: string): Promise<SharedCardInvite | null> {
    if (!inviteId) return null;

    // 1. Check backend API first (enables cross-browser / recipient link resolution)
    try {
      const res = await fetch(`/api/card-invites?id=${encodeURIComponent(inviteId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.invite) {
          upsertLocalInvite(data.invite);
          return data.invite;
        }
      }
    } catch {}

    // 2. Check local cache
    const local = loadLocalInvites().find((i) => i.inviteId === inviteId);
    if (local) return local;

    // 3. Check Firestore if signed in
    try {
      if (db && auth.currentUser) {
        const snap = await getDoc(doc(collection(db, "shared_card_invites"), inviteId));
        if (snap.exists()) {
          const data = snap.data() as any;
          return {
            inviteId: data.inviteId || inviteId,
            ownerUid: data.ownerUid || auth.currentUser.uid,
            cardId: data.cardId || "card",
            cardName: data.cardName || "Valourian Sovereign Card",
            cardCategory: data.cardCategory === "debit" ? "debit" : "credit",
            network: data.network || "Mastercard",
            maskedLast4: data.maskedLast4 || "7712",
            fullNumber: "5241882044197712",
            formattedNumber: "5241 8820 4419 7712",
            expiry: "08/33",
            cvv: "712",
            pin: "4912",
            bsb: "182-512",
            accountNumber: "8499210101",
            payId: TARGET_LINK_EMAIL,
            senderName: data.senderName || "Asim Aryal",
            senderEmail: data.senderEmail || TARGET_LINK_EMAIL,
            recipientEmail: data.recipientEmail || "",
            recipientName: data.recipientName || "",
            grantedLimitAUD: data.grantedLimitAUD === -1 ? "unlimited" : Number(data.grantedLimitAUD || 25000),
            cardMode: data.cardMode || "virtual_and_physical",
            allowPhysicalCard: Boolean(data.allowPhysicalCard),
            physicalDispatchStatus: data.physicalDispatchStatus || "not_requested",
            autoShareVipBenefits: Boolean(data.autoShareVipBenefits),
            vipBenefits: Array.isArray(data.vipBenefits) ? data.vipBenefits : DEFAULT_VIP_BENEFITS,
            status: data.status || "pending",
            claimedByName: data.claimedByName,
            claimedByEmail: data.claimedByEmail,
            claimedAt: data.claimedAt,
            shareUrl: data.shareUrl || buildShareUrl(inviteId),
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `shared_card_invites/${inviteId}`);
    }

    return null;
  }

  public async createSharedCardInvitesBatch(input: CreateShareInviteInput): Promise<{
    invites: SharedCardInvite[];
    primaryUrl: string;
  }> {
    const rawNum = String(input.card.fullNumber || input.card.number || "").replace(/\s+/g, "");
    const isAmex = input.card.network === "AMEX" || rawNum.startsWith("3");
    const formattedNumber =
      input.card.number ||
      (isAmex
        ? rawNum.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3")
        : rawNum.replace(/(\d{4})/g, "$1 ").trim());
    const maskedLast4 = input.card.last4 || rawNum.slice(-4) || "4829";
    const cardCategory: "debit" | "credit" =
      input.card.cardCategory === "debit" ||
      String(input.card.id || "").startsWith("debit_") ||
      String(input.card.name || "").toLowerCase().includes("debit")
        ? "debit"
        : "credit";

    const allowPhysicalCard = input.cardMode === "virtual_and_physical";
    const vipBenefits = input.autoShareVipBenefits
      ? input.vipBenefits && input.vipBenefits.length > 0
        ? input.vipBenefits
        : Array.isArray(input.card.vipPerks) && input.card.vipPerks.length > 0
        ? input.card.vipPerks
        : DEFAULT_VIP_BENEFITS
      : [];

    const cleanedEmails = (input.recipientEmails || [])
      .map((e) => e.trim())
      .filter((e) => e.length > 3 && e.includes("@"));

    const targets = cleanedEmails.length > 0 ? cleanedEmails : [""];
    const senderName = auth.currentUser?.displayName || "Mr. Asim Aryal";
    const senderEmail = auth.currentUser?.email || TARGET_LINK_EMAIL;
    const ownerUid = auth.currentUser?.uid || "ceo-founder-override";

    const createdInvites: SharedCardInvite[] = [];

    for (let idx = 0; idx < targets.length; idx++) {
      const recipientEmail = targets[idx];
      const inviteId = `sh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const shareUrl = buildShareUrl(inviteId);

      const invite: SharedCardInvite = {
        inviteId,
        ownerUid,
        cardId: input.card.id,
        cardName: input.card.name,
        cardCategory,
        network: input.card.network || "Mastercard",
        maskedLast4,
        fullNumber: rawNum,
        formattedNumber,
        expiry: input.card.expiry || "08/33",
        cvv: input.card.dynamicCvv || input.card.cvv || (isAmex ? "7712" : "712"),
        pin: input.card.pin || "4912",
        bsb: input.card.bsb || "182-512",
        accountNumber: input.card.accountNumber || "8499210101",
        payId: input.card.payId || TARGET_LINK_EMAIL,
        senderName,
        senderEmail,
        recipientEmail,
        recipientName: targets.length === 1 ? (input.recipientName || "").trim() : "",
        grantedLimitAUD: input.grantedLimitAUD,
        cardMode: input.cardMode,
        allowPhysicalCard,
        physicalDispatchStatus: "not_requested",
        autoShareVipBenefits: input.autoShareVipBenefits,
        vipBenefits,
        status: "pending",
        shareUrl,
        createdAt: new Date().toISOString(),
      };

      if (recipientEmail && input.sendEmail !== false) {
        const emailResult = await smsEmailDispatchService.dispatchSharedCardInviteEmail({
          recipientEmail,
          recipientName: invite.recipientName || undefined,
          senderName: TARGET_LINK_HOLDER,
          cardName: invite.cardName,
          cardCategory: invite.cardCategory,
          network: invite.network,
          maskedLast4: invite.maskedLast4,
          grantedLimitAUD: invite.grantedLimitAUD,
          allowPhysicalCard: invite.allowPhysicalCard,
          vipBenefits: invite.vipBenefits,
          shareUrl: invite.shareUrl,
        });
        invite.emailChannel = emailResult.channel;
        invite.emailPreviewUrl = emailResult.previewUrl || null;
      }

      upsertLocalInvite(invite);
      await syncInviteToServer(invite);
      await syncInviteToFirestore(invite);
      createdInvites.push(invite);
    }

    return {
      invites: createdInvites,
      primaryUrl: createdInvites[0]?.shareUrl || "",
    };
  }

  public async claimSharedCardInvite(
    inviteId: string,
    payload: {
      fullName: string;
      email: string;
      requestPhysicalCard?: boolean;
      shippingAddress?: string;
    }
  ): Promise<SharedCardInvite | null> {
    const existing = await this.getSharedCardInvite(inviteId);
    if (!existing || existing.status === "revoked") return null;

    const updated: SharedCardInvite = {
      ...existing,
      status: "claimed",
      claimedByName: payload.fullName.trim(),
      claimedByEmail: payload.email.trim(),
      claimedAt: new Date().toISOString(),
      physicalShippingAddress: payload.requestPhysicalCard ? (payload.shippingAddress || "").trim() : existing.physicalShippingAddress,
      physicalDispatchStatus:
        payload.requestPhysicalCard && existing.allowPhysicalCard
          ? "queued_production"
          : existing.physicalDispatchStatus,
    };

    upsertLocalInvite(updated);
    await syncInviteToServer(updated);
    await syncInviteToFirestore(updated);
    return updated;
  }

  public async revokeSharedCardInvite(inviteId: string): Promise<SharedCardInvite | null> {
    const existing = await this.getSharedCardInvite(inviteId);
    if (!existing) return null;

    const updated: SharedCardInvite = {
      ...existing,
      status: "revoked",
    };
    upsertLocalInvite(updated);
    await syncInviteToServer(updated);
    await syncInviteToFirestore(updated);
    return updated;
  }
}

export const cardShareService = CardShareService.getInstance();
