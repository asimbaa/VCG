const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const importReplacement = `import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot, Sparkles, X } from "lucide-react";`;

content = content.replace(/import React, { useEffect, useState } from "react";\nimport { Landmark, ShieldCheck, LogOut, Loader2, FileText, Globe, Send, Mail, Bot, Sparkles } from "lucide-react";/, importReplacement);

const stateAddition = `
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

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
`;

content = content.replace(/const \[aiModalTarget, setAiModalTarget\] = useState\(""\);/, 'const [aiModalTarget, setAiModalTarget] = useState("");\n' + stateAddition);

const bannerCode = `
      <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 font-sans text-white transition-colors">
        {showInstallBanner && (
          <div className="bg-slate-950 border-b border-emerald-500/30 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between relative z-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <Landmark className="w-6 h-6 text-[#ffcc00]" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Install Valourian Capital</p>
                <p className="text-slate-400 text-xs">Add to Home Screen for native experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider"
              >
                Install
              </button>
              <button
                onClick={handleDismissBanner}
                className="text-slate-500 hover:text-slate-300 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
`;

content = content.replace(/<ErrorBoundary>\s*<div className="min-h-screen bg-slate-900 font-sans text-white transition-colors">/, bannerCode);

fs.writeFileSync('src/App.tsx', content);
