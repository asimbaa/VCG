import React, { useState } from "react";
import { 
  Smartphone, 
  CreditCard, 
  Wifi, 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Loader2, 
  Receipt,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

interface SovereignEFTPOSProps {
  user?: any;
  balances?: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function SovereignEFTPOS({ user, balances = {}, setBalances }: SovereignEFTPOSProps) {
  const [amount, setAmount] = useState("");
  const [terminalState, setTerminalState] = useState<"idle" | "waiting_tap" | "processing" | "approved">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"nfc" | "chip" | "manual">("nfc");
  const [lastTxn, setLastTxn] = useState<any | null>(null);

  const handleStartTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid transaction amount");
      return;
    }
    setTerminalState("waiting_tap");
    toast.info("Terminal Ready: Present card or device for Contactless Tap");
  };

  const handleSimulateTap = async (cardType: string = "Valourian Centurion") => {
    setTerminalState("processing");
    const amt = parseFloat(amount.replace(/,/g, ""));

    setTimeout(async () => {
      try {
        const currentAud = balances.AUD || 0;
        const updatedBalance = currentAud + amt;

        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            "balances.AUD": updatedBalance,
          });

          await addDoc(collection(db, "transactions"), {
            userId: user.uid,
            date: new Date().toISOString(),
            amount: amt,
            currency: "AUD",
            recipient: "In-Store POS Merchant Settlement",
            type: "pos_eftpos",
            cardUsed: cardType,
            authCode: `AUTH-EMV-${Math.floor(100000 + Math.random() * 900000)}`,
            status: "completed",
            description: `Host Card Emulation Direct Tap: $${amt.toFixed(2)} AUD received via Tyro/EFTPOS Terminal.`
          });
        }

        if (setBalances) {
          setBalances(prev => ({
            ...prev,
            AUD: updatedBalance
          }));
        }

        const txnResult = {
          stan: Math.floor(100000 + Math.random() * 900000),
          authCode: `AUTH-EMV-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: amt,
          card: cardType,
          terminalId: "TYRO-AU-88129",
          timestamp: new Date().toLocaleTimeString()
        };

        setLastTxn(txnResult);
        setTerminalState("approved");
        toast.success(`✓ Contactless Tap Approved: $${amt.toFixed(2)} AUD settled into CommBank Smart Access!`);
      } catch (err: any) {
        toast.error("Terminal settlement failed: " + (err?.message || "Error"));
        setTerminalState("idle");
      }
    }, 1200);
  };

  const handleReset = () => {
    setTerminalState("idle");
    setAmount("");
    setLastTxn(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Sovereign EFTPOS & POS Terminal
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono">
                  EMV ISO/IEC 14443
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Direct in-store contactless tap & terminal clearing bypassing 3P mobile wallets via Host Card Emulation.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Terminal Status</span>
              <span className="text-xl font-black font-mono text-cyan-400">ONLINE & READY</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* EFTPOS Terminal Hardware Simulator (Span 6) */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-[2.5rem] p-8 border-4 border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
          {/* Terminal Screen */}
          <div className="bg-slate-950 rounded-2xl p-6 border-2 border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-500 border-b border-slate-800 pb-2">
              <span>VALOURIAN EFTPOS v3.2</span>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>TYRO LINK 100%</span>
              </div>
            </div>

            <div className="py-6 text-center space-y-2">
              {terminalState === "idle" && (
                <>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Enter Charge Amount</div>
                  <div className="text-4xl font-black font-mono text-white">
                    ${amount ? parseFloat(amount).toFixed(2) : "0.00"} <span className="text-xs text-slate-500">AUD</span>
                  </div>
                </>
              )}

              {terminalState === "waiting_tap" && (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 mx-auto flex items-center justify-center animate-bounce">
                    <Wifi className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="text-base font-black text-cyan-300">PRESENT CARD OR TAP DEVICE</div>
                  <div className="text-3xl font-black font-mono text-white">${parseFloat(amount).toFixed(2)} AUD</div>
                </div>
              )}

              {terminalState === "processing" && (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-sm font-black text-white">AUTHORIZING HOST CARD EMULATION...</div>
                </div>
              )}

              {terminalState === "approved" && lastTxn && (
                <div className="space-y-2 text-emerald-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <div className="text-xl font-black tracking-widest uppercase">TRANSACTION APPROVED</div>
                  <div className="text-2xl font-black font-mono text-white">${lastTxn.amount.toFixed(2)} AUD</div>
                  <div className="text-[10px] font-mono text-slate-400">AUTH: {lastTxn.authCode} • STAN: {lastTxn.stan}</div>
                </div>
              )}
            </div>
          </div>

          {/* Keypad & Simulator Controls */}
          {terminalState === "idle" ? (
            <form onSubmit={handleStartTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Charge Amount (AUD)</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xl font-mono font-black text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Initiate Contactless POS Session
              </button>
            </form>
          ) : terminalState === "waiting_tap" ? (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Simulate Direct NFC Tap
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateTap("Valourian Centurion Black (AMEX)")}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-white">AMEX Centurion</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Direct Contactless</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateTap("CommBank Smart Access (Debit)")}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-white">CommBank Debit</div>
                  <div className="text-[10px] text-amber-400 font-mono">EFTPOS Contactless</div>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Next Transaction</span>
            </button>
          )}
        </div>

        {/* Live Terminal Telemetry & Receipt (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-600" />
                <h4 className="text-base font-black text-slate-900">Merchant Terminal Telemetry</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Osko Fast Settlement
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-sans">Merchant Name:</span>
                <span className="font-bold text-slate-900">VALOURIAN CAPITAL PTY LTD</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-sans">Australian Business Number:</span>
                <span className="font-bold text-slate-900">ABN 88 168 900 288</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-sans">Settlement Deposit Account:</span>
                <span className="font-bold text-slate-900">CBA Smart Access 062-140 • 11680690</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-sans">EMV Cryptogram Protocol:</span>
                <span className="font-bold text-cyan-700">ARQC ISO/IEC 14443 Type A/B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
