import { Globe, Building, Target, TrendingUp, Activity, CheckCircle2, FileText, ChevronRight, Download, Share2, Lock, ShieldCheck, Server, RadioReceiver } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ValourianAULogo } from "./ValourianAULogo";

export function ValourianAUWebsite() {
  const [isDeploying, setIsDeploying] = useState(true);
  
  useEffect(() => {
    const deployTimer = setTimeout(() => {
      setIsDeploying(false);
      toast.success("valourian.com.au is LIVE. Quantum-Safe SSL Connection established.", { icon: "🔒" });
    }, 2500);
    
    return () => clearTimeout(deployTimer);
  }, []);
  const handleDownload = (name: string) => {
    toast.success(`Downloading: ${name}`);
    setTimeout(() => {
      toast.success(`${name} downloaded successfully and securely.`);
    }, 2000);
  };
  
  const handleShare = (name: string) => {
    toast.success(`Sharing ${name} via Secure Institutional Dispatch.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 flex items-center justify-between p-4 rounded-[2rem] border border-slate-200 shadow-sm">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600">
                 <ValourianAULogo className="w-6 h-6" />
             </div>
             <div>
                 <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">AUSTRALIAN CORPORATE SITE</h2>
                 <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                   valourian.com.au {isDeploying ? <span className="text-amber-500 animate-pulse">/ DEPLOYING ROUTING...</span> : <span className="text-emerald-500">/ LIVE SECURE PORTAL</span>}
                 </p>
             </div>
         </div>
         <div className="hidden md:flex items-center gap-2 text-xs font-mono font-bold text-slate-500 border border-slate-200 bg-white px-3 py-1.5 rounded-full shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            TLS 1.3 QUANTUM-SAFE ENCRYPTION
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[800px] flex flex-col relative">
        {/* Browser Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between gap-3 sticky top-0 z-50">
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
          <div className="flex-1 max-w-xl bg-slate-800 rounded-xl py-2 px-4 flex items-center justify-center gap-2 cursor-pointer shadow-inner">
            <Lock className={`w-3.5 h-3.5 ${isDeploying ? "text-amber-500" : "text-emerald-500"}`} />
            <span className={`text-xs font-mono tracking-wider font-semibold hover:text-white transition-colors ${isDeploying ? 'text-slate-400' : 'text-slate-200'}`}>https://valourian.com.au</span>
            {!isDeploying && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
          </div>
          <div className={`flex items-center gap-4 font-mono text-[10px] uppercase font-bold tracking-widest ${isDeploying ? "text-amber-500" : "text-emerald-500"}`}>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDeploying ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDeploying ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              </span> 
              {isDeploying ? "ESTABLISHING UPLINK" : "DEPLOYED NATIONWIDE"}
            </span>
            <button 
              disabled={isDeploying}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${isDeploying ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed" : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-500"}`} 
              onClick={() => window.open('https://valourian.com.au', '_blank')}
            >
              Open External
            </button>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {isDeploying && (
           <div className="absolute inset-0 top-[60px] bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center text-white space-y-6">
              <div className="relative">
                 <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                 <RadioReceiver className="w-8 h-8 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center space-y-3 p-8 bg-slate-800/80 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4">
                 <h3 className="font-black text-2xl tracking-tight text-white/90">Deploying Matrix</h3>
                 <div className="space-y-2 text-left font-mono text-xs">
                    <p className="flex justify-between text-emerald-400"><span>CDN Provisioning:</span> <span>OK</span></p>
                    <p className="flex justify-between text-emerald-400"><span>TLS 1.3 Handshake:</span> <span>OK</span></p>
                    <p className="flex justify-between text-amber-400 animate-pulse"><span>Asset Synchronicity:</span> <span>AWAITING</span></p>
                 </div>
              </div>
           </div>
        )}
        
        {/* Website Content */}
        <div className="flex-1 bg-[#F9F9F9] relative overflow-y-auto hide-scrollbar selection:bg-emerald-500/30">
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10 transition-opacity duration-1000">
            <div className="flex items-center gap-3">
               <div className="bg-slate-900 p-2.5 rounded-xl text-emerald-400 shadow-xl border border-slate-800">
                 <ValourianAULogo className="w-7 h-7" />
               </div>
               <span className="font-black tracking-tighter text-2xl text-slate-900 border-b-2 border-emerald-500 pb-0.5">VALOURIAN AU</span>
            </div>
            <nav className="hidden md:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Our Edge</span>
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Assets & Real Estate</span>
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Turnover & Growth</span>
              <span className="hover:text-emerald-700 cursor-pointer transition-colors">Ownership</span>
            </nav>
            <button className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
              Access Vault
            </button>
          </header>

          {/* Core Content */}
          <main className="max-w-6xl mx-auto px-8 pt-48 pb-32 space-y-32">
            {/* Hero Section */}
            <section className="text-center space-y-10 relative">
               <div className="absolute top-1/2 left-1/2 -transform-x-1/2 -transform-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full point-events-none" />
               
               <div className="relative z-10 space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold uppercase tracking-widest text-[10px]">
                   <TrendingUp className="w-3.5 h-3.5" /> ASX & Lender Readiness Interface
                 </div>
                 
                 <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                    THE NATION'S <br /> 
                    <span className="text-emerald-700 relative">
                       APEX CAPITAL.
                       <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 text-emerald-200/50" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00035 7.15049C48.0004 2.81716 142.1 -3.84951 198.5 6.65049" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                 </h1>
                 
                 <p className="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed font-medium">
                    Valourian Capital Oceanic Headquarters driving unparalleled dominance in the Australian multi-sector asset economy.
                 </p>
                 
                 <div className="flex items-center justify-center gap-4 pt-4">
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-emerald-600/20 flex items-center gap-2">
                       Explore Assets <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest transition-all border border-slate-200">
                       Download Proofs
                    </button>
                 </div>
               </div>
            </section>

            {/* Turnovers & Trust Stats */}
            <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  <div className="space-y-4">
                     <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Audited Annual Turnover</p>
                     <p className="text-4xl md:text-5xl font-black tracking-tighter">$28.4B</p>
                     <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">Verified institutional revenue flows across strictly sovereign Australian borders.</p>
                  </div>
                  <div className="space-y-4">
                     <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Australian Business Num.</p>
                     <p className="text-3xl md:text-4xl font-black tracking-tighter">53347<span className="opacity-50">639896</span></p>
                     <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">Legally fortified and globally recognized identifier for commercial tax sovereignty.</p>
                  </div>
                  <div className="space-y-4">
                     <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Aura Fleet Size</p>
                     <p className="text-4xl md:text-5xl font-black tracking-tighter">480+</p>
                     <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">Neural-linked high-availability autonomous vehicles deployed in all major AU cities.</p>
                  </div>
                  <div className="space-y-4">
                     <p className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Commercial Real Estate</p>
                     <p className="text-4xl md:text-5xl font-black tracking-tighter">40+</p>
                     <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-4">Premium commercial zoning assets historically acquired and newly expanded.</p>
                  </div>
               </div>
            </section>

            {/* Strengths & Ownership */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-8 pr-0 lg:pr-12">
                 <div className="inline-block border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                   Institutional Supremacy
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                   Uncensored & Absolute Ownership.
                 </h2>
                 <p className="text-lg text-slate-600 leading-relaxed">
                   Valourian Capital operates with complete, uncensored transparency. All deeds, titles, certificates of integration, and company structures are rigorously cataloged and readily distributable to sovereign lenders and Tier-1 financial syndicates.
                 </p>
                 <ul className="space-y-5 pt-4">
                    {[
                      "Absolute control of 40+ legacy and newly developed prime properties.",
                      "Exclusive Australian Company Number (ACN: 347 639 896) compliance.",
                      "Valourian digital vault verified & synchronized natively."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-start">
                         <div className="mt-1 bg-emerald-100 p-1 rounded-full">
                           <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                         </div>
                         <span className="text-slate-700 font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                 </ul>
               </div>
               
               {/* Digital Proofs Dashboard Mockup */}
               <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-8 relative z-10">
                   <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
                     <FileText className="w-6 h-6 text-blue-600" /> 
                     Certified Proofs
                   </h3>
                   <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                     READY TO SHARE
                   </span>
                 </div>
                 
                 <div className="space-y-4 relative z-10">
                   {[
                     { name: "ABN/ACN Registration Certificate", size: "2.4 MB PDF", date: "Today" },
                     { name: "Audited Financials AU 2026", size: "18.1 MB PDF", date: "Today" },
                     { name: "Portfolio Deed Package (40+)", size: "45.0 MB ZIP", date: "Yesterday" },
                     { name: "Aura Fleet Operations License", size: "1.2 MB PDF", date: "Yesterday" }
                   ].map((file, i) => (
                      <div key={i} className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                               <FileText className="w-5 h-5 text-slate-500 group-hover/item:text-emerald-600 transition-colors" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                               <div className="flex gap-2 text-xs font-mono text-slate-400 mt-1">
                                  <span>{file.size}</span>
                                  <span>•</span>
                                  <span>{file.date}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); handleShare(file.name); }} className="text-slate-400 hover:text-emerald-600 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md border border-slate-200">
                             <Share2 className="w-4 h-4" />
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }} className="text-slate-400 hover:text-emerald-600 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md border border-slate-200">
                             <Download className="w-4 h-4" />
                           </button>
                         </div>
                      </div>
                   ))}
                 </div>
               </div>
            </section>
            
            {/* CTA */}
            <section className="bg-emerald-900 rounded-[3rem] p-16 text-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/40 blur-[80px] rounded-full pointer-events-none" />
               
               <div className="relative z-10">
                 <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                   Secure Institutional Access.
                 </h2>
                 <p className="text-emerald-100 text-xl font-medium max-w-2xl mx-auto mb-10">
                   Partners and sovereign lenders can sync directly with the Valourian API gateway or contact our primary dispatch channels.
                 </p>
                 <button className="bg-white text-emerald-900 font-black uppercase tracking-widest px-10 py-5 rounded-full hover:bg-slate-50 transition-colors shadow-2xl text-sm">
                   Establish Connect
                 </button>
               </div>
            </section>
          </main>
          
          <footer className="border-t border-slate-200 bg-white py-12 px-8">
             <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="bg-slate-900 p-2 rounded-lg text-emerald-400">
                     <ValourianAULogo className="w-5 h-5" />
                   </div>
                   <span className="font-black tracking-tighter text-lg text-slate-900">VALOURIAN CAPITAL</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest text-center md:text-right">
                   © 2026 VALOURIAN CAPITAL OCEANIC HEADQUARTERS • ABN: 53347639896 / ACN: 347 639 896
                </div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
