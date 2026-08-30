import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, BrainCircuit, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { generateDocumentContent } from '../../services/geminiService';

export function ValourianAI() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-valourian-ai', handleOpen);
    return () => window.removeEventListener('open-valourian-ai', handleOpen);
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([
    { role: 'ai', content: 'Greetings. I am Valourian Sovereign AI, powered by Google Gemini Ultra & Quantum Compute. How may I assist your treasury operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await generateDocumentContent(`You are Valourian Sovereign AI, an elite, ultra-advanced artificial intelligence assisting a high-net-worth individual or corporate entity with their global banking, logistics, and treasury management on the Valourian Global Network. Respond with extreme professionalism, profound intelligence, and a touch of futuristic/quantum computing terminology where appropriate. Be concise but immensely helpful. The user says: ${userMessage}`, []);
      
      setMessages(prev => [...prev, { role: 'ai', content: response || "I am currently processing high-volume quantum transactions. Please try again." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Quantum uplink interrupted. I am currently offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="hidden fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 border-2 border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center group hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></div>
            <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-[10000] flex flex-col bg-slate-950/95 backdrop-blur-3xl border border-indigo-500/30 shadow-2xl overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'inset-0 md:inset-10 rounded-none md:rounded-3xl' 
                : 'bottom-0 right-0 w-full h-[85vh] md:bottom-10 md:right-10 md:w-[400px] md:h-[600px] rounded-t-3xl md:rounded-3xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 relative">
                  <div className="absolute top-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-white font-black tracking-widest text-xs md:text-sm uppercase">Valourian AI</h3>
                  <p className="text-indigo-300 text-[8px] md:text-[10px] font-mono tracking-wider">QUANTUM COMPUTE ACTIVE</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white hidden md:block"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-800 border border-slate-700' : 'bg-indigo-600/20 border border-indigo-500/30'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3 h-3 md:w-4 md:h-4 text-slate-300" /> : <Bot className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" />}
                  </div>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <div className={`px-4 py-3 md:px-5 md:py-3.5 rounded-2xl text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" />
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm border border-slate-700/50 px-4 py-3 md:px-5 md:py-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-slate-800/50 bg-slate-900/50">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Command Valourian AI..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-full pl-5 pr-12 md:pl-6 md:pr-14 py-3 md:py-4 text-[13px] md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 md:right-2 p-2 md:p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-all disabled:opacity-50"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
              <div className="mt-2 md:mt-3 text-center">
                <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <BrainCircuit className="w-3 h-3 text-indigo-500/50" />
                  Secured by Google Gemini Ultra & Sovereign Nodes
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
