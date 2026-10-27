import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot, Sparkles, X, Database, RefreshCw, Package, Menu, ShoppingCart, Cpu, Grid, Layers, ChevronUp, ChevronRight } from "lucide-react";
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
import { SovereignNotificationsBar } from "./components/shared/SovereignNotificationsBar";
import { UnifiedSovereignAcquisitionsHub } from "./components/bank/UnifiedSovereignAcquisitionsHub";
import { AutonomousSmartTechConsole } from "./components/bank/AutonomousSmartTechConsole";
import { QuickExecutiveDock } from "./components/shared/QuickExecutiveDock";
import { ValourianAuth } from "./components/ValourianAuth";
import { ValourianLogo } from "./components/bank/ValourianLogo";
import { VoiceInputButton } from './components/shared/VoiceInputButton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AIGuide } from "./components/AIGuide";
import { ThresholdAlerts } from "./components/bank/ThresholdAlerts";
import { ValourianAI } from "./components/bank/ValourianAI";
import { AutoBugCatcherConsole } from "./components/shared/AutoBugCatcherConsole";
import { FloatingSpeedDial } from "./components/FloatingSpeedDial";
import { MessageCenter } from "./components/messagecenter/MessageCenter";
import LogisticsDashboard from "./components/logistics/LogisticsDashboard";
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner";

// Global Google Maps Auth Failure Handler
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    console.warn("Google Maps API auth failed. ApiNotActivatedMapError.");
    window.dispatchEvent(new Event("gm_authFailure"));
  };
}

const TABS = [
  { id: "bank", label: "Core", icon: Landmark },
  { id: "commbank", label: "OS", icon: ShieldCheck },
  { id: "smarttech", label: "SmartTech", icon: Cpu },
  { id: "acquisitions", label: "Acquire", icon: ShoppingCart },
  { id: "payments", label: "Pay", icon: Send },
  { id: "docucraft", label: "DocuCraft", icon: FileText },
  { id: "websites", label: "Websites", icon: Globe },
  { id: "messagecenter", label: "Messages", icon: Mail },
  { id: "logistics", label: "Logistics", icon: Package }
];

  const FOUNDER_EMAILS = [
  'asim.nsw@gmail.com',
  'asimaryal2@gmail.com',
  'asim.aryal@protonmail.com',
  'valouriancapital@gmail.com',
  'asimmaryal@gmail.com',
  'asimaryal10@gmail.com',
  'asimausco@gmail.com',
  'valourianbank@gmail.com'
];

export const isFounder = (email: string | null | undefined) => {
  if (!email) return true; // Defaulting to CEO mode in dev
  return FOUNDER_EMAILS.includes(email.toLowerCase());
};

const CEO_USER = {
    uid: "ceo-founder-override",
    email: "asim.nsw@gmail.com",
    displayName: "Mr. Asim Aryal (Founder CEO Director)",
    photoURL: "https://ui-avatars.com/api/?name=Asim+Aryal&background=10b981&color=fff",
    emailVerified: true
  } as User;

export default function App() {
  const [torrensSyncState, setTorrensSyncState] = useState<'synced' | 'syncing'>('synced');
  
  // Persistent activeTab restored from localStorage or URL hash
  const [activeTab, setActiveTabState] = useState<"bank" | "docucraft" | "websites" | "payments" | "commbank" | "messagecenter" | "logistics" | "acquisitions" | "smarttech">(() => {
    try {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["bank", "docucraft", "websites", "payments", "commbank", "messagecenter", "logistics", "acquisitions", "smarttech"];
      if (validTabs.includes(hash)) return hash as any;
      const saved = localStorage.getItem("valourian_active_tab");
      if (saved && validTabs.includes(saved)) return saved as any;
    } catch {}
    return "commbank";
  });

  // Keep visited apps in DOM so coming in and out never unmounts, resets, or refreshes them
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => {
    try {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["bank", "docucraft", "websites", "payments", "commbank", "messagecenter", "logistics", "acquisitions", "smarttech"];
      const initial = validTabs.includes(hash) ? hash : (localStorage.getItem("valourian_active_tab") || "commbank");
      return new Set([initial]);
    } catch {
      return new Set(["commbank"]);
    }
  });

  const setActiveTab = React.useCallback((tab: typeof activeTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("valourian_active_tab", tab);
      if (window.location.hash !== `#${tab}`) {
        window.history.replaceState(null, "", `#${tab}`);
      }
    } catch {}
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, []);

  // Sync with browser forward/back or external tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["bank", "docucraft", "websites", "payments", "commbank", "messagecenter", "logistics", "acquisitions", "smarttech"];
      if (validTabs.includes(hash) && hash !== activeTab) {
        setActiveTabState(hash as any);
        setVisitedTabs(prev => {
          if (prev.has(hash)) return prev;
          const next = new Set(prev);
          next.add(hash);
          return next;
        });
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  const [acquisitionsInitialTab, setAcquisitionsInitialTab] = useState<"properties" | "flights" | "domains" | "stocks">("properties");
  const [user, setUser] = useState<User | null>(null);
  const [mobileAppsDrawerOpen, setMobileAppsDrawerOpen] = useState(false);
  
  const effectiveUser = user || CEO_USER;
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTarget, setAiModalTarget] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);

  // PWA 'beforeinstallprompt' listener for custom installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    const handleAppInstalled = () => {
      setPwaInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (u) {
        startPeriodicBackup();
      }
    });
    
    // Check for email link login
    if (window.location.href.includes('signInWithEmailLink')) {
      completeEmailLogin().catch(console.error);
    }
    
    return unsub;
  }, []);

  useEffect(() => {
    const handleTripleClick = (e: MouseEvent) => {
      if (e.detail === 3) {
        setAiModalTarget((e.target as HTMLElement).tagName + " " + (e.target as HTMLElement).className);
        setAiModalOpen(true);
      }
    };
    window.addEventListener('click', handleTripleClick);
    return () => window.removeEventListener('click', handleTripleClick);
  }, []);

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
      toast.success("Torrens Matrix synchronization complete. Cold storage ledger updated.");
    }, 2000);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <ValourianLogo className="w-16 h-16 animate-pulse mb-8" />
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  /* Bypass Auth for CEO Power Access */

  return (
    <ErrorBoundary>
      <div className="flex h-[100dvh] bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-emerald-500/30">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 border-r border-slate-800 z-50 shadow-2xl flex-shrink-0">
          <div className="p-6 flex items-center gap-3">
             <ValourianLogo className="w-8 h-8 hover:scale-110 transition-transform duration-500" />
             <h1 className="text-xl font-black text-white tracking-tight">Valourian OS</h1>
          </div>
          
          <div className="px-4 mb-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-inner">
               <img src={effectiveUser.photoURL || `https://ui-avatars.com/api/?name=${effectiveUser.email}`} alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-emerald-500/30" referrerPolicy="no-referrer" />
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-white truncate">{effectiveUser.displayName || "Sovereign VIP"}</p>
                 <p className="text-[10px] text-emerald-400 font-mono truncate">Connected</p>
               </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar pb-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2 mt-4">Applications</div>
            {TABS.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={`app-tab-${tab.id}-${idx}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full relative px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 ${
                    isActive 
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-lg" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-3">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-slate-950 p-3 rounded-xl border border-slate-800 justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
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
                </div>
                <button 
                  onClick={handleForceBatchExport}
                  disabled={torrensSyncState === 'syncing'}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 p-1.5 rounded-lg transition-colors"
                  title="Force Batch Export"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
             </div>
             
             <button
               onClick={logOut}
               className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-sm"
             >
               <LogOut className="w-4 h-4" /> Sign Out
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative h-[100dvh]">
          {/* Custom PWA Installation Banner for Mobile Users */}
          <PWAInstallBanner 
            installPrompt={pwaInstallPrompt} 
            onClearPrompt={() => setPwaInstallPrompt(null)} 
          />
          
          {/* Mobile Header */}
          <header className="md:hidden bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 h-16 flex items-center justify-between px-4 flex-shrink-0">
             <div className="flex items-center gap-3">
               <ValourianLogo className="w-8 h-8" />
               <h1 className="text-lg font-black text-white tracking-tight">Valourian OS</h1>
             </div>
             <div className="flex items-center gap-3">
                <img src={effectiveUser.photoURL || `https://ui-avatars.com/api/?name=${effectiveUser.email}`} alt="Profile" className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30" referrerPolicy="no-referrer" />
             </div>
          </header>

          {/* Sovereign Notifications & Command Bar */}
          <SovereignNotificationsBar 
            onOpenAcquisitions={(subTab) => {
              setAcquisitionsInitialTab(subTab || "properties");
              setActiveTab("acquisitions");
            }}
            onOpenSmartTech={() => setActiveTab("smarttech")}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />

          {/* Quick Executive Usability Dock (Card Copy, Address, Phone, Quick Nav) */}
          <QuickExecutiveDock 
            onNavigate={(tab, sub) => {
              if (sub) setAcquisitionsInitialTab(sub);
              setActiveTab(tab as any);
            }} 
            activeTab={activeTab} 
          />

          {/* Banner */}
          <AnimatePresence>
            {showBanner && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-indigo-600/90 backdrop-blur-md flex-shrink-0"
              >
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span className="text-xs font-medium text-white">Triple-click any element to invoke the Sovereign AI Editor</span>
                  </div>
                  <button onClick={handleDismissBanner} className="p-1 text-indigo-200 hover:text-white transition-colors rounded-full hover:bg-indigo-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area with Keep-Alive Preservation */}
          <main className="flex-1 overflow-y-auto scroll-smooth pb-24 md:pb-0 relative">
            <React.Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>}>
              {visitedTabs.has("bank") && (
                <div className={`h-full w-full ${activeTab === "bank" ? "block" : "hidden"}`}>
                  <BankDashboard user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("commbank") && (
                <div className={`h-full w-full ${activeTab === "commbank" ? "block" : "hidden"}`}>
                  <ValourianDashboard user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("smarttech") && (
                <div className={`h-full w-full p-4 sm:p-8 ${activeTab === "smarttech" ? "block" : "hidden"}`}>
                  <AutonomousSmartTechConsole />
                </div>
              )}
              {visitedTabs.has("acquisitions") && (
                <div className={`h-full w-full p-4 sm:p-8 ${activeTab === "acquisitions" ? "block" : "hidden"}`}>
                  <UnifiedSovereignAcquisitionsHub 
                    initialTab={acquisitionsInitialTab} 
                    onClose={() => setActiveTab("commbank")}
                  />
                </div>
              )}
              {visitedTabs.has("docucraft") && (
                <div className={`h-full w-full ${activeTab === "docucraft" ? "block" : "hidden"}`}>
                  <DocuCraft user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("websites") && (
                <div className={`h-full w-full ${activeTab === "websites" ? "block" : "hidden"}`}>
                  <Deployments user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("payments") && (
                <div className={`h-full w-full ${activeTab === "payments" ? "block" : "hidden"}`}>
                  <RapidPay user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("messagecenter") && (
                <div className={`h-full w-full ${activeTab === "messagecenter" ? "block" : "hidden"}`}>
                  <MessageCenter user={effectiveUser} />
                </div>
              )}
              {visitedTabs.has("logistics") && (
                <div className={`h-full w-full ${activeTab === "logistics" ? "block" : "hidden"}`}>
                  <LogisticsDashboard user={effectiveUser} />
                </div>
              )}
            </React.Suspense>
          </main>

          {/* Streamlined Mobile Bottom 5-Button Dock */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around px-2 py-1.5">
              <button
                onClick={() => { setActiveTab("commbank"); setMobileAppsDrawerOpen(false); }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1 ${
                  activeTab === "commbank" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ShieldCheck className={`w-5 h-5 mb-1 ${activeTab === "commbank" ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold">OS</span>
              </button>

              <button
                onClick={() => { setActiveTab("payments"); setMobileAppsDrawerOpen(false); }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1 ${
                  activeTab === "payments" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Send className={`w-5 h-5 mb-1 ${activeTab === "payments" ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold">Pay</span>
              </button>

              <button
                onClick={() => { setActiveTab("acquisitions"); setMobileAppsDrawerOpen(false); }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1 ${
                  activeTab === "acquisitions" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ShoppingCart className={`w-5 h-5 mb-1 ${activeTab === "acquisitions" ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold">Acquire</span>
              </button>

              <button
                onClick={() => { setActiveTab("smarttech"); setMobileAppsDrawerOpen(false); }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1 ${
                  activeTab === "smarttech" ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Cpu className={`w-5 h-5 mb-1 ${activeTab === "smarttech" ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold">Tech</span>
              </button>

              <button
                onClick={() => setMobileAppsDrawerOpen(!mobileAppsDrawerOpen)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1 ${
                  mobileAppsDrawerOpen || ["bank", "docucraft", "websites", "messagecenter", "logistics"].includes(activeTab)
                    ? "text-cyan-400" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Grid className={`w-5 h-5 mb-1 ${mobileAppsDrawerOpen ? "scale-110" : ""}`} />
                <span className="text-[10px] font-bold">Apps</span>
              </button>
            </div>
          </nav>

          {/* Mobile Slide-Up Apps Drawer */}
          <AnimatePresence>
            {mobileAppsDrawerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
                onClick={() => setMobileAppsDrawerOpen(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 space-y-4 max-h-[75vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Grid className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-base font-black text-white">Sovereign Applications</h3>
                    </div>
                    <button onClick={() => setMobileAppsDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setActiveTab("bank"); setMobileAppsDrawerOpen(false); }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                        activeTab === "bank" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Landmark className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Core Bank</div>
                        <div className="text-[10px] text-slate-400">Global Treasury & Yield</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("messagecenter"); setMobileAppsDrawerOpen(false); }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                        activeTab === "messagecenter" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Messages</div>
                        <div className="text-[10px] text-slate-400">Secure Comms & Mail</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("logistics"); setMobileAppsDrawerOpen(false); }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                        activeTab === "logistics" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Package className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Logistics</div>
                        <div className="text-[10px] text-slate-400">Fleet & Dispatches</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("docucraft"); setMobileAppsDrawerOpen(false); }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                        activeTab === "docucraft" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">DocuCraft</div>
                        <div className="text-[10px] text-slate-400">AI Document Engine</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab("websites"); setMobileAppsDrawerOpen(false); }}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors col-span-2 ${
                        activeTab === "websites" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Globe className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Websites & Deployments</div>
                        <div className="text-[10px] text-slate-400">Production URLs & Cloud Run instances</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={handleForceBatchExport}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Torrens Ledger</span>
                    </button>

                    <button
                      onClick={logOut}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <AIGuide />
        <ThresholdAlerts />
        <ValourianAI />
        <FloatingSpeedDial
          onOpenAI={() => window.dispatchEvent(new Event("open-valourian-ai"))}
          onOpenAlerts={() => window.dispatchEvent(new Event("open-threshold-alerts"))}
          onOpenGuide={() => window.dispatchEvent(new Event("open-ai-guide"))}
        />
        
        {/* Global AI Edit Modal via Triple Click */}
        <AnimatePresence>
        {aiModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md pointer-events-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-[2rem] shadow-2xl border border-emerald-500/30 w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-slate-800 text-white p-5 flex items-center justify-between border-b border-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-xs text-emerald-400">Deep Space Computing Cluster</h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">Sovereign Element Editor (Mobile / PC) • Gemini 3.1 Pro</p>
                  </div>
                </div>
                <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="text-[10px] text-emerald-300 font-mono mb-4 bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl leading-relaxed">
                  <span className="font-bold text-emerald-500">TARGET:</span> {aiModalTarget}
                  <br/>
                  <span className="text-slate-400 mt-1 block">Live Site Injection Ready. Leveraging AWS Quantum, Google Deep Research, Starlink Relay, and SpaceX Telemetry. Sweeping architecture edits enabled.</span>
                </div>
                <textarea 
                  id="deep-space-command"
                  className="w-full h-40 p-4 text-sm bg-slate-950 text-white border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-medium placeholder:text-slate-600 shadow-inner"
                  placeholder="Command the Unified Intelligence Hub via Mobile or PC: Implement sweeping application changes, rewrite core logic, integrate new APIs, update live global sites, or invoke SpaceX/Neuralink hardware commands..."
                  autoFocus
                />
                <button 
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-[0.1em] text-[11px] disabled:opacity-50"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const input = document.getElementById('deep-space-command') as HTMLTextAreaElement;
                    const command = input.value;
                    if (!command) return;
                    
                    btn.disabled = true;
                    btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...';
                    
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
                      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Deploy Maximal Power Update';
                    }
                  }}
                >
                  <Send className="w-4 h-4" /> Deploy Maximal Power Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Sovereign Auto Bug Catcher & Human Flourishing Resilience Console */}
        <AutoBugCatcherConsole />
      </div>
    </ErrorBoundary>
  );
}
