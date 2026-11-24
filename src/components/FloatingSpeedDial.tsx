import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bot, Bell, BrainCircuit, X } from 'lucide-react';

export function FloatingSpeedDial({ onOpenAI, onOpenAlerts, onOpenGuide }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-6 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            className="flex flex-col gap-3 items-center"
          >
            <button
              onClick={() => { setIsOpen(false); onOpenAlerts(); }}
              aria-label="Open threshold alerts"
              className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setIsOpen(false); onOpenGuide(); }}
              aria-label="Open AI guide"
              className="w-12 h-12 rounded-full bg-slate-900 border border-yellow-500/50 text-yellow-400 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setIsOpen(false); onOpenAI(); }}
              aria-label="Open Valourian AI"
              className="w-12 h-12 rounded-full bg-indigo-700 border-2 border-indigo-400/50 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close quick tools' : 'Open quick tools'}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </button>
    </div>
  );
}
