import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HelpTooltip({ content, className = '' }: { content: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative inline-flex items-center ml-2 ${className}`} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <Info className="w-4 h-4 text-slate-500 hover:text-emerald-400 cursor-help transition-colors" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded shadow-xl p-2 font-medium"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
