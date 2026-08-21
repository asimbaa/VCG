import re

with open('src/components/bank/ValourianStrategicMoat.tsx', 'r') as f:
    content = f.read()

fourth_widget = """
function BlackCardTokenizationWidget() {
  const [state, setState] = useState<'idle'|'tokenizing'|'secured'>('idle');
  
  const handleTokenize = () => {
    setState('tokenizing');
    toast.info("Generating zero-knowledge token for physical hardware...");
    setTimeout(() => {
      setState('secured');
      toast.success("Tap & Pay tokenized. Hardware wallet synced seamlessly.");
    }, 2800);
  };

  return (
    <div className="bg-fuchsia-950/50 rounded-[2rem] p-8 border border-fuchsia-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/10 blur-[60px] rounded-full group-hover:bg-fuchsia-500/20 transition-colors pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-fuchsia-900/50 rounded-xl border border-fuchsia-400/20">
              <Shield className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Hardware Tokenization</h4>
              <p className="text-[10px] text-fuchsia-300/80 font-bold uppercase tracking-widest">Card Tap & Pay</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 font-medium">Instantly tokenizes the Valourian Black Card for mathematically secure, offline-first NFC payments across the US and Australia.</p>
        
        <button 
          disabled={state !== 'idle'}
          onClick={handleTokenize}
          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${state === 'secured' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)]'}`}
        >
          {state === 'idle' && <><Cpu className="w-4 h-4" /> Issue Hardware Token</>}
          {state === 'tokenizing' && <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Secure Element...</>}
          {state === 'secured' && <><CheckCircle2 className="w-4 h-4" /> Tap & Pay Armed</>}
        </button>
      </div>
    </div>
  );
}
"""

content = content.replace("function QuantumLedgerWidget() {", fourth_widget + "\nfunction QuantumLedgerWidget() {")
content = content.replace("<TorrensMatrixWidget />", "<TorrensMatrixWidget />\n        <BlackCardTokenizationWidget />")

with open('src/components/bank/ValourianStrategicMoat.tsx', 'w') as f:
    f.write(content)
