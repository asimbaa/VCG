import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bitcoin, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, Send, Download, FileJson, FileText, ArrowRightLeft, Wallet, Copy, ExternalLink, QrCode, Building2, Banknote, Activity } from "lucide-react";
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
    { id: "usd", symbol: "USD", name: "US Dollar", balance: 5000000000.50, icon: "$" },
    { id: "aud", symbol: "AUD", name: "Australian Dollar", balance: 250000000000.00, icon: "A$" },
    { id: "eur", symbol: "EUR", name: "Euro", balance: 1800000000.00, icon: "€" },
    { id: "gbp", symbol: "GBP", name: "British Pound", balance: 1250000000.00, icon: "£" }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"fiat" | "crypto">("crypto");


  const [showTransfer, setShowTransfer] = useState<"send" | "receive" | null>(null);
  
  // Transfer states
  const [transferAsset, setTransferAsset] = useState<string>('');
  const [transferDestination, setTransferDestination] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  // deleted

  
  // Transfer states
const [isProcessing, setIsProcessing] = useState(false);


  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,tether,ripple,cardano&order=market_cap_desc&per_page=10&page=1&sparkline=false");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const balances: Record<string, number> = {
        bitcoin: 45000000.45,
        ethereum: 350000000.2,
        solana: 4500000000.5,
        tether: 250000000000.0,
        ripple: 150000000000.0,
        cardano: 45000000000.0,
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


  const exportData = (format: 'csv' | 'json') => {
    try {
        const dataToExport = viewMode === 'crypto' ? prices : fiatBalances;
        const timestamp = new Date().toISOString();
        const filename = `treasury_audit_${viewMode}_${timestamp}.${format}`;
        
        let fileContent = '';
        let mimeType = '';
        
        if (format === 'json') {
            fileContent = JSON.stringify({
                type: 'valourian_treasury_audit',
                timestamp,
                asset_class: viewMode,
                total_value_usd: viewMode === 'crypto' ? totalCryptoValue : totalFiatValue,
                assets: dataToExport
            }, null, 2);
            mimeType = 'application/json';
        } else {
            if (viewMode === 'crypto') {
                const headers = ['Asset', 'Symbol', 'Price (USD)', 'Balance', 'Total Value (USD)'];
                const rows = prices.map(p => [
                    p.name, 
                    p.symbol, 
                    p.current_price, 
                    p.balance, 
                    (p.current_price * p.balance).toFixed(2)
                ]);
                fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            } else {
                const headers = ['Asset', 'Symbol', 'Balance', 'Value (USD)'];
                const rows = fiatBalances.map(f => [
                    f.name,
                    f.symbol,
                    f.balance,
                    f.balance.toFixed(2)
                ]);
                fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            }
            mimeType = 'text/csv';
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Successfully exported ${viewMode.toUpperCase()} portfolio as ${format.toUpperCase()}`);
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Failed to export data");
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const totalCryptoValue = prices.reduce((acc, coin) => acc + (coin.balance * coin.current_price), 0);
  const totalFiatValue = fiatBalances.reduce((acc, fiat) => acc + fiat.balance, 0); // Simplified assuming 1:1 for display

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div 
        className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden"
        style={{
            /* CSS 1 overrides as requested by User */
        }}
      >
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
          
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                  <FileText className="w-4 h-4 mr-2" />
                  CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('json')} className="text-slate-600 border-slate-200 hover:bg-slate-50 mr-4">
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON
              </Button>
              {viewMode === 'crypto' && (
              <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={isLoading} className="text-slate-500">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              )}
          </div>

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
                {showTransfer === "send" ? (viewMode === 'crypto' ? 'Withdraw (Coinbase / Crypto ATM)' : 'Withdraw to Bank') : (viewMode === 'crypto' ? 'Receive Crypto' : 'Deposit Fiat')}
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
                    <select 
                        value={transferAsset} 
                        onChange={(e) => setTransferAsset(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="" disabled>Select an asset...</option>
                      {viewMode === 'crypto' 
                        ? prices.map(p => <option key={p.id} value={p.id}>{p.name} ({p.balance} {p.symbol})</option>)
                        : fiatBalances.map(f => <option key={f.id} value={f.id}>{f.name} ({f.icon}{f.balance} {f.symbol})</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {viewMode === 'crypto' ? 'Destination (Coinbase Wallet / ATM Kiosk ID)' : 'Bank Account (BSB & Account / IBAN)'}
                    </label>
                    <input 
                        type="text" 
                        value={transferDestination}
                        onChange={(e) => setTransferDestination(e.target.value)}
                        placeholder={viewMode === 'crypto' ? "Enter Coinbase Address or 'ATM-XXX'..." : "Bank Details..."} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        />
                        <button 
                            onClick={() => {
                                if (transferAsset) {
                                    const max = viewMode === 'crypto' 
                                        ? prices.find(p => p.id === transferAsset)?.balance 
                                        : fiatBalances.find(f => f.id === transferAsset)?.balance;
                                    if (max) setTransferAmount(max.toString());
                                }
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-300"
                        >
                            MAX
                        </button>
                    </div>
                  </div>
                  <Button 
                    disabled={isProcessing || !transferAsset || !transferDestination || !transferAmount || parseFloat(transferAmount) <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20" 
                    onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                            if (viewMode === 'crypto') {
                                setPrices(prev => prev.map(p => p.id === transferAsset ? {...p, balance: p.balance - parseFloat(transferAmount)} : p));
                                
                                const isATM = transferDestination.toLowerCase().includes('atm');
                                const isCoinbase = transferDestination.toLowerCase().includes('coinbase');
                                
                                if (isATM) {
                                    toast.success(`Withdrawal of ${transferAmount} initiated for Crypto ATM network (AUS/Overseas). SMS confirmation code dispatched.`, { duration: 6000 });
                                } else if (isCoinbase) {
                                     toast.success(`Successfully sent ${transferAmount} to Coinbase Australia Wallet ${transferDestination.substring(0, 8)}...`, { duration: 6000 });
                                } else {
                                     toast.success(`Successfully sent ${transferAmount} to ${transferDestination.substring(0, 8)}...`, { duration: 6000 });
                                }
                            } else {
                                setFiatBalances(prev => prev.map(f => f.id === transferAsset ? {...f, balance: f.balance - parseFloat(transferAmount)} : f));
                                toast.success(`Wire transfer of ${transferAmount} initiated to ${transferDestination}`, { duration: 6000 });
                            }
                            setIsProcessing(false);
                            setShowTransfer(null);
                            setTransferAsset('');
                            setTransferDestination('');
                            setTransferAmount('');
                        }, 1500);
                  }}>
                    {isProcessing ? 'Processing Transfer...' : 'Confirm Transfer'}
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

      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                  Algorithmic Yield Farming
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Activity className="w-3 h-3 animate-pulse" /> LIVE ACCUMULATION
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[{ asset: 'BTC', apy: '4.2%', earned: '0.0412 BTC' }, { asset: 'ETH', apy: '8.5%', earned: '1.24 ETH' }, { asset: 'USDC', apy: '12.0%', earned: '$14,500.00' }].map((farm, i) => (
                  <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col gap-2 hover:border-purple-500/30 transition-colors shadow-lg">
                      <div className="flex justify-between items-center text-sm font-bold mb-2">
                          <span className="text-slate-400 uppercase tracking-widest">{farm.asset} Pool</span>
                          <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-xs">{farm.apy} APY</span>
                      </div>
                      <div className="text-3xl font-black text-white">+{farm.earned}</div>
                      <div className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Auto-Compounding
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}

