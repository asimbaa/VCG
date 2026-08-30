import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function PaymentStatusOverlay() {
  const [activePayment, setActivePayment] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      
      const q = query(
        collection(db, 'users', user.uid, 'payment_events'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          const id = snapshot.docs[0].id;
          
          const now = Date.now();
          const txTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || now);
          
          if (now - txTime < 120000) { // Within last 2 minutes
             if (data.status === 'pending' || data.status === 'confirmed' || data.status === 'failed') {
               setActivePayment({ id, ...data });
               
               if (data.status === 'confirmed' || data.status === 'failed') {
                 // Auto-hide after 5 seconds
                 setTimeout(() => {
                   setActivePayment((prev: any) => prev?.id === id ? null : prev);
                 }, 5000);
               }
             }
          }
        }
      });

      return () => unsubscribe();
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AnimatePresence>
      {activePayment && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-10 right-10 z-[99999] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-4">
            {activePayment.status === 'pending' && (
               <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                 <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
               </div>
            )}
            {activePayment.status === 'confirmed' && (
               <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               </div>
            )}
            {activePayment.status === 'failed' && (
               <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                 <XCircle className="w-6 h-6 text-red-500" />
               </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">
                {activePayment.status === 'pending' ? 'Payment Pending...' : 
                 activePayment.status === 'confirmed' ? 'Payment Confirmed' : 'Payment Failed'}
              </h3>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                {activePayment.description || 'Secure Sovereign Authorization in progress.'}
              </p>
              
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Amount</span>
                  <span className="text-white font-mono font-bold">{activePayment.amount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Merchant</span>
                  <span className="text-slate-300 font-bold">{activePayment.merchant}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                 <ShieldCheck className="w-3 h-3" /> Secure HSM Verified
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
