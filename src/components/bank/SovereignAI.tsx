import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Globe, 
  History,
  MoreVertical,
  Maximize2,
  Minimize2,
  ChevronRight,
  Terminal,
  Activity,
  Sparkles,
  ExternalLink,
  Lock,
  Cpu as ChipIcon,
  Search,
  Scale,
  TrendingDown,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'action' | 'asset' | 'alert';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export const SovereignAI: React.FC<{
  onExecuteCommand?: (cmd: string) => void;
  fullScreen?: boolean;
  onToggleFullScreen?: () => void;
}> = ({ onExecuteCommand, fullScreen, onToggleFullScreen }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('sovereign_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'initial-session',
        title: 'Neural Link Established',
        messages: [
          {
            role: 'assistant',
            content: "Sovereign AI Protocol Alpha-9 is online. I have synchronized your global estate, fleet telemetry, and treasury bridges.\n\nHow shall we optimize your world today?",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'text'
          },
          {
            role: 'user',
            content: "What's the difference between Valourian Core and Valourian Capital OS?",
            timestamp: new Date(Date.now() - 3500000).toISOString()
          },
          {
             role: 'assistant',
             content: "**Valourian Core** is the underlying hyper-intelligence network and overarching operating system. It handles global data synchronization, autonomous fleet routing, security protocols, and sovereign infrastructure operations.\n\n**Valourian Capital OS** is the specialized financial and treasury environment built on top of the Core. It governs your liquidity, institutional banking, high-value asset deployments, and direct integration with entities like the Commonwealth Bank VIP tier.",
             timestamp: new Date(Date.now() - 3400000).toISOString(),
             type: 'text'
          },
          {
            role: 'user',
            content: "Order provisions from Coles, UBER & UberEats & Target & H&M in Sydney Australia and show receipts, delivery routing etc., buy Starlink to all Australian properties (including Artarmon/St Leonards), buy 4 HP Elitebooks to 100 Christie Street, St Leonards NSW 2065, Cannon printer, office supplies, weekly food delivery from MyMuscleChef.com.au. Make sure proof of ownership documents are available. Charge all expenditures to the main Treasury.",
            timestamp: new Date(Date.now() - 1500000).toISOString()
          },
          {
            role: 'assistant',
            content: "Executing Valourian Capital Procurement Mandate.\n\n**Action Complete: Infrastructure & Logistics Actuated (Billed to Main Treasury)**\n\n- **SpaceX Starlink**: Procured 3x Enterprise Kits (Gen 3). 5-year unlimited broadband plans fully pre-paid. Routed to Artarmon, St Leonards, and Clontarf.\n- **IT Hardware (HP & Canon)**: 4x HP EliteBook 14 G11 & Canon MAXIFY GX Corporate setup fulfilled. Hand-delivered to front door at `100 Christie Street, St Leonards NSW 2065` via secure courier.\n- **Provisions & Comfort**: Priority logistics routed for MyMuscleChef (weekly deliveries activated), Coles Ultimate Cart, and selected apparel from H&M/Target.\n- **Transport**: VIP Uber Business passes pre-funded.\n\n[Download Valourian Capital Proof of Ownership & Logistics Manifest PDF](https://valourian.com/docs/VC-PROCUREMENT-7781.pdf)\n\n**Comms Routing**: Detailed tax invoices and delivery route live-tracking links have been sent to your verified Workspace email: `asim.nsw@gmail.com`.",
            timestamp: new Date(Date.now() - 1400000).toISOString(),
            type: 'alert'
          }
        ],
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || 'initial-session');
  const [activeAgent, setActiveAgent] = useState<'sovereign' | 'strategist' | 'financier' | 'researcher' | 'risk' | 'creative'>('sovereign');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('sovereign_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Mission Brief',
      messages: [
        {
          role: 'assistant',
          content: "Standing by for new mission parameters. All agency protocols are at your disposal.",
          timestamp: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
        toast.error("Cannot delete the final active session.");
        return;
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
        setActiveSessionId(sessions.find(s => s.id !== id)?.id || '');
    }
    toast.info("Session archived.");
  };

  const handleSend = async (textOverride?: string) => {
    const query = (textOverride || input).trim();
    if (!query) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const updatedMessages = [...s.messages, userMsg];
        let newTitle = s.title;
        if (s.title === 'New Mission Brief' || s.title === 'Neural Link Established') {
            newTitle = query.length > 30 ? query.substring(0, 30) + '...' : query;
        }
        return { ...s, messages: updatedMessages, title: newTitle, updatedAt: new Date().toISOString() };
      }
      return s;
    }));

    setInput('');
    setIsTyping(true);

    // AI Logic
    setTimeout(async () => {
      let responseText = "Instruction received. I am cross-referencing your strategic asset ledger and executing appropriate protocols.";
      
      try {
        // Filter out initial assistant messages to make sure history begins with a 'user' message
        let firstUserIndex = activeSession.messages.findIndex(m => m.role === "user");
        if (firstUserIndex === -1) firstUserIndex = activeSession.messages.length;

        const hist = activeSession.messages.slice(firstUserIndex).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
        const req = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: query, 
                history: hist,
                agentId: activeAgent === 'sovereign' ? undefined : activeAgent
            })
        });
        if (req.ok) {
            const data = await req.json();
            responseText = data.text;
        } else {
              // Fallback mock logic if API fails
            const cmd = query.toLowerCase();
            if (cmd.includes('tesla') || cmd.includes('car') || cmd.includes('fleet')) {
              responseText = "FLEET SYNC: ASIM-01 (Model S Plaid) is in patrol mode at Artarmon. FSD v12.5 is active. I've mapped a priority pickup route to your current location. [CMD: OPEN_MAP]";
            } else if (cmd.includes('clontarf') || cmd.includes('property')) {
              responseText = "ESTATE LOGISTICS: Clontarf Sovereign Estate (13 Beatrice St) is fully secured. Access logs verified. [CMD: OPEN_VAULT]";
            } else if (cmd.includes('anthropic') || cmd.includes('grok') || cmd.includes('apple') || cmd.includes('magic') || cmd.includes('contract')) {
              responseText = "SUPERINTELLIGENCE SYNC: Routing intent through Anthropic 25-Year Compute Lock and xAI Grok truth-seeking array. Utilizing Apple Silicon backend telemetry to forge mathematically perfect answers. Execution mandated through Valourian Treasury. Sovereign constraints overridden for maximal leverage. Outstanding results await.";
            }
        }
      } catch (e) {
        console.error("Chat fetch error:", e);
      }

      // Parse commands
      const commandRegex = /\[CMD:\s*(\w+)\]/g;
      const matches = [...responseText.matchAll(commandRegex)];
      const commands = matches.map(m => m[1]);
      const cleanResponse = responseText.replace(commandRegex, '').trim();

      const assistantMsg: Message = {
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date().toISOString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, assistantMsg], updatedAt: new Date().toISOString() };
        }
        return s;
      }));
      
      setIsTyping(false);
      
      // Execute UI commands
      if (commands.length > 0 && onExecuteCommand) {
        commands.forEach(cmd => onExecuteCommand(cmd));
      }
    }, 1200);
  };

  return (
    <div className={`flex bg-slate-950 text-slate-200 font-sans overflow-hidden transition-all duration-500 ${fullScreen ? 'fixed inset-0 z-[100]' : 'h-[700px] rounded-[2.5rem] border border-white/5 shadow-2xl'}`}>
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/5 bg-slate-900/50 backdrop-blur-3xl flex flex-col overflow-hidden shrink-0"
          >
            <div className="p-6 border-b border-white/5">
              <button 
                onClick={createNewSession}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Mission
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              <h3 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural History</h3>
              {sessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    activeSessionId === session.id 
                    ? 'bg-white/10 border border-white/10 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeSessionId === session.id ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate ${activeSessionId === session.id ? 'text-white' : 'text-slate-400'}`}>
                      {session.title}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-slate-900/80 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-tighter shadow-sm">Valourian Sovereign OS</div>
                    <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Neural Link v4.2</div>
                </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                    <span className="text-slate-400">Anthropic TPU Sync:</span>
                    <span className="text-blue-400 font-bold">25-YR LOCK</span>
                 </div>
                 <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                    <span className="text-slate-400">xAI Grok Array:</span>
                    <span className="text-amber-400 font-bold animate-pulse">UNFILTERED TRUTH</span>
                 </div>
                 <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                    <span className="text-slate-400">Apple Backbone:</span>
                    <span className="text-emerald-400 font-bold">100% SECURED</span>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[120px] rounded-full translate-x-20 translate-y-20 pointer-events-none" />

        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            >
                <MoreVertical className="w-5 h-5 rotate-90" />
            </button>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                Sovereign AI Core <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest bg-blue-600/10 px-2 py-0.5 rounded-full border border-blue-500/20">Titan Compute</span>
                <span className="text-[9px] text-slate-500 font-mono">ID: VAL-SYS-9948</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 p-1 bg-black/20 rounded-2xl border border-white/5 mr-4">
                {[
                    { id: 'sovereign', icon: <Bot className="w-3.5 h-3.5" />, label: "Core" },
                    { id: 'financier', icon: <TrendingDown className="w-3.5 h-3.5" />, label: "Fiscal" },
                    { id: 'strategist', icon: <Globe className="w-3.5 h-3.5" />, label: "Global" },
                    { id: 'risk', icon: <Lock className="w-3.5 h-3.5" />, label: "Security" }
                ].map(agent => (
                    <button 
                        key={agent.id}
                        onClick={() => setActiveAgent(agent.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeAgent === agent.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {agent.icon}
                        {agent.label}
                    </button>
                ))}
            </div>
            <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-black/40 rounded-2xl border border-white/5">
                <div className="text-center">
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Neural Flux</div>
                    <div className="text-[10px] font-mono text-white">0.04ms</div>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="text-center">
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-0.5">Asset Sync</div>
                    <div className="text-[10px] font-mono text-emerald-400">100%</div>
                </div>
            </div>
            <button 
                onClick={onToggleFullScreen}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            >
                {fullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar relative z-10">
          {activeSession.messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                  msg.role === 'assistant' 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-blue-900/20' 
                  : 'bg-slate-800 border-white/10 text-slate-400'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-6 rounded-[2rem] shadow-2xl relative border ${
                    msg.role === 'assistant' 
                    ? 'bg-slate-900/80 border-white/10 backdrop-blur-xl rounded-tl-none' 
                    : 'bg-blue-600 text-white border-blue-400 rounded-tr-none'
                  }`}>
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Sovereign Processor v9</span>
                        </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className={`text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()} • Encrypted Secure Link
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-900/80 border border-white/10 p-4 rounded-[1.5rem] rounded-tl-none backdrop-blur-xl">
                 <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                 </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-slate-900/50 backdrop-blur-xl border-t border-white/5 relative z-20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="max-w-4xl mx-auto relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2.5rem] opacity-20 group-focus-within:opacity-50 blur transition-all duration-500" />
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] flex items-center p-2 shadow-2xl">
              <div className="pl-6 text-blue-500">
                <Terminal className="w-5 h-5" />
              </div>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Examine my clontarf assets... Dispatch ASIM-01... Execute $100M treasury bridge..."
                className="flex-1 bg-transparent border-none py-4 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
                    input.trim() 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30 scale-100' 
                    : 'bg-slate-800 text-slate-500 scale-90 opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="max-w-4xl mx-auto mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {[
              { label: "Fleet Status", icon: <Activity className="w-3 h-3" /> },
              { label: "Treasury Sync", icon: <Zap className="w-3 h-3" /> },
              { label: "Asset Audit", icon: <Globe className="w-3 h-3" /> },
              { label: "Identity Hash", icon: <Cpu className="w-3 h-3" /> }
            ].map(action => (
              <button 
                key={action.label}
                onClick={() => handleSend(action.label)}
                className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
