import React, { useState } from 'react';
import { Terminal, ShieldAlert, Cpu, Sparkles, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DeepSpaceTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{type: 'system' | 'user' | 'ai', content: string}[]>([
    { type: 'system', content: 'DEEP SPACE COMPUTING CLUSTER INTERFACE V.19.4.0 ONLINE' },
    { type: 'system', content: 'Awaiting executive command...' }
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory(prev => [...prev, { type: 'user', content: input }]);
    
    const cmd = input.toLowerCase();
    let response = '';
    
    setTimeout(() => {
      if (cmd.includes('deposit')) {
        response = 'Simulated deposit of $500M into Sovereign Treasury authorized.';
      } else if (cmd.includes('research') || cmd.includes('invest')) {
        response = 'Scanning global markets... Optimal acquisition targets identified: Volt.io (Power), Valourian Biotech (Medicine). Analysis matrix compiled and dispatched to executive inbox.';
      } else if (cmd.includes('acquire')) {
        response = 'Initiating hostile takeover simulation. Legal and financial vectors aligned. Pending final authorization.';
      } else {
        response = 'Command parsed. Executing heuristic analysis... Complete. Results are nominal.';
      }
      
      setHistory(prev => [...prev, { type: 'ai', content: response }]);
    }, 800);
    
    setInput('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-slate-950 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        title="Deep Space Computing Cluster"
      >
        <Cpu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 left-4 z-[100] w-[450px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] bg-slate-950 border border-emerald-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono"
          >
            <div className="bg-emerald-950/40 p-3 flex justify-between items-center border-b border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs tracking-widest uppercase">
                <Terminal className="w-4 h-4" />
                Deep Space Cluster
              </div>
              <button onClick={() => setIsOpen(false)} className="text-emerald-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded ${
                    msg.type === 'user' ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-500/30' :
                    msg.type === 'system' ? 'text-slate-400 font-bold' :
                    'bg-slate-900 border border-slate-700 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  }`}>
                    {msg.type === 'ai' && <Sparkles className="w-3 h-3 inline-block mr-2 mb-0.5" />}
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleCommand} className="p-3 border-t border-emerald-500/30 bg-slate-950 flex gap-2">
              <div className="flex-1 relative">
                <ChevronRight className="w-4 h-4 text-emerald-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter command..."
                  className="w-full bg-slate-900 text-emerald-400 text-xs font-mono py-2 pl-8 pr-4 rounded border border-emerald-500/30 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
