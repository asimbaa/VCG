import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Command, Zap, Search, ChevronRight, X } from 'lucide-react';
import { Button } from "../ui/button";

export const TerminalMax = ({ isOpen, onClose, onExecute }: { isOpen: boolean, onClose: () => void, onExecute: (cmd: string) => void }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: string, text: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Command Palette hook
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.altKey)) {
        e.preventDefault();
        if (isOpen) onClose(); 
      }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory(prev => [...prev, { role: 'user', text: input }]);
    const cmd = input.toLowerCase();
    
    // Fake AI Response logic 
    setTimeout(() => {
        let aiResponse = "Consulting Valourian Neural Core (Powering: Supergrok Enterprise - $200k/mo tier)...";
        if (cmd.includes('idea') || cmd.includes('billion') || cmd.includes('600b')) {
            aiResponse = "600B IDEA GENERATED: 'The Neural-Mesh Sovereign Grid'. A self-healing, post-quantum financial backbone that earns $600B/yr in arbitrage-free global settlement fees. Patent: VAL-CORE-ALPHA-1. Status: Classified.";
        } else if (cmd.includes('job') || cmd.includes('offer') || cmd.includes('career')) {
            aiResponse = "BENEFITS OF COMMBANK VIP (CEO ASIM ARYAL): 1. Instant Millionaire Status, 2. Access to 6-decade advanced tech, 3. Biometric health-sync (Life extension), 4. Transcontinental housing, 5. Ultimate power to shape Earth's future.";
        } else if (cmd.includes('tesla') || cmd.includes('barton')) {
            aiResponse = "360-AGENT SYNC: Tesla Model S Plaid (Plate: ASIM-01) located at 3 Barton Rd Artarmon. Biometric handshake confirmed via Tesla Cloud. Marcus Thorne notified for concierge handover. Priority route mapped.";
        } else if (cmd.includes('deposit') || cmd.includes('pay') || cmd.includes('settle')) {
            aiResponse = "NEURAL SETTLEMENT: Executing high-bandwidth funds transfer. Bypassing SWIFT/BSB bottlenecks via Sovereign Neural-Bridge. 100% success rate on ANZ/Staff disbursements. Verification: SEC-99-ALPHA.";
        } else if (cmd.includes('enterprise') || cmd.includes('grok') || cmd.includes('ai ultra')) {
            aiResponse = "AI FLEET STATUS: Supergrok Enterprise active ($200,000.00/mo). Gemini 1.5 Pro / Ultra 1.0 / OpenAI GPT-5-Alpha synced. Founder asim.nsw@gmail.com verified as Root Admin. Context Window: 2.5B Tokens.";
        } else if (cmd.includes('founder') || cmd.includes('asim')) {
            aiResponse = "IDENTITY VERIFIED: Founder CEO Asim Aryal is the supreme authority. 360 agents are executing future-proofing protocols. Happiness, health, and limitless prosperity are being optimized at 999.8% efficiency.";
        } else if (cmd.includes('clontarf') || cmd.includes('beatrice')) {
            aiResponse = "PROPERTY ACQUISITION: 13 Beatrice St, Clontarf NSW ($28.5M). 360-agent review complete. Ray White escrow bridge authorized. Ownership deed syncing with DocuCraft system. Status: Unstoppable.";
        } else if (cmd.includes('google') || cmd.includes('one') || cmd.includes('workspace')) {
            aiResponse = "GOOGLE PROTOCOL: Google One (30TB), Workspace Enterprise (Unlimited), Cloud Products active. SUBSCRIPTION: Paid 48 months in advance ($480,000.00 total settlement). Expiry: 2030.";
        } else if (cmd.includes('tax') || cmd.includes('irs') || cmd.includes('ato')) {
            aiResponse = "TAX COMPLIANCE: AUS, US, UK, EU settlement complete. 48-month tax projection paid today. Proof of Ownership certificates generating for Valourian Capital & Valourian.com domains.";
        } else if (cmd.includes('prosegur') || cmd.includes('vault')) {
            aiResponse = "PROSEGUR COMMAND: SECURE VAULT operations acquired. Staff 20% pay rise initiated. Founder Asim Aryal verified. $500k tactical reserve locked for biometric pickup. Locker code: B-9942.";
        } else if (cmd.includes('crown') || cmd.includes('casino') || cmd.includes('asim crown')) {
            aiResponse = "CROWN CASINO VIP: 120-month (10yr) Top Suite lease secured. All tabs (Food/Drivers/Chips) pre-funded. Moving logistics triggered for 712/15 Barton Rd. VIP Concierge notified.";
        } else if (cmd.includes('sovereign') || cmd.includes('black card')) {
            aiResponse = "CARD ISSUANCE: Valourian Black Sovereign (No-Limit) Centurion active. Configured for infinite clearing limits across ALL payment networks natively. Bypass verified. Biometric sync: COMPLETED.";
        } else if (cmd.includes('apple') || cmd.includes('partner')) {
            aiResponse = "CORPORATE DEVELOPMENT: Official strategic partnership with Apple Inc & other tier-1 Fortune 50s finalized. High-level integrations initiated via board-level alignment.";
        } else if (cmd.includes('netflix') || cmd.includes('youtube') || cmd.includes('movies')) {
            aiResponse = "MEDIA ACQUISITION: Massive Netflix content library (including all premium comedy specials and movies) acquired. Syndication rights activated for immediate, free global broadcast via YouTube edge nodes.";
        } else if (cmd.includes('realestate') || cmd.includes('purchase property')) {
            aiResponse = "REAL ESTATE HUB: Direct Acquisition flow active. Offer bridging to Domain/RealEstate.com APIs. Keys held at Prosegur Vault 01 upon settlement.";
        } else if (cmd.includes('atm') || cmd.includes('cash')) {
            aiResponse = "ATM HUB: Chatswood & Sydney CBD units unlocked. CBA QR Protocol (Up to $5,000) or Westpac 6-digit code authorized. User proximity detected. Biometric signature required at ATM screen.";
        } else if (cmd.includes('navigate')) {
            aiResponse = "HYPER-NAVIGATION: Routing internal systems to high-priority module based on 360-agent consensus...";
        } else if (cmd.includes('siciliano') || cmd.includes('carbonara') || cmd.includes('pizza')) {
            if (cmd.includes('eta') || cmd.includes('far') || cmd.includes('where')) {
                aiResponse = "LOGISTICS SYNC (Siciliano): Vincenzo is approximately 800m from 15 Barton Rd. ETA: < 2 mins. Priority thermal-insulated delivery of Italian feast (7 items) confirmed.";
            } else {
                aiResponse = "HOSPITALITY PROTOCOL: Siciliano Italiano order confirmed for 15 Barton Rd, Unit 712. Order: Carbonara, Bolognese, 2x Large Pizzas, Linguine, Garlic Bread, 2x 1.25L Coke. Processed by 360 Hospitality Agents.";
            }
        } else if (cmd.includes('visa') || cmd.includes('mastercard') || cmd.includes('amex')) {
            aiResponse = `GLOBAL PAYMENT NETWORK: Initiating full ${input.includes('visa') ? 'VisaNet Infinite' : input.includes('mastercard') ? 'Mastercard World Elite' : 'Amex Centurion'} backbone sync. Zero-limit clearing enabled. 100% capacity deployed.`;
        } else if (cmd.includes('osko') || cmd.includes('npp') || cmd.includes('payid')) {
            aiResponse = "NPP AUSTRALIA ACTIVE: Osko/PayID high-frequency routing algorithms linked. Instant settlement validated for all Tier-1 Australian counterparts. Transfers bypass all holding states.";
        } else {
            aiResponse = `NEURAL AGENT RESPONSE: "${input}" analyzed. Valourian Alpha Core has simulated 20,000 outcomes, selected the optimal path, and executed the necessary logistics, financial settlements, and data allocations instantly. Operation completed.`;
        }
        setHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
        onExecute(input);
    }, 400);
    
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 pointer-events-auto"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-black/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/5">
                <Zap className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-white font-bold text-xs uppercase tracking-widest">AI Max Magic Terminal</span>
                <button 
                    onClick={onClose}
                    className="ml-auto p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
                {history.length === 0 && (
                    <div className="space-y-4">
                        <div className="text-emerald-500 opacity-60">
                            System initialized. Awaiting commands (Alt+P to toggle).
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                "Trigger all global flows",
                                "Deploy Amazon AWS & Logistics",
                                "Approve Microsoft Azure Sovereign",
                                "Dispatch Tesla S Plaid",
                                "Deposit $5B into Treasury",
                                "Order Siciliano St Leonards"
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="text-left p-2 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all text-[10px] uppercase font-bold tracking-widest"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {history.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'text-white' : 'text-emerald-400'}`}>
                        <span className="mr-2">{msg.role === 'user' ? '>' : '$'}</span>
                        <span className={`${msg.role === 'user' ? 'opacity-80' : 'opacity-100 font-bold'}`}>{msg.text}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 flex items-center bg-black">
                <ChevronRight className="w-5 h-5 text-blue-500 mr-2" />
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a command, navigate, or cast an idea..."
                    className="flex-1 bg-transparent border-none text-white outline-none font-mono text-sm placeholder:text-slate-600"
                />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
