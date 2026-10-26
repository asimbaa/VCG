import React, { useState, useRef, useEffect } from "react";
import { Info, Sparkles, ShieldCheck, ChevronRight, X, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SectionWisdomProps {
  title: string;
  concept: string;
  insights: string[];
  regulatory?: string;
  actionTip?: string;
  variant?: "emerald" | "gold" | "indigo" | "cyan" | "slate";
  className?: string;
}

export function SectionWisdomTooltip({
  title,
  concept,
  insights,
  regulatory = "APRA ADI & RBA Exchange Settlement Standards",
  actionTip,
  variant = "emerald",
  className = ""
}: SectionWisdomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const colorMap = {
    emerald: {
      btn: "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      glow: "from-emerald-500/10 to-transparent",
      accent: "text-emerald-400"
    },
    gold: {
      btn: "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      glow: "from-amber-500/10 to-transparent",
      accent: "text-amber-400"
    },
    indigo: {
      btn: "text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30",
      badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      glow: "from-indigo-500/10 to-transparent",
      accent: "text-indigo-400"
    },
    cyan: {
      btn: "text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30",
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      glow: "from-cyan-500/10 to-transparent",
      accent: "text-cyan-400"
    },
    slate: {
      btn: "text-slate-400 hover:text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border-slate-700",
      badge: "bg-slate-800 text-slate-300 border-slate-700",
      glow: "from-slate-700/10 to-transparent",
      accent: "text-slate-300"
    }
  };

  const scheme = colorMap[variant] || colorMap.emerald;

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className={`p-1.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm ${scheme.btn}`}
        title={`Wisdom & Key Insights: ${title}`}
        aria-label={`View insights for ${title}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl text-left"
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={() => setIsOpen(false)}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${scheme.badge}`}>
                    {concept}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SOVEREIGN CORE</span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${scheme.accent}`} />
                  {title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Key Insights List */}
            <div className="py-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Key Insights & Financial Mechanics
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${scheme.accent}`} />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Action Tip */}
            {actionTip && (
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 mb-2.5 text-[11px] text-slate-300 flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Strategic Tip: </span>
                  {actionTip}
                </div>
              </div>
            )}

            {/* Footer / Regulatory */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {regulatory}
              </span>
              <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
