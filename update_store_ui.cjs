const fs = require('fs');
const file = 'src/components/bank/SovereignStore.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `              </div>

              {/* Grid */}`;

const replacement = `              </div>
              
              <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans cursor-pointer"
                  >
                    <option value="name-asc">Alphabetical (A-Z)</option>
                    <option value="name-desc">Alphabetical (Z-A)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="price-asc">Price (Low to High)</option>
                  </select>
                </div>
              </div>

              {/* Grid */}`;

code = code.replace(target, replacement);

const target2 = `const [paymentMethod, setPaymentMethod] = useState<'vault' | 'card'>('vault');`;
const replacement2 = `const [paymentMethod, setPaymentMethod] = useState<'vault' | 'card'>('vault');
  // UI Guarantee text for checkout
  const guaranteeText = "100000000000% Secure Transport & Immediate Fulfillment Guarantee via Valourian Infrastructure";`;

code = code.replace(target2, replacement2);

const target3 = `{/* CHECKOUT ACTIONS */}`;
const replacement3 = `{/* CHECKOUT ACTIONS */}
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-relaxed">
                      {guaranteeText}
                    </p>
                  </div>`;

code = code.replace(target3, replacement3);


fs.writeFileSync(file, code);
