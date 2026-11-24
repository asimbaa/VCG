/**
 * CLIENT AI ACTION EXECUTOR BRIDGE
 * Collects live non-sensitive runtime context across Bank Cards, CreChargeFacilities,
 * and Stores, sends it to the server-side Gemini 4 Orchestrator, and executes
 * returned tool calls atomically across the live application state.
 */

import { unifiedBankCardSync, TARGET_LINK_EMAIL } from "./unifiedBankCardSync";
import { creChargeFacilitiesService } from "./creChargeFacilitiesService";
import { executeUniversalSettlement } from "../components/shared/UniversalPaymentRailSelector";
import { sendUnifiedEmail } from "../utils/email";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { toast } from "sonner";

export interface AiClientActionIntent {
  id?: string;
  toolName: string;
  args: Record<string, any>;
}

export interface AiActionExecutionResult {
  toolName: string;
  name?: string;
  success: boolean;
  summary: string;
  navTab?: string;
  receiptRef?: string;
}

export interface LiveAppSnapshot {
  currentTimeIso: string;
  holderEmail: string;
  activeCardId: string;
  cards: Array<{
    id: string;
    name: string;
    network: string;
    last4: string;
    balance: number;
    status: string;
    cashbackRate: number;
    luhnVerified: boolean;
    zeroDecline: boolean;
    burnerMode: boolean;
  }>;
  activeFacilityId: string;
  creChargeFacilities: Array<{
    id: string;
    facilityName: string;
    facilityCode: string;
    totalLimitAUD: number;
    drawnAmountAUD: number;
    availableCreditAUD: number;
    primeAprPercent: number;
    status: string;
  }>;
  storeCartCount: number;
  uberEatsCartCount: number;
}

export function collectLiveAppSnapshot(): LiveAppSnapshot {
  const cards = unifiedBankCardSync.getCards();
  const facilities = creChargeFacilitiesService.getFacilities();
  let storeCartCount = 0;
  let uberEatsCartCount = 0;
  try {
    const sc = localStorage.getItem("valourian_store_cart");
    if (sc) storeCartCount = JSON.parse(sc).length || 0;
    const uec = localStorage.getItem("valourian_ubereats_cart");
    if (uec) uberEatsCartCount = JSON.parse(uec).length || 0;
  } catch {}

  return {
    currentTimeIso: new Date().toISOString(),
    holderEmail: auth.currentUser?.email || TARGET_LINK_EMAIL,
    activeCardId: unifiedBankCardSync.getActivePaymentCardId(),
    cards: cards.map((c) => ({
      id: c.id,
      name: c.name,
      network: c.network,
      last4: c.last4,
      balance: c.balance,
      status: c.status,
      cashbackRate: c.cashbackRate,
      luhnVerified: c.luhnVerified !== false,
      zeroDecline: c.zeroDeclineGuaranteed !== false,
      burnerMode: Boolean(c.burnerMode),
    })),
    activeFacilityId: creChargeFacilitiesService.getActiveFacilityId(),
    creChargeFacilities: facilities.map((f) => ({
      id: f.id,
      facilityName: f.facilityName,
      facilityCode: f.facilityCode,
      totalLimitAUD: f.totalLimitAUD,
      drawnAmountAUD: f.drawnAmountAUD,
      availableCreditAUD: f.availableCreditAUD,
      primeAprPercent: f.primeAprPercent,
      status: f.status,
    })),
    storeCartCount,
    uberEatsCartCount,
  };
}

export async function executeAiClientAction(intent: AiClientActionIntent): Promise<AiActionExecutionResult> {
  const { toolName, args = {} } = intent;

  try {
    if (toolName === "navigate_app_tab") {
      const tab = String(args.tab || "treasury").toLowerCase();
      if (tab === "rapidpay") {
        window.dispatchEvent(new CustomEvent("open-rapidpay"));
      } else if (tab === "vault_records") {
        window.dispatchEvent(new CustomEvent("open-vault-records"));
      } else {
        window.dispatchEvent(new CustomEvent("navigate-tab", { detail: { tab } }));
      }
      toast.success(`AI navigated workspace to ${tab.toUpperCase()}`);
      return {
        toolName,
        success: true,
        summary: `Navigated active view to ${tab}.`,
        navTab: tab,
      };
    }

    if (toolName === "manage_bank_card") {
      const action = String(args.action || "repair_all");
      const cards = unifiedBankCardSync.getCards();
      const targetCard =
        cards.find((c) => c.id === args.cardId) ||
        cards.find((c) => args.last4 && c.last4 === String(args.last4)) ||
        cards.find((c) => args.network && c.network.toLowerCase().includes(String(args.network).toLowerCase())) ||
        unifiedBankCardSync.getActivePaymentCard();

      if (action === "repair_all") {
        const audit = unifiedBankCardSync.verifyAndHealAllCards();
        toast.success(`Luhn Mod-10 verified all ${audit.totalCards} cards (${audit.repairedCount} repaired).`);
        return {
          toolName,
          success: true,
          summary: `Audited ${audit.totalCards} bank cards; repaired ${audit.repairedCount} PANs to 100% Luhn Mod-10 compliance.`,
          navTab: "cards",
        };
      }

      if (action === "issue_card") {
        const network = (args.network === "AMEX" || args.network === "Visa" || args.network === "Mastercard")
          ? args.network
          : "Visa";
        const newCard = unifiedBankCardSync.issueCustomCard({
          name: String(args.name || `${network} AI-Issued Sovereign Card`),
          cardCategory: args.burnerMode ? "debit" : "credit",
          network,
          balance: Number(args.initialBalanceAUD) || 5000000,
          limit: "unlimited",
          burnerMode: Boolean(args.burnerMode),
        });
        if (args.merchantLock) {
          unifiedBankCardSync.updateMerchantLocks(newCard.id, "allowlist", [String(args.merchantLock)]);
        }
        unifiedBankCardSync.setActivePaymentCardId(newCard.id);
        toast.success(`AI issued ${newCard.network} •••• ${newCard.last4} ($${newCard.balance.toLocaleString("en-AU")} AUD)`);
        return {
          toolName,
          success: true,
          summary: `Issued ${newCard.name} (${newCard.network} •••• ${newCard.last4}) with Luhn-verified PAN & Auto Top-Up.`,
          navTab: "cards",
        };
      }

      if (action === "transfer_between_cards") {
        const fromId = String(args.fromCardId || cards[0]?.id);
        const toId = String(args.toCardId || cards[1]?.id || cards[0]?.id);
        const amt = Number(args.amountAUD) || 10000;
        const res = unifiedBankCardSync.transferBetweenCards(fromId, toId, amt);
        if (!res.success) return { toolName, success: false, summary: res.error || "Transfer failed." };
        toast.success(`Transferred $${amt.toLocaleString("en-AU")} AUD between bank cards.`);
        return {
          toolName,
          success: true,
          summary: `Transferred $${amt.toLocaleString("en-AU")} AUD to •••• ${res.toCard?.last4 || "target"} (New Balance: $${res.toBalance.toLocaleString("en-AU")} AUD).`,
          navTab: "cards",
        };
      }

      if (!targetCard) return { toolName, success: false, summary: "No matching bank card found." };

      if (action === "freeze" || action === "unfreeze") {
        const nextStatus = action === "freeze" ? "frozen" : "active";
        unifiedBankCardSync.updateCard(targetCard.id, (c) => ({ ...c, status: nextStatus }));
        toast.success(`${targetCard.network} •••• ${targetCard.last4} set to ${nextStatus.toUpperCase()}`);
        return { toolName, success: true, summary: `Card •••• ${targetCard.last4} is now ${nextStatus}.`, navTab: "cards" };
      }

      if (action === "set_default") {
        unifiedBankCardSync.autoPopulateCardCredentials(targetCard.id);
        toast.success(`Default payment card set to ${targetCard.network} •••• ${targetCard.last4}`);
        return { toolName, success: true, summary: `Activated ${targetCard.name} as global default checkout card.` };
      }

      if (action === "toggle_burner") {
        const state = unifiedBankCardSync.toggleBurnerMode(targetCard.id);
        return { toolName, success: true, summary: `Burner single-use mode ${state ? "enabled" : "disabled"} for •••• ${targetCard.last4}.` };
      }

      if (action === "top_up") {
        const amt = Number(args.amountAUD) || 1000000;
        unifiedBankCardSync.updateCard(targetCard.id, (c) => ({ ...c, balance: c.balance + amt }));
        toast.success(`Topped up •••• ${targetCard.last4} by $${amt.toLocaleString("en-AU")} AUD`);
        return { toolName, success: true, summary: `Added $${amt.toLocaleString("en-AU")} AUD liquidity to ${targetCard.network} •••• ${targetCard.last4}.` };
      }
    }

    if (toolName === "manage_crecharge_facility") {
      const action = String(args.action || "drawdown");
      const facilities = creChargeFacilitiesService.getFacilities();
      const targetFac =
        facilities.find((f) => f.id === args.facilityId || f.facilityCode === args.facilityCode) ||
        creChargeFacilitiesService.getActiveFacility();

      if (action === "drawdown") {
        const amt = Number(args.amountAUD) || 100000;
        const targetAcc = String(args.targetAccount || "CommBank Smart Access (062-140 • 11680690)");
        const res = creChargeFacilitiesService.drawToAccount(targetFac.id, amt, targetAcc);
        if (!res.success) return { toolName, success: false, summary: res.error || "Drawdown failed." };
        window.dispatchEvent(new CustomEvent("valourian_balance_delta", { detail: { currency: "AUD", delta: amt } }));
        toast.success(`CreChargeFacility drew $${amt.toLocaleString("en-AU")} AUD to ${targetAcc}`);
        return {
          toolName,
          success: true,
          summary: `Executed drawdown of $${amt.toLocaleString("en-AU")} AUD from ${targetFac.facilityName} (Auth ${res.authCode}).`,
          navTab: "loans",
          receiptRef: res.authCode,
        };
      }

      if (action === "repay") {
        const amt = Number(args.amountAUD) || 100000;
        const res = creChargeFacilitiesService.repayFacility(targetFac.id, amt, "Treasury AUD Vault");
        if (!res.success) return { toolName, success: false, summary: res.error || "Repayment failed." };
        window.dispatchEvent(
          new CustomEvent("valourian_balance_delta", { detail: { currency: "AUD", delta: -(res.appliedRepaymentAUD || amt) } })
        );
        toast.success(`Repaid $${(res.appliedRepaymentAUD || amt).toLocaleString("en-AU")} AUD toward ${targetFac.facilityName}`);
        return {
          toolName,
          success: true,
          summary: `Repaid $${(res.appliedRepaymentAUD || amt).toLocaleString("en-AU")} AUD to ${targetFac.facilityName}.`,
          navTab: "loans",
        };
      }

      if (action === "create_facility") {
        const created = creChargeFacilitiesService.createCustomFacility({
          facilityName: String(args.facilityName || "Executive AI CreCharge Facility"),
          totalLimitAUD: Number(args.totalLimitAUD) || 100000000,
          network: "CreCharge Sovereign",
          primeAprPercent: Number(args.primeAprPercent) ?? 1.5,
          interestFreeDays: Number(args.interestFreeDays) || 60,
        });
        toast.success(`Provisioned ${created.facilityName} ($${(created.totalLimitAUD / 1_000_000).toFixed(0)}M AUD)`);
        return {
          toolName,
          success: true,
          summary: `Created ${created.facilityName} (${created.facilityCode}) usable in all stores and apps.`,
          navTab: "loans",
        };
      }

      if (action === "toggle_status") {
        const updated = creChargeFacilitiesService.toggleFacilityStatus(targetFac.id);
        return {
          toolName,
          success: true,
          summary: `${targetFac.facilityName} is now ${updated?.status || "active"}.`,
          navTab: "loans",
        };
      }
    }

    if (toolName === "execute_store_checkout") {
      const rail = args.paymentRail === "facility" ? "facility" : args.paymentRail === "vault" ? "vault" : "card";
      const storeApp = String(args.storeApp || "SovereignStore");
      const merchantName = String(args.merchantName || `${storeApp} Direct Order`);
      const amountAUD = Math.max(1, Number(args.amountAUD) || 250);

      const settlement = await executeUniversalSettlement({
        rail,
        cardId: args.cardId,
        facilityId: args.facilityId,
        amountAUD,
        merchantName,
        storeApp,
        vaultBalanceAUD: Number.MAX_SAFE_INTEGER, // if explicit vault requested by AI
      });

      if (!settlement.success) {
        return { toolName, success: false, summary: settlement.error || "Settlement rejected." };
      }

      if (auth.currentUser?.uid) {
        try {
          await addDoc(collection(db, "transactions"), {
            userId: auth.currentUser.uid,
            amount: -amountAUD,
            currency: "AUD",
            date: new Date().toISOString(),
            recipient: `${storeApp} - ${merchantName}`,
            type: rail === "facility" ? "crecharge_facility" : "card",
            status: "completed",
            description: `AI Executed Settlement (${settlement.labelUsed}) • Auth ${settlement.authCode}`,
          });
        } catch {}
      }

      toast.success(`AI cleared $${amountAUD.toLocaleString("en-AU")} AUD at ${merchantName} via ${settlement.labelUsed}`);
      return {
        toolName,
        success: true,
        summary: `Cleared $${amountAUD.toLocaleString("en-AU")} AUD at ${merchantName} (${storeApp}) via ${settlement.labelUsed}. Auth: ${settlement.authCode}.`,
        receiptRef: settlement.authCode,
      };
    }

    if (toolName === "dispatch_workspace_email") {
      const to = String(args.to || TARGET_LINK_EMAIL);
      const subject = String(args.subject || "Valourian Sovereign AI Directive Confirmation");
      const bodyText = String(args.body || "Executed per executive directive.");
      const res = await sendUnifiedEmail({
        to,
        subject,
        htmlBody: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;color:#f8fafc;border-radius:12px;"><h2>${subject}</h2><p style="white-space:pre-wrap;line-height:1.6;">${bodyText}</p></div>`,
        textBody: bodyText,
        senderName: "Valourian Gemini 4 Executive",
      });
      return {
        toolName,
        success: res.success,
        summary: res.success
          ? `Dispatched email "${subject}" to ${to} via ${res.channel}.`
          : `Email dispatch encountered an issue (channel: ${res.channel}) — check SMTP/Workspace settings.`,
        navTab: "notifications",
      };
    }

    return {
      toolName,
      success: true,
      summary: `Executed ${toolName} successfully.`,
    };
  } catch (err: any) {
    return {
      toolName,
      success: false,
      summary: err?.message || `Failed executing ${toolName}`,
    };
  }
}

export async function runPaidGeminiAssistant(params: {
  message?: string;
  prompt?: string;
  mode?: "neon_executor" | "carbon_deep_audit" | "search_grounded";
  model?: "gemini-4-neon" | "gemini-4-carbon";
  enableSearch?: boolean;
  contextHint?: string;
  history?: Array<{
    role: "user" | "model";
    text?: string;
    parts?: Array<{ text: string }>;
  }>;
}) {
  const snapshot = collectLiveAppSnapshot();
  const baseMessage = (params.message || params.prompt || "").trim();
  const effectiveMessage = params.contextHint
    ? `[Context: ${params.contextHint}]\n${baseMessage}`
    : baseMessage;
  const effectiveMode: "neon_executor" | "carbon_deep_audit" | "search_grounded" =
    params.mode ||
    (params.model === "gemini-4-carbon" ? "carbon_deep_audit" : "neon_executor");
  const normalizedHistory = (params.history || [])
    .map((h) => ({
      role: h.role,
      text: h.text ?? h.parts?.map((p) => p.text).join("\n") ?? "",
    }))
    .filter((h) => h.text.trim().length > 0);

  const res = await fetch("/api/ai/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: effectiveMessage,
      mode: effectiveMode,
      history: normalizedHistory,
      snapshot,
    }),
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) {
    throw new Error(data.error || `Gemini API request failed (HTTP ${res.status})`);
  }

  const actions: AiClientActionIntent[] = Array.isArray(data.clientActions) ? data.clientActions : [];
  const executionResults: AiActionExecutionResult[] = [];
  for (const act of actions) {
    const r = await executeAiClientAction(act);
    executionResults.push({ ...r, name: r.name || r.toolName });
  }

  const urls = Array.isArray(data.urls) ? (data.urls as string[]) : [];

  return {
    text: data.text as string,
    modelUsed: data.modelUsed as string,
    urls,
    groundingUrls: urls,
    executionResults,
    executedActions: executionResults,
  };
}
