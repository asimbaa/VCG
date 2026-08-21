const fs = require('fs');
const file = 'src/components/bank/ValourianDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

const target1 = `) : activeTab === "empty" ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-500 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                  <Cpu className="w-24 h-24 text-emerald-500 relative z-10" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-wider">SOVEREIGN CORE ACTIVE</h3>
                  <p className="max-w-md mx-auto text-sm text-slate-400">
                    This module is currently initializing in the Valourian quantum sandbox.
                    Select a fully active protocol from the command index on the left to proceed.
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setActiveTab("cards")}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/50"
                  >
                    Open Treasury
                  </button>
                  <button 
                    onClick={() => setActiveTab("docucraft")}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Generate Contracts
                  </button>
                </div>
              </div>`;

const replacement1 = ``;

code = code.replace(target1, replacement1);


fs.writeFileSync(file, code);
