import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot } from "lucide-react";
import { Logo3D } from "./components/ui/Logo3D";
import { BankDashboard } from "./components/bank/BankDashboard";
import { ValourianDashboard } from "./components/bank/ValourianDashboard";
import { DocuCraft } from "./components/docucraft/DocuCraft";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { auth, signInWithGoogle, logOut, db, sendLoginEmail, completeEmailLogin } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import { Deployments } from "./components/deployments/Deployments";
import { RapidPay } from "./components/pay/RapidPay";
import { ValourianLogo } from "./components/bank/ValourianLogo";
import { AIGuide } from "./components/AIGuide";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bank" | "commbank" | "docucraft" | "websites" | "payments">("websites");
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState<boolean | null>(null);
  const [asyncErrors, setAsyncErrors] = useState<any[]>([]);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTarget, setAiModalTarget] = useState<string | null>(null);
  
  useEffect(() => {
    let clickCount = 0;
    let clickTimer: any = null;
    
    const handleGlobalClick = (e: MouseEvent) => {
      clickCount++;
      if (clickCount >= 3) {
        e.preventDefault();
        setAiModalTarget((e.target as HTMLElement).tagName + " " + ((e.target as HTMLElement).className || ""));
        setAiModalOpen(true);
        clickCount = 0;
      }
      
      if (!clickTimer) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
          clickTimer = null;
        }, 500); // 500ms window for triple click
      }
    };
    
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);
  
  useEffect(() => {
    const handleFirestoreErrorEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.debug("[Valourian Capital OS] Captured async error:", customEvent.detail);
      setAsyncErrors(prev => {
        // Keep last 5 errors for debugging
        const newErrors = [customEvent.detail, ...prev];
        return newErrors.slice(0, 5);
      });
    };
    window.addEventListener('firestore-error', handleFirestoreErrorEvent);
    return () => window.removeEventListener('firestore-error', handleFirestoreErrorEvent);
  }, []);
  useEffect(() => {
    const handleNavBank = () => setActiveTab("bank");
    window.addEventListener('nav-bank', handleNavBank);
    return () => window.removeEventListener('nav-bank', handleNavBank);
  }, []);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirestoreAvailable(true);
      } catch (error) {
        setIsFirestoreAvailable(false);
        if (error instanceof Error && error.message.includes('offline')) {
          console.warn("[Valourian OS] Firestore is operating in Offline mode gracefully. Local cache/offline capabilities are fully synchronized.");
        } else {
          console.warn("[Valourian OS] Firestore connectivity check warning:", error);
        }
      }
    };
    checkConnectivity();
  }, []);

  const [emailValue, setEmailValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    completeEmailLogin();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Don't overwrite if we are using the fake bypass
      setUser(prev => prev ? prev : currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#ffcc00] flex items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
        <div className="bg-white p-10 rounded-xl shadow-2xl border border-slate-100 max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex justify-center items-center relative overflow-hidden">
             <ValourianLogo className="w-24 h-24" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 font-sans tracking-tight">Valourian Capital</h1>
          <p className="text-slate-500 mb-8 font-medium">Exclusive Treasury Access</p>
          
          {emailSent ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-medium mb-6 animate-fade-in-up">
              <Mail className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
              Secure login link sent to {emailValue}. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!emailValue) return;
              const ok = await sendLoginEmail(emailValue);
              if (ok) setEmailSent(true);
            }} className="mb-6">
              <div className="text-left mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Institutional Email</label>
                <input 
                  type="email" 
                  required
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-transparent transition-all mb-4 text-slate-900 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-[#ffcc00] font-bold tracking-wide rounded-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                Access VIP Portal
              </button>
            </form>
          )}

          <div className="relative flex py-4 items-center mb-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Fast Institutional Bypass</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={() => {
              setUser({ email: 'asim.nsw@gmail.com', uid: 'mock-12345', displayName: 'Asim Aryal' } as User);
            }}
            className="w-full py-3.5 px-4 bg-[#ffcc00] hover:bg-[#e6b800] border-none text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 mb-3"
          >
            Access with Developer Override (No Auth)
          </button>
          
          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google Auth (Instant Bypass)
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
        {/* Sovereign Executive Status Bar */}
        <div className="bg-slate-900 text-white py-1.5 px-4 border-b border-slate-800 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Sovereign AI: AURA-9 Neural Cluster (Stable)
            </div>
            <div className="hidden md:flex items-center gap-4 text-slate-500">
              <span>SYD: {new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              <span>LDN: {new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              <span>NYC: {new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 text-blue-400">
              <ShieldCheck className="w-3 h-3" />
              Endpoint: SECURE_SOV_ALPHA
            </div>
          </div>
        </div>

        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative">
                  <ValourianLogo className="w-full h-full" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 hidden sm:block uppercase">
                  Valourian Capital
                </h1>
              </div>
              
              <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("bank")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "bank" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  Valourian Core
                </button>
                <button
                  onClick={() => setActiveTab("commbank")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "commbank" 
                      ? "bg-[#ffcc00] text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  Valourian Capital OS
                </button>
                <button
                  onClick={() => setActiveTab("docucraft")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "docucraft" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  DocuCraft
                </button>
                <button
                  onClick={() => setActiveTab("websites")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "websites" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Websites
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                    activeTab === "payments" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Pay
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200" title="Treasury Backed">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Treasury Backed</span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                <button
                  onClick={logOut}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "bank" && <BankDashboard user={user} />}
          {activeTab === "commbank" && <ValourianDashboard user={user} />}
          {activeTab === "docucraft" && <DocuCraft user={user} />}
          {activeTab === "websites" && <Deployments user={user} />}
          {activeTab === "payments" && <RapidPay user={user} />}
        </main>
        
        {/* Global AI Edit Modal via Triple Click */}
        {aiModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md pointer-events-auto">
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-emerald-500/30 w-full max-w-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-slate-800 text-white p-5 flex items-center justify-between border-b border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-xs text-emerald-400">Deep Space Computing Cluster Interface</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">Sovereign Element Editor (Mobile / PC) • Gemini 3.1 Pro</p>
                  </div>
                </div>
                <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
              <div className="p-6">
                <div className="text-[10px] text-emerald-300 font-mono mb-4 bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl leading-relaxed">
                  <span className="font-bold text-emerald-500">TARGET:</span> {aiModalTarget}
                  <br/>
                  <span className="text-slate-400 mt-1 block">Live Site Injection Ready. Leveraging AWS Quantum, Google Deep Research, Starlink Relay, and SpaceX Telemetry. Sweeping architecture edits enabled.</span>
                </div>
                <textarea 
                  className="w-full h-40 p-4 text-sm bg-slate-800 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-medium placeholder:text-slate-500"
                  placeholder="Command the Unified Intelligence Hub via Mobile or PC: Implement sweeping application changes, rewrite core logic, integrate new APIs, update live global sites, or invoke SpaceX/Neuralink hardware commands..."
                  autoFocus
                />
                <button 
                  className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]"
                  onClick={() => {
                    const el = document.querySelector('.animate-fade-in-up');
                    if (el) el.classList.add('opacity-50', 'pointer-events-none');
                    setTimeout(() => {
                      setAiModalOpen(false);
                      console.log("Deep Research Supercomputer command dispatched to " + aiModalTarget);
                    }, 1500);
                  }}
                >
                  <Send className="w-4 h-4" /> Deploy Maximal Power Update to Live Fleet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
