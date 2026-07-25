import re

with open("src/components/bank/CryptoPortfolio.tsx", "r") as f:
    content = f.read()

# I will just write a new component for CryptoPortfolio.tsx that implements both fiat and crypto
new_content = """import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bitcoin, ArrowUpRight, ArrowDownRight, RefreshCw, Send, ArrowRightLeft, Wallet, Copy, ExternalLink, QrCode, Building2, Banknote } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  balance: number;
}

interface FiatBalance {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

export function CryptoPortfolio() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [fiatBalances, setFiatBalances] = useState<FiatBalance[]>([
    { id: "usd", symbol: "USD", name: "US Dollar", balance: 145020.50, icon: "$" },
    { id: "aud", symbol: "AUD", name: "Australian Dollar", balance: 25400.00, icon: "A$" },
    { id: "eur", symbol: "EUR", name: "Euro", balance: 8400.00, icon: "€" },
    { id: "gbp", symbol: "GBP", name: "British Pound", balance: 12500.00, icon: "£" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"fiat" | "crypto">("crypto");
  const [showTransfer, setShowTransfer] = useState<"send" | "receive" | null>(null);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,tether,ripple,cardano&order=market_cap_desc&per_page=10&page=1&sparkline=false");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const balances: Record<string, number> = {
        bitcoin: 2.45,
        ethereum: 34.2,
        solana: 450.5,
        tether: 25400.0,
        ripple: 15400.0,
        cardano: 45000.0,
      };

      const formatted = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        balance: balances[coin.id] || 0,
      }));
      setPrices(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch market prices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const totalCryptoValue = prices.reduce((acc, coin) => acc + (coin.balance * coin.current_price), 0);
  const totalFiatValue = fiatBalances.reduce((acc, fiat) => acc + fiat.balance, 0); // Simplified assuming 1:1 for display

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] -ml-48 -mb-48 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-6">
              <Wallet className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Treasury Vault</span>
            </div>
            <h1 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Total {viewMode === 'crypto' ? 'Digital Asset' : 'Fiat'} Balance</h1>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight flex items-center gap-4">
              ${(viewMode === 'crypto' ? totalCryptoValue : totalFiatValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {viewMode === 'crypto' && (
              <span className="text-lg font-bold bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl flex items-center gap-1 border border-emerald-500/30">
                <ArrowUpRight className="w-5 h-5" />
                +2.4%
              </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-2 bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setViewMode("fiat")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === "fiat" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              FIAT
            </button>
            <button
              onClick={() => setViewMode("crypto")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === "crypto" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              CRYPTO
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
            <button onClick={() => setShowTransfer("receive")} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2">
                <ArrowDownRight className="w-5 h-5" />
                {viewMode === 'crypto' ? 'RECEIVE CRYPTO' : 'DEPOSIT FIAT'}
            </button>
            <button onClick={() => setShowTransfer("send")} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                <Send className="w-5 h-5" />
                {viewMode === 'crypto' ? 'SEND TO COINBASE' : 'SEND TO BANK'}
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900">Asset Allocation</h3>
          {viewMode === 'crypto' && (
          <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={isLoading} className="text-slate-500">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-4 md:grid-cols-5 gap-4 border-b border-slate-100 pb-4 text-xs uppercase tracking-widest font-black text-slate-400 px-4">
            <div>Asset</div>
            <div>{viewMode === 'crypto' ? 'Price' : ''}</div>
            <div className="hidden md:block">{viewMode === 'crypto' ? '24h Change' : ''}</div>
            <div>Holdings</div>
            <div className="text-right">Total Value (USD)</div>
          </div>
          
          <div className="space-y-3">
            {viewMode === 'crypto' ? (
                prices.map((coin) => (
                  <div key={coin.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-slate-50 md:bg-transparent p-4 rounded-2xl md:rounded-none md:border-b md:border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-10 h-10 md:w-8 md:h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-slate-900">{coin.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{coin.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Price</span>
                      <span className="font-mono text-sm font-semibold text-slate-700">${coin.current_price.toLocaleString()}</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-1 text-sm font-bold">
                        <span className={coin.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-4 h-4 inline" /> : <ArrowDownRight className="w-4 h-4 inline" />}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                    </div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Holdings</span>
                      <span className="font-mono text-sm font-semibold text-slate-700">{coin.balance.toLocaleString()} {coin.symbol}</span>
                    </div>
                    
                    <div className="flex justify-between md:block md:text-right pt-2 md:pt-0 border-t border-slate-200 md:border-0 mt-2 md:mt-0">
                      <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Value</span>
                      <span className="font-bold text-slate-900">${(coin.balance * coin.current_price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))
            ) : (
                fiatBalances.map((fiat) => (
                  <div key={fiat.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-slate-50 md:bg-transparent p-4 rounded-2xl md:rounded-none md:border-b md:border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                          {fiat.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{fiat.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{fiat.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block"></div>
                    <div className="hidden md:block"></div>
                    
                    <div className="flex justify-between md:block">
                      <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Holdings</span>
                      <span className="font-mono text-sm font-semibold text-slate-700">{fiat.icon}{fiat.balance.toLocaleString()} {fiat.symbol}</span>
                    </div>
                    
                    <div className="flex justify-between md:block md:text-right pt-2 md:pt-0 border-t border-slate-200 md:border-0 mt-2 md:mt-0">
                      <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Value</span>
                      <span className="font-bold text-slate-900">${fiat.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))
            )}
            
            {viewMode === 'crypto' && prices.length === 0 && !isLoading && (
              <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl">No assets found</div>
            )}
          </div>
        </div>
      </div>

      {showTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                {showTransfer === "send" ? (viewMode === 'crypto' ? 'Withdraw to Coinbase' : 'Withdraw to Bank') : (viewMode === 'crypto' ? 'Receive Crypto' : 'Deposit Fiat')}
              </h3>
              <button onClick={() => setShowTransfer(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {showTransfer === "send" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Asset</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold">
                      {viewMode === 'crypto' 
                        ? prices.map(p => <option key={p.id} value={p.id}>{p.name} ({p.balance} {p.symbol})</option>)
                        : fiatBalances.map(f => <option key={f.id} value={f.id}>{f.name} ({f.icon}{f.balance} {f.symbol})</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {viewMode === 'crypto' ? 'Coinbase Wallet Address' : 'Bank Account (BSB & Account / IBAN)'}
                    </label>
                    <input type="text" placeholder={viewMode === 'crypto' ? "0x..." : "Bank Details..."} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20" onClick={() => {
                    toast.success(`Transfer initiated to ${viewMode === 'crypto' ? 'Coinbase Wallet' : 'Bank Account'}`);
                    setShowTransfer(null);
                  }}>
                    Confirm Transfer
                  </Button>
                </>
              ) : (
                <>
                  {viewMode === 'crypto' ? (
                      <>
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                          <QrCode className="w-48 h-48 text-slate-900" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Your Deposit Address</label>
                        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <code className="flex-1 text-xs text-slate-700 truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                          <button onClick={() => toast.success("Address copied!")} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                            <Copy className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-500 font-medium px-4">
                        Only send supported ERC-20 tokens or ETH to this address.
                      </div>
                      </>
                  ) : (
                      <>
                      <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Wire Transfer Details</label>
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Bank</span>
                              <span className="font-bold text-slate-900">Valourian Sovereign</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Routing</span>
                              <span className="font-mono text-slate-900">021000021</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Account</span>
                              <span className="font-mono text-slate-900">8499210045</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-500 font-medium px-4">
                        Transfers may take 1-3 business days to clear.
                      </div>
                      </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
"""

with open("src/components/bank/CryptoPortfolio.tsx", "w") as f:
    f.write(new_content)

