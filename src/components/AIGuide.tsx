import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function AIGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Greetings. I am the Valourian Internal AI System. How may I assist you with your sovereign operations today? (e.g., Guide me through BSB Payments, Deploy to production, Setup Valourian.com)' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: inputVal }]);
    const query = inputVal.toLowerCase();
    setInputVal("");

    setTimeout(() => {
      let response = "I am processing that request through the secure enclave...";
      
      if (query.includes('payment') || query.includes('bsb') || query.includes('transfer')) {
        response = "To perform an AU BSB transfer, navigate to the Rapid Institutional Transfer tab. Select 'AU BSB & Account', input the 6-digit BSB and up to 9-digit Account Number, and click 'Validate Account Endpoint' to securely verify the recipient before clearing funds instantly.";
      } else if (query.includes('deploy') || query.includes('prod') || query.includes('live')) {
        response = "To deploy Valourian to production globally, initiate the automated pipeline at valourian.com/login. Ensure all BSB logic is verified. You can use the 'Websites' tab in this console to manage active sovereign deployments.";
      } else if (query.includes('valourian.com')) {
         response = "Valourian.com operations are active. You can authenticate stakeholders via valourian.com/login using the built-in Firebase Identity. Need help configuring domain routing?";
      }

      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 800);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] rounded-full text-yellow-500 hover:scale-110 active:scale-95 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Valourian AI System</h3>
                  <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> SECURE LINK ACTIVE
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto max-h-[40vh] space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                    msg.role === 'ai' 
                      ? 'bg-slate-900 text-slate-300 border border-slate-800 rounded-tl-sm' 
                      : 'bg-yellow-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask about deployments or transfers..."
                  className="flex-1 bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 focus:ring-1 focus:ring-yellow-500 outline-none"
                />
                <button 
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="p-2 bg-yellow-600 disabled:opacity-50 text-white rounded-xl hover:bg-yellow-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-3 flex justify-center">
                 <a href="https://valourian.com/login" target="_blank" rel="noreferrer" className="text-[10px] text-yellow-500 flex items-center gap-1 hover:underline">
                   View valourian.com/login live <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
