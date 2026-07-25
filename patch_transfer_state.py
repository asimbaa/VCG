import re

with open("src/components/bank/CryptoPortfolio.tsx", "r") as f:
    content = f.read()

# Add states for transfer
state_declarations = """
  const [showTransfer, setShowTransfer] = useState<"send" | "receive" | null>(null);
  
  // Transfer states
  const [transferAsset, setTransferAsset] = useState<string>('');
  const [transferDestination, setTransferDestination] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
"""

content = content.replace("  const [showTransfer, setShowTransfer] = useState<\"send\" | \"receive\" | null>(null);", state_declarations)

# Update form
form_content = """
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Asset</label>
                    <select 
                        value={transferAsset} 
                        onChange={(e) => setTransferAsset(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="" disabled>Select an asset...</option>
                      {viewMode === 'crypto' 
                        ? prices.map(p => <option key={p.id} value={p.id}>{p.name} ({p.balance} {p.symbol})</option>)
                        : fiatBalances.map(f => <option key={f.id} value={f.id}>{f.name} ({f.icon}{f.balance} {f.symbol})</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {viewMode === 'crypto' ? 'Coinbase Wallet Address' : 'Bank Account (BSB & Account / IBAN)'}
                    </label>
                    <input 
                        type="text" 
                        value={transferDestination}
                        onChange={(e) => setTransferDestination(e.target.value)}
                        placeholder={viewMode === 'crypto' ? "0x..." : "Bank Details..."} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            placeholder="0.00" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        />
                        <button 
                            onClick={() => {
                                if (transferAsset) {
                                    const max = viewMode === 'crypto' 
                                        ? prices.find(p => p.id === transferAsset)?.balance 
                                        : fiatBalances.find(f => f.id === transferAsset)?.balance;
                                    if (max) setTransferAmount(max.toString());
                                }
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-300"
                        >
                            MAX
                        </button>
                    </div>
                  </div>
                  <Button 
                    disabled={isProcessing || !transferAsset || !transferDestination || !transferAmount || parseFloat(transferAmount) <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20" 
                    onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                            if (viewMode === 'crypto') {
                                setPrices(prev => prev.map(p => p.id === transferAsset ? {...p, balance: p.balance - parseFloat(transferAmount)} : p));
                                toast.success(`Successfully sent ${transferAmount} to Coinbase Wallet ${transferDestination.substring(0, 8)}...`);
                            } else {
                                setFiatBalances(prev => prev.map(f => f.id === transferAsset ? {...f, balance: f.balance - parseFloat(transferAmount)} : f));
                                toast.success(`Wire transfer of ${transferAmount} initiated to ${transferDestination}`);
                            }
                            setIsProcessing(false);
                            setShowTransfer(null);
                            setTransferAsset('');
                            setTransferDestination('');
                            setTransferAmount('');
                        }, 1500);
                  }}>
                    {isProcessing ? 'Processing Transfer...' : 'Confirm Transfer'}
                  </Button>
                </>
"""

content = re.sub(
    r"<\s*>\s*<div>\s*<label className=\"block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2\">Select Asset</label>.*?</Button>\s*</>",
    form_content,
    content,
    flags=re.DOTALL
)

with open("src/components/bank/CryptoPortfolio.tsx", "w") as f:
    f.write(content)

