import React, { useState } from "react";
import { Globe, Server, Rocket, Layout, Calendar, Shield, ExternalLink, Play, CheckCircle2, ChevronRight, UploadCloud, X, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ValourianLogo } from "../bank/ValourianLogo";

export function Deployments({ user }: { user: any }) {
  const [deploying, setDeploying] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [showPromoSite, setShowPromoSite] = useState(false);
  
  const [activeSites, setActiveSites] = useState([
    { id: 1, name: "Valourian Capital Public Terminal", url: "https://valourian.com", status: "Live", uptime: "99.99%", lastDeployed: "Just now" },
    { id: 2, name: "Valourian Dashboard", url: "https://valourian.app", status: "Live", uptime: "99.99%", lastDeployed: "2 hours ago" },
    { id: 3, name: "Corporate Portal", url: "https://corp.valourian.app", status: "Live", uptime: "100%", lastDeployed: "1 day ago" },
  ]);

  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      toast.error("Please provide a site name");
      return;
    }

    setDeploying(true);
    toast.info("Purchasing dedicated domain & bootstrapping vault...");

    setTimeout(() => {
      toast.info("Provisioning Secure Edge SSL Certificates...");
    }, 1500);

    setTimeout(() => {
      toast.info("Deploying High-Velocity Financial Architecture...");
    }, 3000);

    setTimeout(() => {
      setDeploying(false);
      setActiveSites([
        { 
          id: Date.now(), 
          name: siteName, 
          url: `https://${siteName.toLowerCase().replace(/\s+/g, '-')}.app`, 
          status: "Live", 
          uptime: "100%", 
          lastDeployed: "Just now" 
        },
        ...activeSites
      ]);
      setSiteName("");
      setRepoUrl("");
      toast.success(`${siteName} has been fully provisioned and routed to global edge nodes.`);
    }, 4500);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Promo Site Preview Modal */}
      <AnimatePresence>
        {showPromoSite && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="bg-zinc-950 w-full max-w-5xl h-[85vh] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative"
            >
               <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                     <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                     <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <div className="bg-zinc-950 px-4 py-1.5 rounded-md text-zinc-500 text-xs font-mono border border-zinc-800 flex items-center gap-2">
                     <Lock className="w-3 h-3 text-zinc-600" />
                     https://valourian.com
                  </div>
                  <button onClick={() => setShowPromoSite(false)} className="text-zinc-500 hover:text-white transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto w-full bg-black flex flex-col items-center justify-center relative">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50" />
                   
                   <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
                      <ValourianLogo className="w-32 h-32 mb-8" />
                      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">Valourian Capital</h1>
                      <div className="w-24 h-1 bg-blue-600 mb-8 mx-auto" />
                      <p className="text-xl md:text-3xl text-zinc-300 font-light leading-relaxed mb-12">
                         Pioneering sovereign wealth architecture and hyper-scale technological dominance. Securing multi-generational assets with absolute physical and digital fortress protocols.
                      </p>
                      
                      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                          <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Office of the Founder / CEO</p>
                          <h2 className="text-3xl font-bold text-white tracking-tight">Asim Aryal</h2>
                      </div>
                   </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            Website Deployments
          </h2>
          <p className="text-slate-400 max-w-xl text-lg">
            Easily deploy, manage, and scale your web properties across our global sovereign edge network. Zero-downtime guaranteed.
          </p>
        </div>
        <div className="hidden md:flex gap-4 relative z-10">
          <div className="bg-slate-800 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-blue-400 font-bold text-2xl">{activeSites.length}</p>
            <p className="text-slate-400 text-sm">Active Sites</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-emerald-400 font-bold text-2xl">100%</p>
            <p className="text-slate-400 text-sm">Edge Uptime</p>
          </div>
        </div>
        {/* Background elements */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[100px] w-64 h-64 bg-slate-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Deploy Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-600" />
            New Deployment
          </h3>
          
          <form onSubmit={handleDeploy} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. My Next Big Idea"
                disabled={deploying}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source Repository (Optional)</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://github.com/..."
                disabled={deploying}
              />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Edge Configuration</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Framework Preset</span>
                <span className="text-sm font-bold text-slate-900 border border-slate-200 px-2 py-1 rounded-md bg-white">Auto-Detect</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Region</span>
                <span className="text-sm font-bold text-slate-900 border border-slate-200 px-2 py-1 rounded-md bg-white">Global Edge</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={deploying}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {deploying ? (
                <>Deploying... <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
              ) : (
                <>Launch Site <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        {/* Existing Deployments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-slate-600" />
              Active Environments
            </h3>

            <div className="space-y-4">
              {activeSites.map(site => (
                <motion.div 
                   key={site.id} 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Layout className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{site.name}</h4>
                      <a href="#" className="text-sm text-slate-500 hover:underline flex items-center gap-1">
                        {site.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {site.status}
                      </span>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Last Deployed</p>
                      <p className="text-sm font-semibold text-slate-800">{site.lastDeployed}</p>
                    </div>
                    <button 
                      onClick={() => {
                         if (site.id === 1) setShowPromoSite(true);
                      }}
                      className="w-10 h-10 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center justify-center transition-colors text-slate-400 hover:text-blue-600"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
