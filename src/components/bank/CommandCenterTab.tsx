import React, { useState } from "react";
import { Terminal, Download, Sparkles, Server, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export function CommandCenterTab() {
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), type: "system", msg: "VALOURIAN COMMAND PROTOCOL V.19 ONLINE" },
    { time: new Date().toLocaleTimeString(), type: "system", msg: "Awaiting executive command..." }
  ]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const currentCmd = command;
    setCommand("");
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "user", msg: `> ${currentCmd}` }]);
    setIsExecuting(true);

    setTimeout(() => {
        let response = "Execution complete. System state nominal. All protocols enforced.";
        if (currentCmd.toLowerCase().includes("report")) {
            response = "Generated global treasury status report. Ready for export.";
        } else if (currentCmd.toLowerCase().includes("partner") || currentCmd.toLowerCase().includes("api")) {
            response = "Partner integration matrix synchronized successfully.";
        } else if (currentCmd.toLowerCase().includes("tesla") || currentCmd.toLowerCase().includes("acquire")) {
            response = "Asset acquisition workflow triggered. Procurement agents dispatched.";
        }
        
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: "success", msg: response }]);
        setIsExecuting(false);
    }, 1200);
  };

  const handleExport = () => {
      // Simulate exporting the log
      const element = document.createElement("a");
      const file = new Blob([logs.map(l => `[${l.time}] ${l.type.toUpperCase()}: ${l.msg}`).join('\n')], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "Valourian_Command_Audit.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Terminal className="w-8 h-8 text-emerald-500" />
            Alpha-Core Command Center
          </h2>
          <p className="text-slate-400 mt-2">Executive terminal for high-level organizational conquer fulfillments and task enforcement.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-sm font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Download className="w-5 h-5" />
          Export Audit Report
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Terminal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-500 font-mono text-xs font-bold tracking-widest uppercase">root@valourian-core:~</div>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
                <Server className="w-4 h-4" />
                SECURE CONNECTION
            </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-6 bg-[#0a0f16] overflow-y-auto font-mono text-sm space-y-3">
            {logs.map((log, i) => (
                <div key={i} className={`flex gap-4 ${log.type === 'user' ? 'text-white' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    <span className="opacity-50 shrink-0">[{log.time}]</span>
                    {log.type === 'user' ? (
                        <span className="font-bold">{log.msg}</span>
                    ) : log.type === 'success' ? (
                        <span className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                            {log.msg}
                        </span>
                    ) : (
                        <span>{log.msg}</span>
                    )}
                </div>
            ))}
            {isExecuting && (
                <div className="flex gap-4 text-emerald-500 animate-pulse">
                    <span className="opacity-50 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Processing organizational directives...
                    </span>
                </div>
            )}
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleExecute} className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="relative flex items-center">
                <span className="absolute left-4 font-mono text-emerald-500 font-bold">{'>'}</span>
                <input 
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter systemic commands for execution..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-10 pr-6 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                    autoFocus
                    disabled={isExecuting}
                />
            </div>
        </form>
      </div>
    </div>
  );
}
