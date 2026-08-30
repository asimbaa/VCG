import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bot, Bell, BrainCircuit, X } from 'lucide-react';

export function FloatingSpeedDial({ onOpenAI, onOpenAlerts, onOpenGuide }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[10000] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 items-center"
          >
            <button
              onClick={() => { setIsOpen(false); onOpenAlerts(); }}
              className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative group"
            >
              <Bell className="w-5 h-5 group-hover:animate-ping" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-slate-900 animate-pulse"></div>
            </button>
            <button
              onClick={() => { setIsOpen(false); onOpenGuide(); }}
              className="w-12 h-12 rounded-full bg-slate-900 border border-yellow-500/50 text-yellow-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setIsOpen(false); onOpenAI(); }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 border-2 border-indigo-400/50 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-transform hover:scale-105 active:scale-95"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          {isOpen ? <X className="w-6 h-6 md:w-8 md:h-8" /> : <Plus className="w-6 h-6 md:w-8 md:h-8" />}
        </motion.div>
      </button>
    </div>
  );
}
