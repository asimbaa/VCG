import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallBannerProps {
  installPrompt?: BeforeInstallPromptEvent | null;
  onClearPrompt?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ 
  installPrompt: propPrompt, 
  onClearPrompt 
}) => {
  const [internalPrompt, setInternalPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredPrompt = propPrompt !== undefined ? propPrompt : internalPrompt;
  const setDeferredPrompt = (p: BeforeInstallPromptEvent | null) => {
    setInternalPrompt(p);
    if (!p && onClearPrompt) onClearPrompt();
  };
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };
    checkStandalone();

    // Check dismissed state in current session
    try {
      const dismissed = sessionStorage.getItem('valourian_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {}

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Listen for the Chrome/Android/Desktop beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('valourian_pwa_banner_dismissed', 'true');
    } catch {}
  };

  // If already installed or dismissed, do not display
  if (isInstalled || isDismissed) {
    return null;
  }

  // Only render banner if installable via prompt OR if on mobile iOS browser
  const canPrompt = !!deferredPrompt || isIOS;
  if (!canPrompt) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/80 border-b border-emerald-500/30 text-white px-3 sm:px-4 py-2.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* App Branding & Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-700 to-slate-900 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center">
                <img 
                  src="/apple-touch-icon.png" 
                  alt="Valourian Icon" 
                  className="w-full h-full rounded-[10px] object-cover" 
                  onError={(e) => {
                    // Fallback to SVG badge if image is not yet cached
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <ShieldCheck className="w-5 h-5 text-emerald-300 absolute" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                    Valourian Sovereign OS
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PWA App
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  {isIOS 
                    ? "Add to your Home Screen for full-screen offline access"
                    : "Install the native app for 0ms launch & offline treasury access"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
              >
                {isIOS ? (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Install</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install App</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                aria-label="Dismiss installation banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Installation Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/30 p-5 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Safari Home Screen Installation</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 1:</span> Tap the <strong className="text-blue-300">Share</strong> icon at the bottom of your Safari browser window.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 2:</span> Scroll down and tap <strong className="text-emerald-300">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 3:</span> Tap <strong className="text-amber-300">Add</strong> in the top-right corner to launch directly with native app experience.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
