import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');

// Replace duplicate state declarations block
const duplicateState = `  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Standby");
  const [bridgeAsset, setBridgeAsset] = useState('BTC');
  const [bridgeAddress, setBridgeAddress] = useState('');
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<null | 'validating' | 'confirmed' | 'failed'>(null);

  React.useEffect(() => {
    let interval: any;
    if (aiEnabled) {
      setAiStatus("Analyzing Market Liquidity...");
      interval = setInterval(() => {
        setAiStatus(prev => prev === "Analyzing Market Liquidity..." ? "Rebalancing Portfolios..." : "Analyzing Market Liquidity...");
        if (Math.random() > 0.7) {
            toast.success("AI Agent executed micro-rebalance across Tech Sector", { icon: <Zap className="w-4 h-4 text-emerald-400" /> });
        }
      }, 5000);
    } else {
      setAiStatus("Standby");
    }
    return () => clearInterval(interval);
  }, [aiEnabled]);`;

// Just find the second instance of it, and remove it. But actually it's easier to remove ALL instances and then insert just one. Or split by this chunk and join.

const parts = content.split(duplicateState);
if (parts.length > 1) {
  content = parts.join(''); // remove all
  // insert it once after `const { user } = useAuth();`
  content = content.replace('const { user } = useAuth();', 'const { user } = useAuth();\n' + duplicateState);
}

const duplicateAIBlock = `                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${aiEnabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'}\`}>
                        <Bot className={\`w-5 h-5 \${aiEnabled ? 'text-emerald-400' : 'text-slate-400'}\`} />
                      </div>
                      <div>
                        <h4 className="text-white font-black">AI Liquidity Management</h4>
                        <p className={\`text-[10px] font-bold uppercase tracking-widest \${aiEnabled ? 'text-emerald-400' : 'text-slate-500'}\`}>{aiStatus}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={\`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors \${aiEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}\`}
                    >
                      {aiEnabled ? 'Deactivate AI' : 'Activate AI'}
                    </button>
                  </div>
                  {aiEnabled && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-300/80 leading-relaxed">
                        Sovereign Agent is now actively managing liquidity, rebalancing assets in real-time, and targeting high-growth technology equities based on Deep Tech predictive models.
                      </p>
                    </div>
                  )}
                </div>`;

const aiParts = content.split(duplicateAIBlock);
if (aiParts.length > 2) {
   content = aiParts[0] + duplicateAIBlock + aiParts.slice(2).join('');
}

fs.writeFileSync('src/components/bank/EToroApp.tsx', content);
