import re

with open("src/components/bank/ValourianStrategicAssets.tsx", "r") as f:
    content = f.read()

# Add prop
content = content.replace("export function ValourianStrategicAssets() {", "export function ValourianStrategicAssets({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {")

# Find the Liquidate button and change it to "ACCESS APEX SYSTEM" or similar, and trigger setActiveTab
liquidate_button = """                    <button 
                      onClick={() => handleLiquidate(asset.id)}
                      className="text-[9px] font-black uppercase tracking-widest bg-slate-950 hover:bg-red-950 hover:text-red-400 hover:border-red-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                    >
                      LIQUIDATE / M&A
                    </button>"""

access_button = """                    <button 
                      onClick={() => {
                        if (setActiveTab) {
                           const target = asset.id.toLowerCase().replace(/\s+/g, '');
                           let tabId = target;
                           if (target.includes('uber') && !target.includes('eats')) tabId = 'uber';
                           if (target.includes('eats')) tabId = 'ubereats';
                           if (target.includes('skyscanner')) tabId = 'skyscanner';
                           if (target.includes('etoro')) tabId = 'etoro';
                           if (target.includes('commbank')) tabId = 'commbank';
                           if (target.includes('commsec')) tabId = 'commsec';
                           if (target.includes('nab')) tabId = 'nab';
                           if (target.includes('pilot')) tabId = 'pgy';
                           if (target.includes('coinbase')) tabId = 'coinbase';
                           
                           // Fallback to liquidate if no direct app route exists, or just route to it if it exists.
                           if (['uber', 'ubereats', 'skyscanner', 'etoro', 'commbank', 'commsec', 'nab', 'pgy', 'coinbase'].includes(tabId)) {
                               setActiveTab(tabId);
                           } else {
                               handleLiquidate(asset.id);
                           }
                        } else {
                            handleLiquidate(asset.id);
                        }
                      }}
                      className="text-[9px] font-black uppercase tracking-widest bg-slate-950 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                    >
                      ACCESS / M&A
                    </button>"""

content = content.replace(liquidate_button, access_button)

with open("src/components/bank/ValourianStrategicAssets.tsx", "w") as f:
    f.write(content)
