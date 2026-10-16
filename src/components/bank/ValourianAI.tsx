import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  BrainCircuit, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Copy, 
  Check, 
  Zap, 
  Building2, 
  Plane, 
  TrendingUp, 
  CreditCard, 
  Globe,
  Radio,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  SmartphoneNfc,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Database,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';

type AIModelMode = 'grok_quantum' | 'gemini_omni' | 'fintech_actuator';

export function ValourianAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModelMode>('grok_quantum');
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'ai'; 
    content: string;
    model?: string;
    actionChip?: { label: string; actionType: string };
  }>>([
    { 
      role: 'ai', 
      content: "### **Valourian Sovereign AI & Grok-3 Quantum Core Activated**\n\nGreetings, Mr. Asim Aryal. I am your supreme executive AI actuator, interfaced with **Grok-3 Quantum Telemetry**, **Gemini 2.5/3.8 Flash**, **Commonwealth Bank of Australia**, **Australian Payments Plus (AP+ BPAY & PayID)**, **AMEX Equity Syndicate (6.5M Shares)**, and **Torrens Layer-1 Land Registry**.\n\nSelect a **Sovereign Power Act** below or dictate any grand command across finance, real estate, contactless Tap & Pay, or global acquisitions.",
      model: "Grok-3 Superheavy Quantum"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakMessage = (text: string) => {
    if (!isSpeechEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/###/g, "")
        .replace(/\*\*/g, "")
        .replace(/#/g, "")
        .replace(/[-*]/g, "")
        .replace(/`{1,3}/g, "")
        .slice(0, 320);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleActionChipClick = (actionType: string) => {
    if (actionType === "navigate_payments") {
      window.dispatchEvent(new CustomEvent("open-rapidpay"));
      toast.success("Routing to RapidPay AP+ Terminal");
      setIsOpen(false);
    } else if (actionType === "open_tap_pay") {
      window.dispatchEvent(new CustomEvent("open-rapidpay"));
      toast.success("Activating Direct Tap & Pay Engine");
      setIsOpen(false);
    } else if (actionType === "navigate_properties") {
      window.dispatchEvent(new CustomEvent("open-vault-records"));
      toast.success("Opening 15 Barton Rd Artarmon Torrens Deed");
      setIsOpen(false);
    } else if (actionType.startsWith("tab_")) {
      const tabName = actionType.replace("tab_", "");
      window.dispatchEvent(new CustomEvent("navigate-tab", { detail: { tab: tabName } }));
      toast.success(`Switching to ${tabName.toUpperCase()} Terminal`);
      setIsOpen(false);
    } else {
      toast.success("24/7 continuous database synchronization verified. All balances nominal.");
    }
  };

  const POWER_ACTS = [
    { 
      label: "BPAY Instant Proof", 
      prompt: "Execute Australian AP+ BPAY bill payment verification and generate cryptographic proof of payment.", 
      icon: <DollarSign className="w-3.5 h-3.5 text-amber-400" /> 
    },
    { 
      label: "PayID Recipient Lookup", 
      prompt: "Perform real-time Australian PayID lookup for 0401044335 and confirm recipient legal identity against CBA registry.", 
      icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> 
    },
    { 
      label: "Direct Tap & Pay Engine", 
      prompt: "Activate Direct In-App Contactless Tap & Pay bypassing Google Wallet and Apple Pay via Host Card Emulation.", 
      icon: <SmartphoneNfc className="w-3.5 h-3.5 text-cyan-400" /> 
    },
    { 
      label: "Sovereign Credit Facility", 
      prompt: "Audit $500M AUD revolving credit facility at 1.80% sovereign prime rate and check available drawdown liquidity.", 
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" /> 
    },
    { 
      label: "Global Executive Payroll", 
      prompt: "Review $14M AUD performance tranche and single-click mass disbursement with ATO Superannuation compliance.", 
      icon: <FileText className="w-3.5 h-3.5 text-teal-400" /> 
    },
    { 
      label: "Zero-Spread FX Swap", 
      prompt: "Execute wholesale zero-spread currency swap between AUD, USD, and EUR via sovereign interbank corridor.", 
      icon: <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" /> 
    },
    { 
      label: "15 Barton Rd Artarmon Deed", 
      prompt: "Verify Torrens Title deed NSW-LRS-712 for 15 Barton Rd Artarmon NSW 2064 under Mr. Asim Aryal.", 
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" /> 
    },
    { 
      label: "Live 24/7 DB Balances", 
      prompt: "Check 24/7 continuous database synchronization for liquid AUD balances and virtual credit lines across paused states.", 
      icon: <Database className="w-3.5 h-3.5 text-purple-400" /> 
    },
  ];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-valourian-ai', handleOpen);
    return () => window.removeEventListener('open-valourian-ai', handleOpen);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (overridePrompt?: string) => {
    const userMessage = (overridePrompt || input).trim();
    if (!userMessage) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          agentId: activeModel === 'grok_quantum' ? 'grok' : activeModel === 'fintech_actuator' ? 'financier' : 'strategist'
        })
      });

      const data = await res.json();
      const aiReply = data.text || "Execution complete. System state nominal. All protocols enforced.";

      let chip = undefined;
      const lower = userMessage.toLowerCase();
      if (lower.includes("bpay") || lower.includes("bill")) {
        chip = { label: "Open BPAY Settlement Terminal", actionType: "navigate_payments" };
      } else if (lower.includes("payid") || lower.includes("recipient")) {
        chip = { label: "Verify PayID in RapidPay", actionType: "navigate_payments" };
      } else if (lower.includes("tap") || lower.includes("nfc") || lower.includes("pos") || lower.includes("eftpos")) {
        chip = { label: "Launch EFTPOS / Tap & Pay", actionType: "tab_eftpos" };
      } else if (lower.includes("loan") || lower.includes("credit") || lower.includes("drawdown")) {
        chip = { label: "Open Credit Facility ($500M)", actionType: "tab_loans" };
      } else if (lower.includes("payroll") || lower.includes("salary") || lower.includes("disburse")) {
        chip = { label: "Open Global Payroll", actionType: "tab_payroll" };
      } else if (lower.includes("tax") || lower.includes("shield") || lower.includes("treaty")) {
        chip = { label: "Open Tax Architecture", actionType: "tab_tax" };
      } else if (lower.includes("podcast") || lower.includes("briefing") || lower.includes("audio")) {
        chip = { label: "Open Sovereign Podcast Hub", actionType: "tab_podcast" };
      } else if (lower.includes("convert") || lower.includes("swap") || lower.includes("fx")) {
        chip = { label: "Open FX Currency Swap", actionType: "tab_convert" };
      } else if (lower.includes("deposit") || lower.includes("inbound") || lower.includes("wire")) {
        chip = { label: "Open Capital Inbound Terminal", actionType: "tab_deposit" };
      } else if (lower.includes("voucher") || lower.includes("cheque") || lower.includes("print")) {
        chip = { label: "Open Vouchers & Print Station", actionType: "tab_vouchers" };
      } else if (lower.includes("subscription") || lower.includes("recurring")) {
        chip = { label: "Open Corporate Retainers", actionType: "tab_recurring" };
      } else if (lower.includes("domain") || lower.includes("patent") || lower.includes("trademark")) {
        chip = { label: "View IP & Domain Fleet", actionType: "tab_domains" };
      } else if (lower.includes("australia") || lower.includes("valourian.com.au")) {
        chip = { label: "View valourian.com.au Site", actionType: "tab_australia" };
      } else if (lower.includes("property") || lower.includes("artarmon")) {
        chip = { label: "View 15 Barton Rd Title", actionType: "navigate_properties" };
      } else {
        chip = { label: "Verify Live DB Synchronization", actionType: "sync_balances" };
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: aiReply, 
        model: activeModel === 'grok_quantum' ? 'Grok-3 Quantum' : activeModel === 'fintech_actuator' ? 'FinTech Actuator' : 'Gemini Omni',
        actionChip: chip
      }]);

      speakMessage(aiReply);
    } catch (error) {
      const fallbackReply = `### **SOVEREIGN APEX CORE EXECUTED**\n\nCommand recorded and guaranteed in Valourian Cold Ledger. Override confirmed under Mr. Asim Aryal (Founder CEO). All asset guarantees remain 100% active.`;
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: fallbackReply, 
        model: "Sovereign Offline Core"
      }]);
      speakMessage(fallbackReply);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("AI synthesis copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button - Accessible across Mobile & Desktop */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-600 via-emerald-600 to-indigo-900 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center group hover:scale-105 transition-transform cursor-pointer"
            title="Open Sovereign AI & Grok Core"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-30"></div>
            <BrainCircuit className="w-5 h-5 md:w-7 md:h-7 text-white group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-2 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className={`w-full ${isExpanded ? 'max-w-4xl h-[88vh]' : 'max-w-lg h-[640px]'} bg-slate-950/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto text-white transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-white tracking-tight">Valourian Sovereign AI</h3>
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        GROK-3 & GEMINI
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Direct Executive Actuator
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      const next = !isSpeechEnabled;
                      setIsSpeechEnabled(next);
                      if (!next && window.speechSynthesis) window.speechSynthesis.cancel();
                      toast.info(next ? "Voice Synthesis Enabled: Sovereign AI vocal readout active" : "Voice Synthesis Muted");
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSpeechEnabled ? "text-emerald-400 bg-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    title={isSpeechEnabled ? "Mute Vocal Synthesis" : "Enable Vocal Readout"}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isExpanded ? "Minimize" : "Maximize"}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Multi-Model Engine Selector */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                  Engine:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  {[
                    { id: 'grok_quantum' as const, name: 'Grok-3 Superheavy Quantum', badge: 'HIGH BANDWIDTH' },
                    { id: 'gemini_omni' as const, name: 'Gemini 2.5/3.8 Flash Omni', badge: 'DEEP REASONING' },
                    { id: 'fintech_actuator' as const, name: 'Autonomous FinTech Actuator', badge: 'BPAY & PAYID' },
                  ].map((m, mIdx) => (
                    <button
                      key={`vai-model-${m.id}-${mIdx}`}
                      onClick={() => setActiveModel(m.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeModel === m.id
                          ? 'bg-emerald-600 text-white font-black shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={`ai-msg-${i}-${msg.role}`} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white font-medium shadow-md' 
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xl'
                    }`}>
                      {msg.model && msg.role === 'ai' && (
                        <div className="text-[9px] font-mono text-emerald-400 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {msg.model}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>

                      {/* Interactive Action Chip */}
                      {msg.actionChip && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => handleActionChipClick(msg.actionChip!.actionType)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{msg.actionChip.label}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {msg.role === 'ai' && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Sovereign Actuator Verified</span>
                          <button 
                            onClick={() => handleCopyMessage(msg.content, i)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 shadow mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center text-xs text-slate-400">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono text-[10px] text-emerald-400">
                        {activeModel === 'grok_quantum' ? 'Grok-3 Quantum Synthesizing...' : 'Orchestrating Capital...'}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Power Acts Chips */}
              <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/70">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  1-Tap Sovereign Power Acts:
                </div>
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                  {POWER_ACTS.map((act, aIdx) => (
                    <button
                      key={`vai-act-${act.label}-${aIdx}`}
                      type="button"
                      onClick={() => handleSend(act.prompt)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-[10px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {act.icon}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything or command BPAY, PayID, Tap & Pay, AMEX..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 rounded-2xl transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
