import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  User,
  BrainCircuit,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Building2,
  CreditCard,
  Radio,
  DollarSign,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Database,
  FileText,
  Landmark,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { runPaidGeminiAssistant, AiActionExecutionResult } from "../../services/aiActionExecutor";

type AIModelMode = "neon_executor" | "carbon_deep_audit" | "search_grounded";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  model?: string;
  actionChip?: { label: string; actionType: string };
  executedActions?: AiActionExecutionResult[];
  urls?: string[];
  isError?: boolean;
}

export function ValourianAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModel, setActiveModel] = useState<AIModelMode>("neon_executor");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "### **Valourian AI Orchestrator (Gemini 4 Paid Core)**\n\nGreetings, Mr. Asim Aryal. I am connected directly to **Google Gemini 4 Neon & Carbon** with unrestricted live execution across **Zero-Decline Bank Cards**, **CreChargeFacilities**, **SovereignStore**, **Uber & Uber Eats**, **Booking.com**, **RapidPay**, and **Workspace Comms**.\n\nSelect a quick command below or tell me any financial, purchasing, card, facility, or workspace task to execute directly.",
      model: "Gemini 4 Neon • Tool Executor",
    },
  ]);
  const [input, setInput] = useState("");
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
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleActionChipClick = (actionType: string) => {
    if (actionType === "navigate_payments") {
      window.dispatchEvent(new CustomEvent("open-rapidpay"));
      setIsOpen(false);
    } else if (actionType === "navigate_properties") {
      window.dispatchEvent(new CustomEvent("open-vault-records"));
      setIsOpen(false);
    } else if (actionType.startsWith("tab_")) {
      const tabName = actionType.replace("tab_", "");
      window.dispatchEvent(new CustomEvent("navigate-tab", { detail: { tab: tabName } }));
      setIsOpen(false);
    }
  };

  const POWER_ACTS = [
    {
      label: "Audit & Repair All Cards (Luhn)",
      prompt: "Run automatic Luhn Mod-10 verification and repair across every Bank Card and confirm Zero-Decline readiness.",
      icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      label: "CreChargeFacilities Status & Draw",
      prompt: "Audit all CreChargeFacilities available credit headroom and open my Credit Facilities hub.",
      icon: <Landmark className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      label: "Issue Disposable Merchant Card",
      prompt: "Issue a new Visa single-use disposable virtual card with $250,000 AUD liquidity locked for SovereignStore checkout.",
      icon: <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      label: "Portfolio & Liquidity Brief",
      prompt: "Summarize my live Bank Cards, CreChargeFacilities utilization, and active store carts from the workspace snapshot.",
      icon: <Database className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      label: "Open RapidPay Terminal",
      prompt: "Navigate me to RapidPay & CreCharge Card hub so I can inspect global transfers.",
      icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      label: "Live Market Grounded Research",
      prompt: "Search latest Australian RBA cash rate & global institutional fintech card interchange trends.",
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" />,
    },
  ];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-valourian-ai", handleOpen);
    return () => window.removeEventListener("open-valourian-ai", handleOpen);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (overridePrompt?: string) => {
    const userMessage = (overridePrompt || input).trim();
    if (!userMessage || isTyping) return;

    setInput("");
    const historyPayload = messages
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({ role: (m.role === "user" ? "user" : "model") as "user" | "model", text: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const result = await runPaidGeminiAssistant({
        message: userMessage,
        mode: activeModel,
        history: historyPayload,
      });

      const firstNav = result.executionResults.find((r) => r.navTab)?.navTab;
      const chip = firstNav
        ? { label: `Open ${firstNav.toUpperCase()} View`, actionType: firstNav === "rapidpay" ? "navigate_payments" : `tab_${firstNav}` }
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: result.text,
          model: `${result.modelUsed} • Live Execution`,
          actionChip: chip,
          executedActions: result.executionResults,
          urls: result.urls,
        },
      ]);

      speakMessage(result.text);
    } catch (error: any) {
      const errMsg = error?.message || "Failed to connect to Gemini 4 server endpoint.";
      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Request could not be completed: ${errMsg}\n\nVerify your paid Gemini API key in **Settings > Secrets** and retry.`,
          model: "Gemini 4 Error",
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 min-w-[52px] min-h-[52px] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 via-emerald-600 to-indigo-900 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center group hover:scale-105 transition-transform cursor-pointer"
            title="Open Valourian Gemini 4 AI Orchestrator"
            aria-label="Open Valourian Gemini 4 AI"
          >
            <BrainCircuit className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-2 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className={`w-full ${
                isExpanded ? "max-w-4xl h-[88dvh]" : "max-w-lg h-[82dvh] sm:h-[650px]"
              } bg-slate-950/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto text-white transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-sm text-white tracking-tight truncate">Valourian AI</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        GEMINI 4 PAID
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate">
                      <Radio className="w-3 h-3 text-emerald-400 shrink-0" /> Unrestricted Tool Orchestrator
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSpeechEnabled;
                      setIsSpeechEnabled(next);
                      if (!next && window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isSpeechEnabled ? "text-emerald-400 bg-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    title={isSpeechEnabled ? "Mute Speech" : "Enable Speech"}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isExpanded ? "Restore size" : "Expand"}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close AI"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <div className="px-3.5 py-2 bg-slate-900/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
                {[
                  { id: "neon_executor" as const, name: "Gemini 4 Neon (Fast Tools)" },
                  { id: "carbon_deep_audit" as const, name: "Gemini 4 Carbon (Deep Audit)" },
                  { id: "search_grounded" as const, name: "Gemini 4 + Google Search" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveModel(m.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeModel === m.id
                        ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={`ai-msg-${i}-${msg.role}`} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow mt-1 ${
                          msg.isError ? "bg-rose-600" : "bg-gradient-to-tr from-emerald-500 to-indigo-600"
                        }`}
                      >
                        {msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white font-medium shadow-md"
                          : msg.isError
                          ? "bg-rose-950/70 border border-rose-500/40 text-rose-100 shadow-lg"
                          : "bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl"
                      }`}
                    >
                      {msg.model && msg.role === "ai" && (
                        <div className={`text-[10px] font-mono mb-1 flex items-center gap-1 ${msg.isError ? "text-rose-300" : "text-emerald-400"}`}>
                          <Sparkles className="w-3 h-3" /> {msg.model}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                      {msg.executedActions && msg.executedActions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Executed Workspace Actions:
                          </div>
                          {msg.executedActions.map((act, aIdx) => (
                            <div
                              key={aIdx}
                              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-xl border ${
                                act.success
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                              }`}
                            >
                              ✓ {act.summary}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.urls && msg.urls.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Verified Web Sources:</div>
                          {msg.urls.slice(0, 4).map((u, uIdx) => (
                            <a
                              key={uIdx}
                              href={u}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline truncate"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{u}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {msg.actionChip && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleActionChipClick(msg.actionChip!.actionType)}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{msg.actionChip.label}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {msg.role === "ai" && !msg.isError && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Gemini 4 Paid Execution</span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.content, i)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 shadow mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center text-xs text-slate-400">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2">
                      <span className="font-mono text-[11px] text-emerald-400">
                        Running {activeModel === "carbon_deep_audit" ? "Gemini 4 Carbon" : "Gemini 4 Neon"}...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Power Acts */}
              <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {POWER_ACTS.map((act, aIdx) => (
                    <button
                      key={`vai-act-${aIdx}`}
                      type="button"
                      onClick={() => handleSend(act.prompt)}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {act.icon}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Command any card, CreChargeFacility, store purchase, or research..."
                    className="flex-1 min-h-[44px] bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="min-w-[44px] min-h-[44px] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer"
                    aria-label="Send directive"
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
