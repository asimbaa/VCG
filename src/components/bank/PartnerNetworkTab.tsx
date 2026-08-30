import React, { useState } from "react";
import { Network, ShieldCheck, Activity, Link2, ExternalLink, RefreshCw, Key } from "lucide-react";
import { motion } from "framer-motion";

export function PartnerNetworkTab() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const partners = [
    { name: "Stripe Treasury", type: "Payment Gateway", status: "Connected", latency: "14ms", api: "v2023-10-16" },
    { name: "Plaid", type: "Identity & Balances", status: "Connected", latency: "32ms", api: "v2020-09-14" },
    { name: "SWIFT Global", type: "Wire Transfers", status: "Connected", latency: "110ms", api: "Secure Web API" },
    { name: "ClearBank", type: "Clearing", status: "Connected", latency: "22ms", api: "v1.4" },
    { name: "Australia Post", type: "Logistics", status: "Connected", latency: "45ms", api: "v3" },
    { name: "Apple DEP", type: "Device Procurement", status: "Active", latency: "18ms", api: "REST" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Network className="w-8 h-8 text-emerald-500" />
            Global Partner Network
          </h2>
          <p className="text-slate-400 mt-2">Institutional API connections and Banking-as-a-Service integrations.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          Ping Network
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Link2 className="w-20 h-20 text-emerald-500" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{partner.name}</h3>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{partner.type}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded text-emerald-400 text-xs font-mono flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {partner.status}
              </div>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4" /> Latency</span>
                <span className="text-white font-mono">{partner.latency}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Key className="w-4 h-4" /> API Version</span>
                <span className="text-white font-mono">{partner.api}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Auth Protocol</span>
                <span className="text-emerald-400 font-mono">mTLS / OAuth2.0</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Webhook & Event Firehose</h3>
        <p className="text-slate-400 mb-6 text-sm">Live stream of incoming and outgoing payload events from partner integrations.</p>
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-48 overflow-y-auto font-mono text-xs space-y-2">
            {[...Array(5)].map((_, i) => (
               <div key={i} className="flex gap-4 border-b border-slate-900 pb-2 text-slate-300">
                  <span className="text-emerald-500">[{new Date(Date.now() - i * 14000).toISOString()}]</span>
                  <span className="text-blue-400">POST /v1/treasury/inbound_transfer</span>
                  <span>{"{"} "amount": 500000000, "currency": "USD", "status": "settled" {"}"}</span>
               </div>
            ))}
        </div>
      </div>
    </div>
  );
}
