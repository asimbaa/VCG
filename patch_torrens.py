import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('const [nfcState, setNfcState] = useState<"ready" | "scanning" | "biometric_retina" | "biometric_facial" | "iso20022_clearing" | "processing" | "success">("ready");', 'const [nfcState, setNfcState] = useState<"ready" | "scanning" | "biometric_retina" | "biometric_facial" | "iso20022_clearing" | "torrens_signing" | "processing" | "success">("ready");\\n  const [isOfflineTorrensMode, setIsOfflineTorrensMode] = useState(false);')

content = content.replace('Server, Satellite } from "lucide-react";', 'Server, Satellite, WifiOff, FileLock } from "lucide-react";')

toggle_ui = """              </div>
              )}

              {nfcState === "ready" && (
                <div className="w-full mb-6">
                  <div 
                    onClick={() => setIsOfflineTorrensMode(!isOfflineTorrensMode)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isOfflineTorrensMode ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOfflineTorrensMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        <WifiOff className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isOfflineTorrensMode ? 'text-amber-400' : 'text-slate-300'}`}>Offline Torrens Matrix</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cryptographic Batch Signing</div>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isOfflineTorrensMode ? 'bg-amber-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isOfflineTorrensMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              )}

              <motion.div """

content = content.replace("""              </div>
              )}


              <motion.div """, toggle_ui)

processing_logic = """                    onClick={() => {
                      setNfcState("scanning");
                      if (isOfflineTorrensMode) {
                          setTimeout(() => setNfcState("biometric_retina"), 1000);
                          setTimeout(() => setNfcState("torrens_signing"), 2500);
                          setTimeout(() => setNfcState("processing"), 4500);
                          setTimeout(async () => {
                            setNfcState("success");
                            
                            let parsedAmt = parseFloat(terminalAmount) || 25.00;
                            let txAmount = parsedAmt;
                            if (nfcMode === "receive") txAmount = parsedAmt;
                            if (nfcMode === "refund") txAmount = parsedAmt; 
                            if (nfcMode === "send") txAmount = -parsedAmt; 
                            if (nfcMode === "pay") txAmount = -parsedAmt; 
                            
                            toast.success(`Torrens Offline Proof generated & stored for $${Math.abs(txAmount).toFixed(2)} AUD. Batch sync queued.`);
                            setTimeout(() => setIsNfcOverlayOpen(false), 3000);
                          }, 6000);
                      } else {
                          setTimeout(() => setNfcState("biometric_retina"), 1000);
                          setTimeout(() => setNfcState("biometric_facial"), 2000);
                          setTimeout(() => setNfcState("iso20022_clearing"), 3500);
                          setTimeout(() => setNfcState("processing"), 5000);
                          setTimeout(async () => {
                            setNfcState("success");"""

content = content.replace("""                    onClick={() => {
                      setNfcState("scanning");
                      setTimeout(() => setNfcState("biometric_retina"), 1000);
                      setTimeout(() => setNfcState("biometric_facial"), 2000);
                      setTimeout(() => setNfcState("iso20022_clearing"), 3500);
                      setTimeout(() => setNfcState("processing"), 5000);
                      setTimeout(async () => {
                        setNfcState("success");""", processing_logic)

closing_bracket = """                        toast.success(nfcMode === "receive" || nfcMode === "refund" ? `Funds received successfully (${Math.abs(txAmount).toFixed(2)} AUD).` : nfcMode === "send" ? `Funds sent successfully (${Math.abs(txAmount).toFixed(2)} AUD).` : `Payment authorized successfully (${Math.abs(txAmount).toFixed(2)} AUD).`);

                        setTimeout(() => setIsNfcOverlayOpen(false), 2000);
                      }, 3000);
                      }
                    }}"""
content = content.replace("""                        toast.success(nfcMode === "receive" || nfcMode === "refund" ? `Funds received successfully (${Math.abs(txAmount).toFixed(2)} AUD).` : nfcMode === "send" ? `Funds sent successfully (${Math.abs(txAmount).toFixed(2)} AUD).` : `Payment authorized successfully (${Math.abs(txAmount).toFixed(2)} AUD).`);

                        setTimeout(() => setIsNfcOverlayOpen(false), 2000);
                      }, 3000);
                    }}""", closing_bracket)

visuals = """                {nfcState === "iso20022_clearing" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-4 border-fuchsia-500/50 rounded-full flex items-center justify-center bg-fuchsia-500/10 backdrop-blur-md"
                  >
                    <Globe className="w-12 h-12 text-fuchsia-400 animate-pulse" />
                  </motion.div>
                )}
                {nfcState === "torrens_signing" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-4 border-amber-500/50 rounded-full flex items-center justify-center bg-amber-500/10 backdrop-blur-md"
                  >
                    <FileLock className="w-12 h-12 text-amber-400 animate-pulse" />
                  </motion.div>
                )}
                {nfcState === "success" && ("""

content = content.replace("""                {nfcState === "iso20022_clearing" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-4 border-fuchsia-500/50 rounded-full flex items-center justify-center bg-fuchsia-500/10 backdrop-blur-md"
                  >
                    <Globe className="w-12 h-12 text-fuchsia-400 animate-pulse" />
                  </motion.div>
                )}
                {nfcState === "success" && (""", visuals)

labels = """                  {nfcState === "iso20022_clearing" && (
                    <motion.div key="iso20022_clearing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <h2 className="text-2xl font-bold text-fuchsia-400">SWIFT ISO-20022</h2>
                      <p className="text-fuchsia-500/80 animate-pulse">Bypassing acquirer limits. Executing zero-latency settlement...</p>
                    </motion.div>
                  )}
                  {nfcState === "torrens_signing" && (
                    <motion.div key="torrens_signing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <h2 className="text-2xl font-bold text-amber-400">Torrens Authorization</h2>
                      <p className="text-amber-500/80 animate-pulse">Generating offline cryptographic proof. Awaiting network sync...</p>
                    </motion.div>
                  )}
                  {nfcState === "processing" && ("""
                  
content = content.replace("""                  {nfcState === "iso20022_clearing" && (
                    <motion.div key="iso20022_clearing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <h2 className="text-2xl font-bold text-fuchsia-400">SWIFT ISO-20022</h2>
                      <p className="text-fuchsia-500/80 animate-pulse">Bypassing acquirer limits. Executing zero-latency settlement...</p>
                    </motion.div>
                  )}
                  {nfcState === "processing" && (""", labels)

with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)
