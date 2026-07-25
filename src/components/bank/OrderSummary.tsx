import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Truck, CheckCircle2, ChevronRight, Package } from 'lucide-react';

interface OrderSummaryProps {
  orderId: string;
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  items: any[];
  eta: string;
  destination: string;
  onClose?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ orderId, status, items, eta, destination, onClose }) => {
  
  const steps = [
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-800">Order Summary</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Order #{orderId}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> ETA: {eta}
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${isCompleted ? 'text-indigo-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100 -z-0">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Delivery Destination</p>
            <p className="text-sm font-bold text-slate-800">{destination}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2">Items Included</h4>
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {item.qty || 1}x
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 font-mono">${(item.price || 0).toLocaleString()}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          Close Summary
        </button>
      )}
    </motion.div>
  );
};
