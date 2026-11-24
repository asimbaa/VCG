import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles, Send, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { runPaidGeminiAssistant, AiActionExecutionResult } from "../services/aiActionExecutor";

interface GuideMessage {
  role: "ai" | "user";
  content: string;
  executedActions?: AiActionExecutionResult[];
  isError?: boolean;
}

export function AIGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<GuideMessage[]>([
    {
      role: "ai",
      content:
        "Greetings. I am the Valourian Gemini 4 Guide. Ask me to audit or repair cards, draw or repay CreChargeFacilities, complete a store/ride/booking payment, navigate to any view, or research live markets.",
    },
  ]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-guide", handleOpen);
    return () => window.removeEventListener("open-ai-guide", handleOpen);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputVal.trim();
    if (!prompt || isBusy) return;

    const history = messages
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({ role: (m.role === "user" ? "user" : "model") as "user" | "model", text: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInputVal("");
    setIsBusy(true);

    try {
      const res = await runPaidGeminiAssistant({
        message: prompt,
        mode: "neon_executor",
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: res.text,
          executedActions: res.executionResults,
        },
      ]);
    } catch (err: any) {
      const errMsg = err?.message || "Gemini 4 request failed.";
      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Could not reach Gemini 4: ${errMsg}. Verify your paid API key in Settings > Secrets.`,
          isError: true,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-4 right-3 sm:bottom-24 sm:right-8 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] max-h-[82dvh] flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Valourian AI Guide</h3>
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> GEMINI 4 NEON ACTIVE
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                aria-label="Close AI Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div key={`guide-msg-${i}-${msg.role}`} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "ai"
                        ? msg.isError
                          ? "bg-rose-950/70 text-rose-100 border border-rose-500/40 rounded-tl-sm"
                          : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm"
                        : "bg-amber-500 text-slate-950 font-semibold rounded-tr-sm"
                    }`}
                  >
                    {msg.isError && <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 text-rose-300" />}
                    {msg.content}
                    {msg.executedActions && msg.executedActions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                        {msg.executedActions.map((act, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>{act.summary}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isBusy && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono p-2">
                  <Bot className="w-4 h-4 animate-pulse" />
                  <span>Executing via Gemini 4...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask or command any card, facility, or store..."
                  className="flex-1 min-h-[44px] bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isBusy}
                  className="min-w-[44px] min-h-[44px] bg-amber-500 disabled:opacity-50 text-slate-950 rounded-xl hover:bg-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
