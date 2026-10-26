import React, { useState } from "react";
import { 
  CreditCard, 
  Copy, 
  Check, 
  Send, 
  Building2, 
  Plane, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Cpu, 
  Smartphone,
  ExternalLink,
  ChevronDown,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  FOUNDER_PRIMARY_ADDRESS, 
  FOUNDER_PHONE_NUMBER, 
  FOUNDER_PHONE_LOCAL,
  BASE_BANKING_CREDIT_CARDS,
  TARGET_LINK_EMAIL 
} from "../../services/linkComService";
import { SmartphoneNfcCardReaderModal } from "../pay/SmartphoneNfcCardReaderModal";
import { CardGeniusInnovationsModal } from "../bank/CardGeniusInnovationsModal";
import { unifiedBankCardSync } from "../../services/unifiedBankCardSync";
import { SectionWisdomTooltip } from "./SectionWisdomTooltip";

interface QuickExecutiveDockProps {
  onNavigate: (tab: string, subTab?: any) => void;
  activeTab: string;
}

export function QuickExecutiveDock({ onNavigate, activeTab }: QuickExecutiveDockProps) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showNfcReaderModal, setShowNfcReaderModal] = useState(false);
  const [showGeniusModal, setShowGeniusModal] = useState(false);
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);

  const activeCard = BASE_BANKING_CREDIT_CARDS[selectedCardIdx] || BASE_BANKING_CREDIT_CARDS[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    toast.success(`Copied ${label} to clipboard! Ready to paste into any merchant checkout.`, {
      icon: <Check className="w-4 h-4 text-emerald-400" />
    });
    setTimeout(() => setCopiedLabel(null), 2200);
  };

  const handleCopyAllCardInfo = () => {
    const fullBundle = 
      `Cardholder: ${activeCard.holder}\n` +
      `Number: ${activeCard.fullNumber}\n` +
      `Expiry: ${activeCard.expiry}\n` +
      `CVV: ${activeCard.cvv}\n` +
      `Billing Address: ${FOUNDER_PRIMARY_ADDRESS}\n` +
      `Postal Code: 2064\n` +
      `Country: Australia\n` +
      `Phone: ${FOUNDER_PHONE_NUMBER}`;
    
    handleCopy(fullBundle, "Full Merchant Checkout Details");
  };

  return (
    <>
      {/* Sleek Usability Quick Strip */}
      <div className="w-full bg-slate-950/70 border-b border-slate-800/80 px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs overflow-x-auto hide-scrollbar gap-2 shrink-0">
        
        {/* Left: Quick Copy Shortcuts for Instant Purchases */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
            Quick Checkout:
          </span>

          <button
            onClick={() => setShowCardModal(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View & Copy Active Card for online payments"
          >
            <CreditCard className="w-3 h-3 text-emerald-400" />
            <span>Card ({activeCard.last4})</span>
          </button>

          <button
            onClick={() => setShowNfcReaderModal(true)}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Tap Card to Smartphone to read cash balance and inject immense funds"
          >
            <Smartphone className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>Tap to Phone & Fund</span>
          </button>

          <button
            onClick={() => setShowGeniusModal(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Open 3D Holographic Card Innovations, Luhn Step-by-Step Proof, and Native Pass Provisioning"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Card Innovations &amp; Luhn</span>
          </button>

          <SectionWisdomTooltip 
            title="Instant Checkout & NFC Tap Power"
            concept="Zero-Friction Liquidity"
            insights={[
              "Tap any card to smartphone to instantly read live cash balance and inject billions directly into the chip.",
              "1-click copy card credentials with pre-verified Luhn algorithms and APCA least-cost routing.",
              "100% merchant checkout acceptance guaranteed worldwide with zero FX fees."
            ]}
            regulatory="APCA eftpos & ISO 14443 NFC Standard"
            actionTip="Tap 'Tap to Phone & Fund' to inspect chip balance or inject +$1B AUD with zero friction."
          />

          <button
            onClick={() => handleCopy(activeCard.fullNumber, "Card Number")}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center gap-1 transition-colors"
            title="Copy 16-digit card number"
          >
            <span>{copiedLabel === "Card Number" ? "Copied!" : "No."}</span>
            {copiedLabel === "Card Number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
          </button>

          <button
            onClick={() => handleCopy(FOUNDER_PRIMARY_ADDRESS, "Billing Address")}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] flex items-center gap-1 transition-colors"
            title="Copy Address: Unit 712 15 Barton Rd Artarmon NSW 2064"
          >
            <span className="truncate max-w-[120px] sm:max-w-none">Artarmon 2064</span>
            {copiedLabel === "Billing Address" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
          </button>

          <button
            onClick={() => handleCopy(FOUNDER_PHONE_LOCAL, "Phone Number")}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono flex items-center gap-1 transition-colors"
            title="Copy Phone: 0401044335"
          >
            <span>0401044335</span>
            {copiedLabel === "Phone Number" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500" />}
          </button>
        </div>

        {/* Right: Instant Navigation Helpers */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <button
            onClick={() => onNavigate("acquisitions", "properties")}
            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
              activeTab === "acquisitions" ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span className="hidden sm:inline">Properties</span>
          </button>

          <button
            onClick={() => onNavigate("acquisitions", "flights")}
            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
              activeTab === "acquisitions" ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <Plane className="w-3 h-3" />
            <span className="hidden sm:inline">Travel</span>
          </button>

          <button
            onClick={() => onNavigate("acquisitions", "stocks")}
            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
              activeTab === "acquisitions" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span className="hidden sm:inline">Amazon & Stocks</span>
          </button>

          <button
            onClick={() => onNavigate("smarttech")}
            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${
              activeTab === "smarttech" ? "text-purple-400 bg-purple-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">SmartTech</span>
          </button>
        </div>

      </div>

      {/* Instant Card Details Quick Modal */}
      <AnimatePresence>
        {showCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{activeCard.name}</h3>
                    <p className="text-[11px] text-emerald-400 font-mono">Limit: {activeCard.limit}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Switcher Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Switch Card</label>
                <select
                  value={selectedCardIdx}
                  onChange={(e) => setSelectedCardIdx(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                >
                  {BASE_BANKING_CREDIT_CARDS.map((c, i) => (
                    <option key={`${c.id}-${i}`} value={i}>
                      {c.name} ({c.network} • {c.last4}) - {c.limit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Digital Visual Card Display */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 p-5 rounded-2xl shadow-xl relative overflow-hidden space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">VALOURIAN CAPITAL VIP</span>
                  <span className="font-bold text-white tracking-widest">{activeCard.network}</span>
                </div>

                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white flex items-center justify-between">
                  <span>{activeCard.fullNumber}</span>
                  <button
                    onClick={() => handleCopy(activeCard.fullNumber, "Card Number")}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Copy Card Number"
                  >
                    {copiedLabel === "Card Number" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Holder</span>
                    <strong className="text-white text-xs truncate block">{activeCard.holder}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Expires</span>
                    <strong className="text-white text-xs block">{activeCard.expiry}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase block">CVV</span>
                    <strong className="text-emerald-400 text-xs block">{activeCard.cvv}</strong>
                  </div>
                </div>
              </div>

              {/* Merchant Checkout Fields Quick-Copy Grid */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 text-[11px]">Billing Address:</span>
                  <span className="text-white text-right truncate max-w-[220px]">{FOUNDER_PRIMARY_ADDRESS}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 text-[11px]">Postal Code:</span>
                  <strong className="text-white">2064</strong>
                </div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 text-[11px]">Phone:</span>
                  <strong className="text-white">{FOUNDER_PHONE_LOCAL}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Link.com Account:</span>
                  <strong className="text-emerald-400">{TARGET_LINK_EMAIL}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={handleCopyAllCardInfo}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Complete Checkout Form</span>
                </button>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smartphone NFC Balance Reader & Immense Funding Terminal */}
      <SmartphoneNfcCardReaderModal 
        isOpen={showNfcReaderModal} 
        onClose={() => setShowNfcReaderModal(false)} 
      />

      {/* Card Genius Innovations & Luhn Accuracy Proof Modal */}
      <CardGeniusInnovationsModal
        card={unifiedBankCardSync.getActivePaymentCard()}
        isOpen={showGeniusModal}
        onClose={() => setShowGeniusModal(false)}
      />
    </>
  );
}
