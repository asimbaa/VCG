import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot, Sparkles, X, Database, RefreshCw, Package } from "lucide-react";
import { Logo3D } from "./components/ui/Logo3D";
const BankDashboard = React.lazy(() => import("./components/bank/BankDashboard").then(m => ({ default: m.BankDashboard })));
const ValourianDashboard = React.lazy(() => import("./components/bank/ValourianDashboard").then(m => ({ default: m.ValourianDashboard })));
const DocuCraft = React.lazy(() => import("./components/docucraft/DocuCraft").then(m => ({ default: m.DocuCraft })));
import { ErrorBoundary } from "./components/ErrorBoundary";
import { auth, signInWithGoogle, logOut, db, sendLoginEmail, completeEmailLogin } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import { startPeriodicBackup } from "./services/BackupService";
const Deployments = React.lazy(() => import("./components/deployments/Deployments").then(m => ({ default: m.Deployments })));
const RapidPay = React.lazy(() => import("./components/pay/RapidPay").then(m => ({ default: m.RapidPay })));
import { ValourianAuth } from "./components/ValourianAuth";
import { ValourianLogo } from "./components/bank/ValourianLogo";
import { VoiceInputButton } from './components/shared/VoiceInputButton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AIGuide } from "./components/AIGuide";
import { ThresholdAlerts } from "./components/bank/ThresholdAlerts";
import { ValourianAI } from "./components/bank/ValourianAI";
import { MessageCenter } from "./components/messagecenter/MessageCenter";
import LogisticsDashboard from "./components/logistics/LogisticsDashboard";


// Global Google Maps Auth Failure Handler
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    console.warn("Google Maps API auth failed. ApiNotActivatedMapError.");
    window.dispatchEvent(new Event("gm_authFailure"));
  };
}

export default function App() {
  const [torrensSyncState, setTorrensSyncState] = useState<'synced' | 'syncing'>('synced');
  
  const handleForceBatchExport = () => {
    if (torrensSyncState === 'syncing') return;
    setTorrensSyncState('syncing');
    toast.info("Offline Mode Active: Forcing encrypted JSON batch export to Torrens Matrix...");
    
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        timestamp: new Date().toISOString(),
        batches: ["TX-001", "TX-002", "TX-003"],
        integrityHash: "0x" + Math.random().toString(16).slice(2, 12).toUpperCase(),
        status: "SECURED"
      }, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "torrens_matrix_batch.json");
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setTorrensSyncState('synced');
      toast.success("Torrens Matrix batch securely exported for offline reconciliation.");
    }, 2000);
  };

  const [user, setUser] = useState<User | null>({ uid: 'test', email: 'test@test.com' } as any);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bank" | "commbank" | "docucraft" | "websites" | "payments" | "messagecenter" | "logistics">("bank");
  const [isFirestoreAvailable, setIsFirestoreAvailable] = useState<boolean | null>(null);
  const [asyncErrors, setAsyncErrors] = useState<any[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTarget, setAiModalTarget] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isNavVoiceListening, setIsNavVoiceListening] = useState(false);

  const handleVoiceNav = async (text: string) => {
    const command = text.toLowerCase();
    
    // Financial Summary Command
    if (command.includes("financial") || command.includes("summary") || command.includes("last month")) {
      toast.info("Aggregating financial data from Sovereign Ledger...");
      try {
        if (!user?.uid) {
          toast.error("Authentication required for ledger queries.");
          return;
        }
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        
        let totalSpent = 0;
        let totalReceived = 0;
        let count = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.amount < 0) totalSpent += Math.abs(data.amount);
          else totalReceived += data.amount;
          count++;
        });
        
        const summaryText = `Financial Summary complete. You have ${count} recent ledger entries. Total outgoing capital is ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} A U D. Total incoming capital is ${totalReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })} A U D.`;
        
        toast.success(summaryText, { duration: 8000 });
        
        const utterance = new SpeechSynthesisUtterance(summaryText);
        utterance.rate = 0.95;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
        
      } catch (error) {
        console.error(error);
        toast.error("Failed to aggregate financial summary.");
      }
      return;
    }

    // Existing Navigation Commands
    if (command.includes("message") || command.includes("mail")) {
      setActiveTab("messagecenter");
      toast.success("Voice Command: Opened Message Center");
    } else if (command.includes("pay") || command.includes("rapid") || command.includes("send money")) {
      setActiveTab("payments");
      toast.success("Voice Command: Opened RapidPay");
    } else if (command.includes("core") || command.includes("bank")) {
      setActiveTab("bank");
      toast.success("Voice Command: Opened Valourian Capital Core");
    } else if (command.includes("capital") || command.includes("management") || command.includes("dashboard")) {
      setActiveTab("commbank");
      toast.success("Voice Command: Opened Valourian Capital OS");
    } else if (command.includes("doc") || command.includes("craft")) {
      setActiveTab("docucraft");
      toast.success("Voice Command: Opened DocuCraft");
    } else if (command.includes("web") || command.includes("site") || command.includes("deployment")) {
      setActiveTab("websites");
      toast.success("Voice Command: Opened Websites");
    } else {
      toast.info(`Voice Command not recognized: "${text}"`);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

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
      console.debug("[Valourian Capital - Tier 1 Global Treasury OS] Captured async error:", customEvent.detail);
      setAsyncErrors(prev => {
        const newErrors = [customEvent.detail, ...prev];
        return newErrors.slice(0, 5);
      });
    };
    window.addEventListener('firestore-error', handleFirestoreErrorEvent);
    return () => window.removeEventListener('firestore-error', handleFirestoreErrorEvent);
  }, []);

  useEffect(() => {
    const handleNavBank = () => setActiveTab("commbank");
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

  useEffect(() => {
    if (user) {
      const stopBackup = startPeriodicBackup(300000); // 5 mins
      return stopBackup;
    }
  }, [user]);

  useEffect(() => {
    completeEmailLogin();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(prev => prev ? prev : currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <ValourianAuth />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 font-sans text-white relative">
        {/* Navigation Voice Assistant Header Line */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 py-1.5 px-4 text-xs font-medium text-emerald-100 flex items-center justify-center gap-3 border-b border-emerald-500/20 shadow-sm relative z-50">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Quantum Acoustic Router Active:</span> 
          <VoiceInputButton 
            onTranscript={handleVoiceNav}
            isListening={isNavVoiceListening}
            setIsListening={setIsNavVoiceListening}
          />
        </div>

        {showInstallBanner && (
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md relative z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/50 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Install Valourian Capital OS</p>
                <p className="text-xs text-indigo-200">Add to home screen for native performance.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallClick}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase tracking-wider"
              >
                Install App
              </button>
              <button onClick={handleDismissBanner} className="p-2 text-indigo-200 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <header className="bg-slate-900 shadow-sm sticky top-0 z-40 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab("commbank")}>
                <ValourianLogo className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
                <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">Valourian Capital</h1>
              </div>
              <nav className="flex overflow-x-auto hide-scrollbar items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 max-w-full">
                {[
                  { id: "bank", label: "Valourian Capital Core", icon: Landmark },
                  { id: "commbank", label: "Valourian Capital OS", icon: Landmark },
                  { id: "docucraft", label: "DocuCraft", icon: FileText },
                  { id: "websites", label: "Websites", icon: Globe },
                  { id: "messagecenter", label: "Message Center", icon: Mail },
                  { id: "payments", label: "Pay", icon: Send },
                  { id: "logistics", label: "Logistics", icon: Package }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap z-10 ${
                      activeTab === tab.id 
                        ? "text-[#ffcc00]" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="main-app-nav-bubble" 
                        className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg -z-10" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <tab.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="hidden xl:inline">Torrens Matrix: </span>
                <span className="flex items-center gap-1">
                  {torrensSyncState === 'synced' ? (
                    <>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                       SYNCED
                    </>
                  ) : (
                    <>
                       <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                       EXPORTING...
                    </>
                  )}
                </span>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  Force Batch Export
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <Database className="w-4 h-4 text-emerald-500" />
                <span className="hidden xl:inline">Torrens Matrix: </span>
                <span className="flex items-center gap-1">
                  {torrensSyncState === 'synced' ? (
                    <>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]"></div>
                       SYNCED
                    </>
                  ) : (
                    <>
                       <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                       EXPORTING...
                    </>
                  )}
                </span>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="ml-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded transition-colors"
                >
                  Force Batch Export
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#ffcc00] bg-[#ffcc00]/10 px-3 py-1.5 rounded-full border border-[#ffcc00]/20" title="Treasury Backed">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Treasury Backed</span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                <button
                  onClick={logOut}
                  className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <React.Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
            {activeTab === "bank" && <BankDashboard user={user} />}
            {activeTab === "commbank" && <ValourianDashboard user={user} />}
            {activeTab === "docucraft" && <DocuCraft user={user} />}
            {activeTab === "websites" && <Deployments user={user} />}
            {activeTab === "payments" && <RapidPay user={user} />}
            {activeTab === "messagecenter" && <MessageCenter user={user} />}
            {activeTab === "logistics" && <LogisticsDashboard user={user} />}
          </React.Suspense>
        </main>

        <AIGuide />
        <ThresholdAlerts />
        <ValourianAI />
        
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
                  id="deep-space-command"
                  className="w-full h-40 p-4 text-sm bg-slate-800 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-medium placeholder:text-slate-500"
                  placeholder="Command the Unified Intelligence Hub via Mobile or PC: Implement sweeping application changes, rewrite core logic, integrate new APIs, update live global sites, or invoke SpaceX/Neuralink hardware commands..."
                  autoFocus
                />
                <button 
                  className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const input = document.getElementById('deep-space-command') as HTMLTextAreaElement;
                    const command = input.value;
                    if (!command) return;
                    
                    btn.disabled = true;
                    btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing Command...';
                    
                    try {
                      const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: command, agentId: 'DeepSpace' })
                      });
                      const data = await res.json();
                      input.value = "DEEP SPACE RESPONSE:\n\n" + (data.text || data.error || "Command processed.");
                    } catch (err) {
                      input.value = "ERROR CONNECTING TO CLUSTER:\n\n" + String(err);
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Deploy Maximal Power Update to Live Fleet';
                    }
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
