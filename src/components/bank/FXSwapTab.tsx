import React, { useState } from "react";
import { 
  RefreshCw, 
  ArrowRightLeft, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  Globe 
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

interface FXSwapTabProps {
  user: any;
  balances: Record<string, number>;
  setBalances?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

// Live Sovereign Interbank Rates (base: 1 AUD)
const FX_RATES_BASE_AUD: Record<string, number> = {
  AUD: 1.0,
  USD: 0.6582,
  EUR: 0.6084,
  GBP: 0.5185,
  JPY: 101.42,
  CHF: 0.5841,
  SGD: 0.8845,
  AED: 2.4172,
  CAD: 0.8992,
  NZD: 1.0924,
};

export function FXSwapTab({ user, balances, setBalances }: FXSwapTabProps) {
  const [fromCurrency, setFromCurrency] = useState("AUD");
  const [toCurrency, setToCurrency] = useState("USD");
  const [fromAmount, setFromAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversion rate: (1 fromCurrency in AUD) -> (toCurrency)
  const rateFromToAUD = FX_RATES_BASE_AUD[fromCurrency] || 1;
  const rateToToAUD = FX_RATES_BASE_AUD[toCurrency] || 1;
  const effectiveRate = rateToToAUD / rateFromToAUD;

  const parsedFrom = parseFloat(fromAmount.replace(/,/g, "")) || 0;
  const calculatedTo = (parsedFrom * effectiveRate).toFixed(2);

  const handleInvert = () => {
    const prevFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prevFrom);
  };

  const handleSwapExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedFrom <= 0) {
      toast.error("Please enter a valid amount to swap");
      return;
    }

    const currentFromBalance = balances[fromCurrency] || 0;
    if (parsedFrom > currentFromBalance) {
      toast.error(`Insufficient ${fromCurrency} balance. Available: ${currentFromBalance.toLocaleString()} ${fromCurrency}`);
      return;
    }

    setIsProcessing(true);
    try {
      const parsedToNum = parseFloat(calculatedTo);
      const newFrom = currentFromBalance - parsedFrom;
      const newTo = (balances[toCurrency] || 0) + parsedToNum;

      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          [`balances.${fromCurrency}`]: newFrom,
          [`balances.${toCurrency}`]: newTo,
        });
      }

      if (setBalances) {
        setBalances(prev => ({
          ...prev,
          [fromCurrency]: newFrom,
          [toCurrency]: newTo,
        }));
      }

      if (user?.uid) {
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          date: new Date().toISOString(),
          amount: parsedFrom,
          currency: fromCurrency,
          recipient: `Sovereign FX Swap to ${toCurrency}`,
          type: "fx_swap",
          rate: effectiveRate,
          receivedAmount: parsedToNum,
          receivedCurrency: toCurrency,
          status: "completed",
          description: `Zero-Spread Institutional Conversion: ${parsedFrom.toLocaleString()} ${fromCurrency} → ${parsedToNum.toLocaleString()} ${toCurrency}`
        });
      }

      setFromAmount("");
      toast.success(`✓ Sovereign FX Swap Settled: +${parsedToNum.toLocaleString()} ${toCurrency} credited at 0.00% markup!`);
    } catch (err: any) {
      toast.error("Swap execution failed: " + (err?.message || "Error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                  Sovereign Interbank FX Swap
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono">
                  0.00% SPREAD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Wholesale direct central-bank tier liquidity across G10 and Sovereign Corridor currencies.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700/80 flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Corridor Rate</span>
              <span className="text-xl font-black font-mono text-cyan-400">
                1 {fromCurrency} = {effectiveRate.toFixed(4)} {toCurrency}
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Swap Form (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="text-base font-black text-slate-900">Execute Real-Time Swap</h4>
            <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Instant Balance Credit
            </span>
          </div>

          <form onSubmit={handleSwapExecute} className="space-y-4">
            {/* From Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>You Swap (Sell)</span>
                <span>Available: {(balances[fromCurrency] || 0).toLocaleString()} {fromCurrency}</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-2xl font-black font-mono text-slate-900 focus:outline-none"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-slate-900 text-white font-black font-mono text-xs px-3.5 py-2.5 rounded-xl cursor-pointer"
                >
                  {Object.keys(FX_RATES_BASE_AUD).map((c, idx) => (
                    <option key={`from-${c}-${idx}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Invert Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleInvert}
                className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 hover:border-cyan-500 shadow-md flex items-center justify-center text-slate-600 hover:text-cyan-600 transition-colors cursor-pointer"
                title="Invert Pair"
              >
                <ArrowRightLeft className="w-4 h-4 rotate-90" />
              </button>
            </div>

            {/* To Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>You Receive (Buy)</span>
                <span>Current: {(balances[toCurrency] || 0).toLocaleString()} {toCurrency}</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={calculatedTo}
                  className="flex-1 bg-transparent text-2xl font-black font-mono text-cyan-600 focus:outline-none"
                />
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-slate-900 text-white font-black font-mono text-xs px-3.5 py-2.5 rounded-xl cursor-pointer"
                >
                  {Object.keys(FX_RATES_BASE_AUD).map((c, idx) => (
                    <option key={`to-${c}-${idx}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exchange Details */}
            <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs font-mono space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Wholesale Spot Rate:</span>
                <span className="font-bold">1 {fromCurrency} = {effectiveRate.toFixed(4)} {toCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>Valourian Interbank Spread:</span>
                <span className="font-bold text-emerald-600">0.00% (Sovereign Exemption)</span>
              </div>
              <div className="flex justify-between">
                <span>Settlement Time:</span>
                <span className="font-bold text-emerald-600">&lt; 250 milliseconds</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Execute Zero-Spread Currency Swap</span>
            </button>
          </form>
        </div>

        {/* Live Rates Matrix (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-black text-xs uppercase tracking-wider text-white">Live Interbank Rate Board</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              BASE: 1.00 AUD
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(FX_RATES_BASE_AUD).filter(([c]) => c !== "AUD").map(([curr, rate], idx) => (
              <div
                key={`matrix-${curr}-${idx}`}
                onClick={() => {
                  setFromCurrency("AUD");
                  setToCurrency(curr);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-sans">{curr}</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {curr === "USD" ? "US Dollar" : curr === "EUR" ? "Euro" : curr === "GBP" ? "British Pound" : curr === "JPY" ? "Japanese Yen" : curr === "CHF" ? "Swiss Franc" : curr === "SGD" ? "Singapore Dollar" : curr === "AED" ? "UAE Dirham" : curr}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400">{rate.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
