import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Navigation, CreditCard, LayoutDashboard, Globe, MessageSquare, Zap, CheckCircle2, Server, ShieldCheck, Mail, Map as MapIcon, Key, FileText, Settings2, Command } from "lucide-react";

export function CommandPalette({ isOpen, setIsOpen, setActiveTab }: { isOpen: boolean, setIsOpen: (o: boolean) => void, setActiveTab: (t: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const commands = [
    { id: "treasury", title: "Global Treasury", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "send", title: "Initiate Transfer", icon: <Zap className="w-4 h-4" /> },
    { id: "cards", title: "Digital Cards", icon: <CreditCard className="w-4 h-4" /> },
    { id: "crypto", title: "Crypto Portfolio", icon: <Server className="w-4 h-4" /> },
    { id: "aura", title: "Aura Drive Map", icon: <MapIcon className="w-4 h-4" /> },
    { id: "logistics", title: "Sovereign Logistics", icon: <Globe className="w-4 h-4" /> },
    { id: "deepspace", title: "Deep Space Operations", icon: <Navigation className="w-4 h-4" /> },
    { id: "entities", title: "Portfolio Entities", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "mail", title: "Workspace Mail", icon: <Mail className="w-4 h-4" /> },
    { id: "equities", title: "Global Equities", icon: <Command className="w-4 h-4" /> },
    { id: "vault", title: "Secure Vault", icon: <Key className="w-4 h-4" /> },
    { id: "documents", title: "Corporate Documents", icon: <FileText className="w-4 h-4" /> },
    { id: "deployments", title: "Website Deployments", icon: <Globe className="w-4 h-4" /> },
    { id: "settings", title: "System Settings", icon: <Settings2 className="w-4 h-4" /> },
  ];

  const filtered = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  
  const aiResponses = [
     { q: "hi", r: "Hello, Mr. Asim Aryal. Sovereign systems are running perfectly. How can I assist you with the treasury or operations today?" },
     { q: "balance", r: "Your global treasury liquidity is currently stable across all interconnected accounts. Would you like me to open the Global Treasury tab to review the exact metrics?" },
     { q: "deploy", r: "I can prepare a deployment node immediately. Initiating the Website Deployments protocol..." },
     { q: "cards", r: "Your Valourian Black Cards are fully active. Physical manufacturing is underway with our Gemalto partnership." },
     { q: "order", r: "Procurement records indicate successful missing orders delivery. I can open the Past Orders ledger for your review." },
     { q: "status", r: "All systems are green. Aura-9 Neural Engine is perfectly synchronized." }
  ];

  const getAIResponse = (q: string) => {
     if (q.length < 2) return null;
     const match = aiResponses.find(res => q.toLowerCase().includes(res.q));
     if (match) return match.r;
     return `I am analyzing your request: "${q}". My neural net is cross-referencing Valourian records. Shall I open the deep space terminal for a deeper dive?`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 sm:pt-32 px-4 backdrop-blur-md bg-black/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 border-b border-slate-800">
            <Command className="w-5 h-5 text-indigo-500 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 px-4 py-5 text-lg outline-none"
              placeholder="Ask Sovereign AI, search commands, or execute tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsOpen(false);
                if (e.key === "Enter" && filtered.length > 0) {
                  setActiveTab(filtered[0].id);
                  setIsOpen(false);
                }
              }}
            />
            <div className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">ESC</div>
          </div>
          <div className="max-h-96 overflow-y-auto p-2 hide-scrollbar flex flex-col gap-1">
            {query.length > 1 && (
               <div className="px-4 py-4 mb-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                     <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                         <Sparkles className="w-3.5 h-3.5 text-white" />
                     </div>
                     <div>
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-1">Sovereign AI Response</div>
                        <p className="text-slate-200 text-sm leading-relaxed">{getAIResponse(query)}</p>
                     </div>
                  </div>
               </div>
            )}
            {filtered.length === 0 && query.length === 0 && (
               <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Modules</div>
            )}
            {filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  setActiveTab(cmd.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-slate-800 text-left ${i === 0 && query !== "" ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                    <div className={`${i === 0 && query !== "" ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {cmd.icon}
                    </div>
                    <span className="font-medium">{cmd.title}</span>
                </div>
                <div className="flex gap-2">
                    {i === 0 && query !== "" && <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400/70">Press Enter</span>}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
        {/* Click outside to close */}
        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)}></div>
      </div>
    </AnimatePresence>
  );
}