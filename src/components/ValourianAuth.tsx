import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Fingerprint, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ValourianLogo } from './bank/ValourianLogo';
import { signInWithGoogle, sendLoginEmail, createEmailPasswordAccount, loginEmailPassword } from '../firebase';
import { toast } from 'sonner';

export function ValourianAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await loginEmailPassword(email, password);
        toast.success("Authentication successful. Decrypting vault...");
      } else {
        await createEmailPasswordAccount(email, password);
        toast.success("Account created successfully. Initializing Sovereign Treasury...");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter an email for the magic link.");
      return;
    }
    setLoading(true);
    try {
      await sendLoginEmail(email);
      setEmailSent(true);
      toast.success("Encrypted access link dispatched.");
    } catch (error) {
      toast.error("Failed to dispatch link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
      <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
          
          <div className="flex flex-col items-center mb-10">
            <ValourianLogo className="w-20 h-20 mb-4" />
            <h1 className="text-2xl font-black text-white tracking-tight">ValourianCapital.io</h1>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mt-2 bg-emerald-500/10 px-4 py-1.5 rounded-full flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Tier 1 Global Treasury OS
            </p>
          </div>

          <form onSubmit={handleEmailPasswordAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sovereign Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="ceo@valouriancapital.io"
                />
              </div>
            </div>

            <AnimatePresence>
              {!emailSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passphrase / PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {emailSent && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Encrypted Link Dispatched</p>
                    <p className="opacity-80 text-xs">A one-time cryptographic access link has been sent to {email}. Tap it to authorize this device.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit"
                disabled={loading || emailSent}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Zap className="w-5 h-5 animate-pulse" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
                {isLogin ? "Decrypt & Enter" : "Establish New Vault"}
              </button>

              <div className="flex gap-3">
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleMagicLink}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all"
                >
                  Magic Link
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={signInWithGoogle}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4" /> Google
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">
              {isLogin ? "No sovereign entity established?" : "Vault already provisioned?"}{" "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-widest text-[10px] ml-2"
              >
                {isLogin ? "Initialize Account" : "Access Treasury"}
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black space-y-2">
          <p>Valourian.app • ValourianCapital.io</p>
          <p className="opacity-50">Global Central Nervous System for UHNW Administration</p>
        </div>
      </motion.div>
    </div>
  );
}
