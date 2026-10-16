import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Bug, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HeartHandshake, 
  Zap, 
  X, 
  Trash2, 
  ChevronRight,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { autoBugCatcher, CaughtBugEvent, BugCatcherTelemetryStats } from "../../services/sovereignAutoBugCatcher";
import { toast } from "sonner";

export function AutoBugCatcherConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [bugs, setBugs] = useState<CaughtBugEvent[]>([]);
  const [stats, setStats] = useState<BugCatcherTelemetryStats>(autoBugCatcher.getStats());
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "HEALED" | "CRITICAL">("ALL");

  useEffect(() => {
    const unsub = autoBugCatcher.subscribe((newBugs, newStats) => {
      setBugs(newBugs);
      setStats(newStats);
    });
    return () => unsub();
  }, []);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const res = autoBugCatcher.runSelfHealingAudit();
      setIsAuditing(false);
      if (res.repairedItems.length > 0) {
        toast.success(`Autonomous Self-Healing Completed: ${res.repairedItems.length} items repaired.`);
      } else {
        toast.success("Integrity Audit 100% Clean: Zero state desync or corrupted entries detected.");
      }
    }, 600);
  };

  const filteredBugs = bugs.filter((b) => {
    if (selectedFilter === "HEALED") return b.autoHealed;
    if (selectedFilter === "CRITICAL") return b.severity === "CRITICAL" || b.severity === "HIGH";
    return true;
  });

  return (
    <>
      {/* Sleek Floating Status Pill */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/90 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-md hover:border-emerald-400 group cursor-pointer transition-all"
          title="Auto Bug Catcher & Human Flourishing Resilience Monitor"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <div className="text-left hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 leading-none">
              Auto Bug Catcher
            </div>
            <div className="text-[9px] text-slate-400 font-mono leading-tight">
              {stats.resilienceScore}% • {stats.autoHealedCount} Healed
            </div>
          </div>
        </motion.button>
      </div>

      {/* Slide-in Full Diagnostics & Telemetry Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white tracking-tight">
                        Sovereign Auto Bug Catcher
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        24/7/365 Deep Future
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Autonomous self-healing & continuous resilience for humanity's flourishing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Run Integrity Audit"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin text-emerald-400" : ""}`} />
                    <span className="hidden sm:inline">{isAuditing ? "Auditing..." : "Deep Sweep"}</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stat Highlights */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/40 border-b border-slate-800/80">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Resilience Score</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.resilienceScore}%</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Fault Tolerant</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Auto-Healed</div>
                  <div className="text-xl font-black text-cyan-400 mt-0.5">{stats.autoHealedCount}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Zero Human Effort</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Interceptions</div>
                  <div className="text-xl font-black text-indigo-400 mt-0.5">{stats.totalInterceptions}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Shielded Gracefully</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-center">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">System Uptime</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">{stats.systemUptimeSeconds}s</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Uninterrupted</div>
                </div>
              </div>

              {/* Active Safeguards */}
              <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Active Autonomous Safeguards (1000-Year Standard)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stats.activeSafeguards.map((sg, idx) => (
                    <span
                      key={`safeguard-badge-${idx}`}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      {sg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-1.5">
                  {(["ALL", "HEALED", "CRITICAL"] as const).map((filter, fIdx) => (
                    <button
                      key={`filter-tab-${filter}-${fIdx}`}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedFilter === filter
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {bugs.length > 0 && (
                  <button
                    onClick={() => autoBugCatcher.clearHistory()}
                    className="text-xs font-bold text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Cache
                  </button>
                )}
              </div>

              {/* Caught Events List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {filteredBugs.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-900/20 rounded-2xl border border-slate-800/60">
                    <HeartHandshake className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-sm font-black text-white">System in Perfect Flourishing Health</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      All runtime loops, database reconciliations, and state stores are fully coherent. Zero unmitigated bugs.
                    </p>
                  </div>
                ) : (
                  filteredBugs.map((bug, bIdx) => (
                    <div
                      key={`bug-card-${bug.id}-${bIdx}`}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                              bug.severity === "CRITICAL"
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                : bug.severity === "HIGH"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            }`}
                          >
                            {bug.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{bug.category}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{new Date(bug.timestamp).toLocaleTimeString()}</span>
                          {bug.repetitionCount > 1 && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                              ×{bug.repetitionCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs font-mono font-medium text-slate-200">
                        {bug.message}
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
                        <span className="text-slate-500 font-mono truncate max-w-[200px]">
                          Source: {bug.source}
                        </span>
                        {bug.autoHealed && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {bug.healingActionTaken}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Humanity Flourishing Note */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    Dedicated to <strong className="text-white">humanity's flourishing</strong> immediately and deep into the future.
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Close & Shield
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
