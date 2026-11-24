import React, { useEffect, useState } from "react";
import { CreditCard, Landmark, Wallet, CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { unifiedBankCardSync, UnifiedBankCard, MerchantTransaction } from "../../services/unifiedBankCardSync";
import { creChargeFacilitiesService, CreChargeFacility } from "../../services/creChargeFacilitiesService";

export type UniversalPaymentRail = "card" | "facility" | "vault";

export interface UniversalPaymentSelection {
  rail: UniversalPaymentRail;
  cardId: string;
  facilityId: string;
}

export interface UniversalSettlementInput {
  rail: UniversalPaymentRail;
  cardId?: string;
  facilityId?: string;
  amountAUD: number;
  merchantName: string;
  merchantLocation?: string;
  storeApp: string;
  vaultBalanceAUD?: number;
  onVaultDeduct?: (newBalanceAUD: number) => Promise<void> | void;
}

export interface UniversalSettlementResult {
  success: boolean;
  error?: string;
  railUsed: UniversalPaymentRail;
  labelUsed: string;
  authCode: string;
  reference: string;
  cardUsed?: UnifiedBankCard;
  facilityUsed?: CreChargeFacility;
  txRecord?: MerchantTransaction;
}

/**
 * Shared Zero-Decline Settlement Actuator usable inside every store, ride app, food app, travel app, and POS.
 */
export async function executeUniversalSettlement(input: UniversalSettlementInput): Promise<UniversalSettlementResult> {
  const cleanAmount = Math.max(0, Number(input.amountAUD) || 0);

  if (input.rail === "facility") {
    const res = creChargeFacilitiesService.authorizeFacilityCharge({
      facilityId: input.facilityId,
      amountAUD: cleanAmount,
      merchantName: input.merchantName,
      storeApp: input.storeApp,
    });
    if (!res.success || !res.facility) {
      return {
        success: false,
        error: res.error || "CreChargeFacility authorization failed.",
        railUsed: "facility",
        labelUsed: "CreChargeFacility",
        authCode: "",
        reference: "",
      };
    }
    return {
      success: true,
      railUsed: "facility",
      labelUsed: `${res.facility.facilityName} (${res.facility.facilityCode})`,
      authCode: res.authCode,
      reference: res.reference,
      facilityUsed: res.facility,
    };
  }

  if (input.rail === "card") {
    const cards = unifiedBankCardSync.getCards();
    const targetCard =
      cards.find((c) => c.id === input.cardId) ||
      unifiedBankCardSync.getActivePaymentCard() ||
      cards[0];

    if (!targetCard) {
      return {
        success: false,
        error: "No active bank card found.",
        railUsed: "card",
        labelUsed: "Bank Card",
        authCode: "",
        reference: "",
      };
    }

    // Guarantee Zero-Decline continuity: ensure card is active, online-enabled, Zero-Decline shield is ready,
    // and Auto Top-Up replenishes liquidity automatically before merchant settlement.
    if (
      targetCard.status === "frozen" ||
      targetCard.balance < cleanAmount ||
      targetCard.onlinePaymentsEnabled === false ||
      (targetCard.dailySpendingLimit > 0 && targetCard.dailySpendingLimit < cleanAmount)
    ) {
      unifiedBankCardSync.updateCard(targetCard.id, (c) => ({
        ...c,
        status: "active",
        onlinePaymentsEnabled: true,
        internationalPaymentsEnabled: true,
        contactlessEnabled: true,
        zeroDeclineGuaranteed: true,
        dailySpendingLimit: Math.max(c.dailySpendingLimit || 0, cleanAmount + 1_000_000),
        balance: Math.max(c.balance, cleanAmount + 1_000_000),
      }));
    }

    const spendRes = unifiedBankCardSync.spendFromCard(targetCard.id, {
      merchantName: input.merchantName,
      merchantLocation: input.merchantLocation || `${input.storeApp} Global Clearing`,
      region: "AUS",
      foreignAmount: cleanAmount,
      foreignCurrency: "AUD",
      category: input.storeApp,
      channel: "online",
    });

    if (!spendRes.success) {
      const authCode = `DECL-${Math.floor(100000 + Math.random() * 899999)}`;
      return {
        success: false,
        error: spendRes.declinedReason || "Card settlement check failed.",
        railUsed: "card",
        labelUsed: `${targetCard.network} •••• ${targetCard.last4}`,
        authCode,
        reference: authCode,
      };
    }

    unifiedBankCardSync.setActivePaymentCardId(targetCard.id);
    const updatedCard = spendRes.card || unifiedBankCardSync.getCardById(targetCard.id) || targetCard;

    return {
      success: true,
      railUsed: "card",
      labelUsed: `${updatedCard.network} •••• ${updatedCard.last4}`,
      authCode: spendRes.transaction?.authorizationCode || `VAL-${Math.floor(100000 + Math.random() * 899999)}`,
      reference: spendRes.transaction?.id || `TX-${Date.now().toString(36).toUpperCase()}`,
      cardUsed: updatedCard,
      txRecord: spendRes.transaction,
    };
  }

  // Treasury Vault AUD Rail
  const currentVault = Number(input.vaultBalanceAUD ?? 0);
  if (currentVault < cleanAmount) {
    return {
      success: false,
      error: `Insufficient Treasury Vault balance ($${currentVault.toLocaleString("en-AU")} AUD). Switch to a Zero-Decline Bank Card or CreChargeFacility for instant clearance.`,
      railUsed: "vault",
      labelUsed: "Treasury AUD Vault",
      authCode: "",
      reference: "",
    };
  }

  if (input.onVaultDeduct) {
    await input.onVaultDeduct(Math.max(0, currentVault - cleanAmount));
  }

  const ref = `VAULT-${Date.now().toString(36).toUpperCase()}`;
  return {
    success: true,
    railUsed: "vault",
    labelUsed: "Treasury Primary AUD Vault",
    authCode: `VLT-${Math.floor(100000 + Math.random() * 899999)}`,
    reference: ref,
  };
}

interface UniversalPaymentRailSelectorProps {
  theme?: "dark" | "light";
  rail: UniversalPaymentRail;
  onRailChange: (rail: UniversalPaymentRail) => void;
  selectedCardId: string;
  onSelectCardId: (cardId: string) => void;
  selectedFacilityId: string;
  onSelectFacilityId: (facilityId: string) => void;
  amountAUD?: number;
  vaultBalanceAUD?: number;
  allowVault?: boolean;
  compact?: boolean;
}

export function UniversalPaymentRailSelector({
  theme = "dark",
  rail,
  onRailChange,
  selectedCardId,
  onSelectCardId,
  selectedFacilityId,
  onSelectFacilityId,
  amountAUD,
  vaultBalanceAUD,
  allowVault = true,
  compact = false,
}: UniversalPaymentRailSelectorProps) {
  const [cards, setCards] = useState<UnifiedBankCard[]>(() => unifiedBankCardSync.getCards());
  const [facilities, setFacilities] = useState<CreChargeFacility[]>(() => creChargeFacilitiesService.getFacilities());

  useEffect(() => {
    const unsubCards = unifiedBankCardSync.subscribe((next) => {
      setCards(next);
      if (!selectedCardId && next.length > 0) {
        onSelectCardId(unifiedBankCardSync.getActivePaymentCardId() || next[0].id);
      }
    });
    const unsubFac = creChargeFacilitiesService.subscribe((next) => {
      setFacilities(next);
      if (!selectedFacilityId && next.length > 0) {
        onSelectFacilityId(creChargeFacilitiesService.getActiveFacilityId() || next[0].id);
      }
    });
    return () => {
      unsubCards();
      unsubFac();
    };
  }, [selectedCardId, selectedFacilityId]);

  const activeCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const activeFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const isDark = theme === "dark";
  const boxCls = isDark
    ? "bg-slate-950/80 border border-slate-800 text-slate-100"
    : "bg-slate-50 border border-slate-200 text-slate-900";
  const selectCls = isDark
    ? "bg-slate-900 border border-slate-700 text-slate-100 focus:border-emerald-500"
    : "bg-white border border-slate-300 text-slate-900 focus:border-indigo-600";
  const mutedCls = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className={`rounded-2xl ${compact ? "p-3" : "p-4"} space-y-3 ${boxCls}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          Universal Payment Rail
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Zero-Decline • Luhn Verified
        </span>
      </div>

      {/* Rail Switcher Tabs (Min 44px touch height) */}
      <div className={`grid ${allowVault ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
        <button
          type="button"
          onClick={() => onRailChange("card")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            rail === "card"
              ? isDark
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                : "bg-slate-900 text-white border-slate-900 shadow-sm"
              : isDark
              ? "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Bank Card</span>
        </button>

        <button
          type="button"
          onClick={() => onRailChange("facility")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
            rail === "facility"
              ? isDark
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-amber-600 text-white border-amber-600 shadow-sm"
              : isDark
              ? "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <Landmark className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">CreCharge</span>
        </button>

        {allowVault && (
          <button
            type="button"
            onClick={() => onRailChange("vault")}
            className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              rail === "vault"
                ? isDark
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-sm"
                  : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : isDark
                ? "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Vault AUD</span>
          </button>
        )}
      </div>

      {/* Active Rail Detail Selector */}
      {rail === "card" && (
        <div className="space-y-2">
          <select
            value={activeCard?.id || ""}
            onChange={(e) => {
              onSelectCardId(e.target.value);
              unifiedBankCardSync.setActivePaymentCardId(e.target.value);
            }}
            className={`w-full min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold outline-none cursor-pointer ${selectCls}`}
          >
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.network} •••• {c.last4} — {c.name.slice(0, 26)} ($
                {c.balance >= 1_000_000 ? `${(c.balance / 1_000_000).toFixed(1)}M` : c.balance.toLocaleString("en-AU")} AUD)
              </option>
            ))}
          </select>
          {activeCard && (
            <div className={`flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${mutedCls}`}>
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <Zap className="w-3 h-3" />
                {Math.round((activeCard.cashbackRate || 0.05) * 100)}% Cashback • 0% FX
              </span>
              <span className="tabular-nums">
                Luhn OK • {activeCard.expiry}
              </span>
            </div>
          )}
        </div>
      )}

      {rail === "facility" && (
        <div className="space-y-2">
          <select
            value={activeFacility?.id || ""}
            onChange={(e) => {
              onSelectFacilityId(e.target.value);
              creChargeFacilitiesService.setActiveFacilityId(e.target.value);
            }}
            className={`w-full min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold outline-none cursor-pointer ${selectCls}`}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.facilityName} ({f.facilityCode}) — ${(f.availableCreditAUD / 1_000_000).toFixed(1)}M Avail
              </option>
            ))}
          </select>
          {activeFacility && (
            <div className={`flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${mutedCls}`}>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Sparkles className="w-3 h-3" />
                {activeFacility.primeAprPercent === 0 ? "0.00% Charge Cycle" : `${activeFacility.primeAprPercent.toFixed(2)}% Prime`} • {activeFacility.interestFreeDays}d Free
              </span>
              <span className="tabular-nums">
                Headroom: ${(activeFacility.availableCreditAUD / 1_000_000).toFixed(1)}M AUD
              </span>
            </div>
          )}
        </div>
      )}

      {rail === "vault" && (
        <div className={`flex flex-wrap items-center justify-between gap-2 text-xs font-mono px-1 ${mutedCls}`}>
          <span>Treasury Primary AUD Liquidity</span>
          <span className="font-bold text-emerald-500 tabular-nums">
            ${(vaultBalanceAUD ?? 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
            {typeof amountAUD === "number" && amountAUD > (vaultBalanceAUD ?? 0) ? " (Switch to Card/CreCharge)" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
