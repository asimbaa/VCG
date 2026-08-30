import React, { useState } from 'react';
import { Network, Bitcoin, Banknote, ArrowRight, Wallet, ShieldCheck, MapPin, QrCode, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SovereignGatewaysTab() {
  const [activeView, setActiveView] = useState<'routing' | 'atm'>('routing');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Network className="w-8 h-8 text-emerald-500" />
            Sovereign Payment Gateways
          </h2>
          <p className="text-slate-400 mt-2">Enterprise Crypto-to-Fiat Liquidity Routing & Global ATM Networks.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button 
            onClick={() => setActiveView('routing')}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeView === 'routing' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Liquidity Routing
          </button>
          <button 
            onClick={() => setActiveView('atm')}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeView === 'atm' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            ATM Withdrawals
          </button>
        </div>
      </div>

      {activeView === 'routing' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Visual routing flow */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <Lock className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <div className="font-bold text-white">Cold Storage</div>
                <div className="text-xs text-slate-400 font-mono">Multi-Sig Vault</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center z-10">
              <ArrowRight className="w-8 h-8 text-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <Bitcoin className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <div className="font-bold text-white">Dark Pool OTC</div>
                <div className="text-xs text-slate-400 font-mono">Zero-Slippage Exec</div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center z-10">
              <ArrowRight className="w-8 h-8 text-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Banknote className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <div className="font-bold text-white">Fiat Settlement</div>
                <div className="text-xs text-slate-400 font-mono">SWIFT / RTGS (T+0)</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Multi-Sig Security Protocol</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> 3-of-5 threshold signatures required for transfers &gt; $10M.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Geographic dispersion of HSM key shards across Swiss & Dubai bunkers.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Automated AI compliance scanning before broadcast to mempool.</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-500" /> Deep Liquidity Venues</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Institutional Dark Pools (Cumberland, Genesis).</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> API integration with global tier-1 banking rails (SEPA, Faster Payments).</li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Real-time FX hedging to eliminate volatility risk during transit.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" /> Global Crypto ATM Withdrawal Protocol
              </h3>
              <p className="text-sm text-slate-400 mt-1">Legified workflows for extracting physical fiat directly from decentralized assets.</p>
            </div>
            
            <div className="p-6">
              <div className="relative border-l border-slate-700 ml-3 md:ml-6 space-y-8 pb-4">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[33px] w-8 h-8 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <div className="pl-6">
                    <h4 className="text-white font-bold text-lg mb-2">Locate & Verify ATM Network</h4>
                    <p className="text-slate-400 text-sm mb-3">AI Agent identifies nearest high-liquidity two-way Crypto ATM (e.g., General Bytes, Genesis Coin) supporting fiat dispensing.</p>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 inline-flex items-center gap-4 text-xs font-mono">
                      <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400">Network Active</span></div>
                      <div><span className="text-slate-500">Max Dispense:</span> <span className="text-white">$10,000 / Tx</span></div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[33px] w-8 h-8 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <div className="pl-6">
                    <h4 className="text-white font-bold text-lg mb-2">Automated KYC / AML Handshake</h4>
                    <p className="text-slate-400 text-sm mb-3">Sovereign Gateway pre-authorizes compliance data via API if the ATM operator supports institutional endpoints. Otherwise, QR-based SMS/ID verification is prepared.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[33px] w-8 h-8 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                  <div className="pl-6">
                    <h4 className="text-white font-bold text-lg mb-2">Execute Transfer & Await Confirmations</h4>
                    <p className="text-slate-400 text-sm mb-4">User scans ATM receipt QR code. Sovereign Gateway broadcasts exact crypto amount (+ network fee) with RBF (Replace-By-Fee) enabled to guarantee next-block inclusion.</p>
                    <div className="flex items-center gap-3">
                      <QrCode className="w-12 h-12 text-slate-300 p-2 bg-slate-800 rounded-lg" />
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Address Scanned</div>
                        <div className="text-sm font-mono text-emerald-400">bc1qxy2kgdygjrsqtzq2n0yrf249...</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[33px] w-8 h-8 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white">4</div>
                  <div className="pl-6">
                    <h4 className="text-white font-bold text-lg mb-2">Fiat Extraction</h4>
                    <p className="text-slate-400 text-sm">Upon 1 network confirmation (approx 10 mins for BTC, 15 secs for ETH/LTC), ATM unlocks cash dispenser. Physical fiat is extracted and logged in Valourian Treasury.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
