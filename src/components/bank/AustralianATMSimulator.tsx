import React, { useState } from "react";
import { 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Receipt, 
  Printer, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  playAtmAudio, 
  USER_LOCAL_PHONE, 
  USER_REGISTERED_PHONE, 
  CBA_ATM_LOCATIONS, 
  WESTPAC_ATM_LOCATIONS,
  AtmCashSession 
} from "../../services/atmCashService";

interface AustralianATMSimulatorProps {
  initialSession?: AtmCashSession | null;
  onCashCollected?: (amount: number, bank: "CBA" | "Westpac") => void;
}

export function AustralianATMSimulator({ initialSession, onCashCollected }: AustralianATMSimulatorProps) {
  const [bankMode, setBankMode] = useState<"CBA" | "Westpac">(
    initialSession?.type === "westpac_emergency" ? "Westpac" : "CBA"
  );
  
  // ATM Screen Flow: 'welcome' | 'enter_code' | 'enter_pin' | 'processing' | 'dispensing' | 'collected'
  const [screenState, setScreenState] = useState<"welcome" | "enter_code" | "enter_pin" | "processing" | "dispensing" | "collected">("welcome");
  const [inputCode, setInputCode] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [dispensedAmount, setDispensedAmount] = useState<number>(initialSession?.amount || 200);
  const [dispensedNotes, setDispensedNotes] = useState<{ fifty: number; hundred: number }>({ fifty: 2, hundred: 1 });
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeAtmLocation, setActiveAtmLocation] = useState(
    bankMode === "CBA" ? CBA_ATM_LOCATIONS[0] : WESTPAC_ATM_LOCATIONS[0]
  );

  const isCBA = bankMode === "CBA";

  const handleKeypadPress = (val: string) => {
    playAtmAudio("keypad");
    if (screenState === "enter_code") {
      const maxLen = isCBA ? 8 : 6;
      if (inputCode.replace(/\s/g, "").length < maxLen) {
        setInputCode(prev => prev + val);
      }
    } else if (screenState === "enter_pin") {
      if (inputPin.length < 4) {
        setInputPin(prev => prev + val);
      }
    }
  };

  const handleKeypadBackspace = () => {
    playAtmAudio("beep");
    if (screenState === "enter_code") {
      setInputCode(prev => prev.slice(0, -1));
    } else if (screenState === "enter_pin") {
      setInputPin(prev => prev.slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    playAtmAudio("beep");
    if (screenState === "enter_code") setInputCode("");
    if (screenState === "enter_pin") setInputPin("");
  };

  const handleQuickFill = (session: AtmCashSession) => {
    playAtmAudio("beep");
    if (session.type === "cba_cardless") {
      setBankMode("CBA");
      setInputCode(session.cbaClaimCode?.replace(/\s/g, "") || "84921029");
      setInputPin(session.cbaPin || "4912");
      setDispensedAmount(session.amount);
      setScreenState("enter_code");
      toast.info("CommBank Cardless Cash Code autofilled into ATM");
    } else if (session.type === "westpac_emergency") {
      setBankMode("Westpac");
      setInputCode(session.westpacCode?.replace(/\s/g, "") || "682914");
      setDispensedAmount(session.amount);
      setScreenState("enter_code");
      toast.info("Westpac Emergency Cash Code autofilled into ATM");
    }
  };

  const handleCodeSubmit = () => {
    const cleanCode = inputCode.replace(/\s/g, "");
    const requiredLen = isCBA ? 8 : 6;
    if (cleanCode.length < requiredLen) {
      toast.error(`Please enter full ${requiredLen}-digit cash code`);
      return;
    }

    playAtmAudio("beep");
    if (isCBA) {
      setScreenState("enter_pin");
    } else {
      executeDispense();
    }
  };

  const handlePinSubmit = () => {
    if (inputPin.length < 4) {
      toast.error("Please enter 4-digit Cash PIN");
      return;
    }
    executeDispense();
  };

  const executeDispense = () => {
    setScreenState("processing");
    playAtmAudio("counting");

    setTimeout(() => {
      // Calculate note distribution ($50 and $100 notes)
      const amt = dispensedAmount || 200;
      const hundreds = Math.floor(amt / 100);
      const remaining = amt % 100;
      const fifties = Math.floor(remaining / 50);

      setDispensedNotes({
        hundred: hundreds,
        fifty: fifties > 0 ? fifties : (hundreds === 0 ? 1 : 0)
      });

      playAtmAudio("dispense");
      setScreenState("dispensing");
      toast.success(`ATM Cash Dispensed: $${amt} AUD in Australian polymer banknotes!`);
    }, 2200);
  };

  const handleTakeCash = () => {
    playAtmAudio("success");
    setScreenState("collected");
    if (onCashCollected) {
      onCashCollected(dispensedAmount, bankMode);
    }
    toast.success(`✓ $${dispensedAmount} AUD Cash Collected! Registered to Mr. Asim Aryal (${USER_LOCAL_PHONE}).`);
  };

  const handleResetAtm = () => {
    playAtmAudio("beep");
    setScreenState("welcome");
    setInputCode("");
    setInputPin("");
  };

  return (
    <div className="space-y-6">
      {/* Bank Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setBankMode("CBA");
                setActiveAtmLocation(CBA_ATM_LOCATIONS[0]);
                handleResetAtm();
              }}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                isCBA 
                  ? "bg-[#ffcc00] text-slate-950 shadow-lg shadow-yellow-500/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="w-3.5 h-3.5 bg-black rotate-45 border border-yellow-400" />
              <span>CommBank ATM (2,000+ AUS)</span>
            </button>

            <button
              onClick={() => {
                setBankMode("Westpac");
                setActiveAtmLocation(WESTPAC_ATM_LOCATIONS[0]);
                handleResetAtm();
              }}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                !isCBA 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="font-serif font-black text-sm">W</span>
              <span>Westpac ATM (Australia-Wide)</span>
            </button>
          </div>
        </div>

        {initialSession && screenState === "welcome" && (
          <button
            onClick={() => handleQuickFill(initialSession)}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Active Cash Code (${initialSession.amount} AUD)</span>
          </button>
        )}
      </div>

      {/* ATM Physical Kiosk Chassis */}
      <div className={`rounded-[3rem] p-6 sm:p-10 border-4 shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isCBA 
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-yellow-500/40 shadow-yellow-500/5" 
          : "bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950 border-red-600/40 shadow-red-600/5"
      }`}>
        {/* Top Header Marquee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            {isCBA ? (
              <div className="w-12 h-12 bg-[#ffcc00] rounded-2xl flex items-center justify-center text-slate-950 shadow-md">
                <div className="w-6 h-6 bg-slate-950 rotate-45 border-2 border-yellow-300" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-md font-serif font-black text-2xl">
                W
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">
                  {isCBA ? "Commonwealth Bank of Australia" : "Westpac Banking Corporation"}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase ${
                  isCBA ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40" : "bg-red-500/20 text-red-300 border border-red-500/40"
                }`}>
                  {isCBA ? "CARDLESS CASH READY" : "EMERGENCY CASH ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {activeAtmLocation.name} • {activeAtmLocation.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              Terminal ID: {isCBA ? "CBA-ATM-8821" : "WBC-ATM-4902"}
            </span>
          </div>
        </div>

        {/* ATM Screen & Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
          {/* Touchscreen Glass Display (Span 7) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-slate-800 shadow-inner flex flex-col justify-between min-h-[420px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Screen Header */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isCBA ? "CommBank Cardless Cash Protocol" : "Westpac Emergency Cash Rail"}
              </span>
              <span>AU Local: {USER_LOCAL_PHONE}</span>
            </div>

            {/* Screen Center Dynamic Content */}
            <div className="py-6 flex-1 flex flex-col justify-center text-center">
              {screenState === "welcome" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                      {isCBA ? "Welcome to CommBank Cardless Cash" : "Welcome to Westpac Emergency Cash"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                      Collect physical cash without your card using your instant {isCBA ? "8-digit claim code" : "6-digit emergency code"} dispatched to {USER_LOCAL_PHONE}.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        playAtmAudio("beep");
                        setScreenState("enter_code");
                      }}
                      className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCBA ? "bg-[#ffcc00] text-slate-950 hover:bg-yellow-400" : "bg-red-600 text-white hover:bg-red-500"
                      }`}
                    >
                      <span>I Have a Cash Pickup Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {screenState === "enter_code" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
                      Step 1 of {isCBA ? "2" : "1"}: Enter Cash Claim Code
                    </span>
                    <h4 className="text-lg font-black text-white">
                      {isCBA ? "Enter 8-Digit CommBank Cash Code" : "Enter 6-Digit Westpac Cash Code"}
                    </h4>
                  </div>

                  {/* Digit Display */}
                  <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl py-4 px-6 max-w-xs mx-auto">
                    <span className="font-mono text-3xl font-black tracking-[0.25em] text-emerald-400">
                      {inputCode || <span className="text-slate-600">{"•".repeat(isCBA ? 8 : 6)}</span>}
                    </span>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleCodeSubmit}
                      disabled={inputCode.length < (isCBA ? 8 : 6)}
                      className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Continue
                    </button>
                    <button
                      onClick={handleResetAtm}
                      className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {screenState === "enter_pin" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
                      Step 2 of 2: Security Verification
                    </span>
                    <h4 className="text-lg font-black text-white">
                      Enter 4-Digit CommBank Cash PIN
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">Dispatched via secure SMS to {USER_LOCAL_PHONE}</p>
                  </div>

                  {/* PIN Display */}
                  <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl py-4 px-6 max-w-xs mx-auto">
                    <span className="font-mono text-3xl font-black tracking-[0.3em] text-yellow-400">
                      {inputPin ? "•".repeat(inputPin.length) : <span className="text-slate-600">••••</span>}
                    </span>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handlePinSubmit}
                      disabled={inputPin.length < 4}
                      className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Authorize Cash Dispense
                    </button>
                    <button
                      onClick={() => setScreenState("enter_code")}
                      className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {screenState === "processing" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                  <h4 className="text-xl font-black text-white uppercase tracking-wider">
                    Counting Australian Banknotes...
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Verifying authorization with Reserve Bank of Australia & {isCBA ? "CommBank" : "Westpac"} Core
                  </p>
                </div>
              )}

              {screenState === "dispensing" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">
                      Cash Dispensed: ${dispensedAmount}.00 AUD
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Please collect your notes from the physical dispenser slot below.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleTakeCash}
                      className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/30 transition-all cursor-pointer animate-pulse"
                    >
                      Take Cash (${dispensedAmount} AUD)
                    </button>
                  </div>
                </div>
              )}

              {screenState === "collected" && (
                <div className="space-y-5 animate-fade-in">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                      Transaction Completed
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Cash extracted successfully at {activeAtmLocation.name}. Thank you for using {isCBA ? "CommBank" : "Westpac"}.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      onClick={handleResetAtm}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase cursor-pointer transition-colors"
                    >
                      New Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Screen Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Security Level: Bank Grade Triple-DES</span>
              <span>Helpline: 13 22 21 (CBA) • 132 032 (WBC)</span>
            </div>
          </div>

          {/* ATM Keypad & Hardware Controls (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Metallic Keypad */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border-2 border-slate-700 shadow-xl space-y-4">
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  ATM Tactile Keypad
                </span>
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num, nIdx) => (
                  <button
                    key={`atm-key-${num}-${nIdx}`}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-14 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:scale-95 text-white font-black text-xl shadow-md border border-slate-600 flex items-center justify-center transition-all cursor-pointer font-mono"
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-14 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md border border-amber-600 flex items-center justify-center transition-all cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-14 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:scale-95 text-white font-black text-xl shadow-md border border-slate-600 flex items-center justify-center transition-all cursor-pointer font-mono"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-14 rounded-xl bg-red-700/80 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md border border-red-600 flex items-center justify-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={screenState === "enter_pin" ? handlePinSubmit : handleCodeSubmit}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                ENTER / CONFIRM
              </button>
            </div>

            {/* Cash Dispenser Physical Slot */}
            <div className="bg-slate-950 rounded-3xl p-6 border-2 border-slate-800 text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Cash Dispenser Slot (Australian Polymer Notes)
              </span>

              {/* Physical Slot */}
              <div className="w-full h-16 bg-slate-900 border-4 border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                {screenState === "dispensing" ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="flex -space-x-12 cursor-pointer group"
                    onClick={handleTakeCash}
                    title="Click to take physical notes"
                  >
                    {/* $100 Polymer Note (Dame Nellie Melba / Sir John Monash - Green) */}
                    {Array.from({ length: dispensedNotes.hundred }).map((_, i) => (
                      <div
                        key={`note-100-${i}`}
                        className="w-32 h-16 bg-emerald-600 border border-emerald-400 rounded-lg shadow-xl text-white p-1.5 flex flex-col justify-between font-mono relative overflow-hidden transform -rotate-1 group-hover:-translate-y-2 transition-transform"
                      >
                        <div className="flex justify-between text-[9px] font-bold">
                          <span>AUSTRALIA</span>
                          <span>100</span>
                        </div>
                        <div className="text-[8px] text-emerald-200">SIR JOHN MONASH</div>
                        <div className="text-right text-xs font-black text-yellow-300">$100 AUD</div>
                      </div>
                    ))}

                    {/* $50 Polymer Note (David Unaipon / Edith Cowan - Gold/Amber) */}
                    {Array.from({ length: dispensedNotes.fifty }).map((_, i) => (
                      <div
                        key={`note-50-${i}`}
                        className="w-32 h-16 bg-amber-500 border border-amber-300 rounded-lg shadow-xl text-slate-950 p-1.5 flex flex-col justify-between font-mono relative overflow-hidden transform rotate-2 group-hover:-translate-y-2 transition-transform"
                      >
                        <div className="flex justify-between text-[9px] font-bold">
                          <span>AUSTRALIA</span>
                          <span>50</span>
                        </div>
                        <div className="text-[8px] text-amber-900 font-bold">DAVID UNAIPON</div>
                        <div className="text-right text-xs font-black text-slate-950">$50 AUD</div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="w-48 h-2 bg-slate-800 rounded-full shadow-inner" />
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                {screenState === "dispensing" ? (
                  <span className="text-emerald-400 font-bold animate-pulse">Notes Ready — Click Dispenser to Take Cash</span>
                ) : (
                  "Shutter Locked — Awaiting Code Authorization"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official ATM Paper Slip Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-slate-900 shadow-2xl font-mono text-xs space-y-4 border-2 border-slate-300"
            >
              {/* Receipt Header */}
              <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 space-y-1">
                <h4 className="font-black text-base font-sans">
                  {isCBA ? "COMMONWEALTH BANK OF AUSTRALIA" : "WESTPAC BANKING CORPORATION"}
                </h4>
                <p className="text-[10px] text-slate-600">{activeAtmLocation.address}</p>
                <p className="text-[10px] text-slate-500">ATM ID: {isCBA ? "CBA-ATM-8821" : "WBC-ATM-4902"}</p>
              </div>

              {/* Receipt Body */}
              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span className="font-bold">{new Date().toLocaleString('en-AU')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSACTION:</span>
                  <span className="font-bold">{isCBA ? "CARDLESS CASH PICKUP" : "EMERGENCY CASH PICKUP"}</span>
                </div>
                <div className="flex justify-between">
                  <span>REGISTERED PHONE:</span>
                  <span className="font-bold">{USER_LOCAL_PHONE}</span>
                </div>
                <div className="flex justify-between">
                  <span>ACCOUNT HOLDER:</span>
                  <span className="font-bold">MR ASIM ARYAL</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200">
                  <span>CASH DISPENSED:</span>
                  <span>${dispensedAmount}.00 AUD</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>STATUS:</span>
                  <span>DISPENSED IN FULL</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-3 border-t-2 border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
                <p>Retain receipt for tax and personal records.</p>
                <p>Valourian Sovereign Treasury Core</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                    toast.success("Receipt printed!");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
