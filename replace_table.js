const fs = require('fs');
let code = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf8');
code = code.replace(/<div className="overflow-x-auto">[\s\S]*?<\/table>\n\s*<\/div>/, `
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-5 gap-4 border-b border-slate-100 pb-4 text-xs uppercase tracking-widest font-black text-slate-400 px-4">
            <div>Asset</div>
            <div>Price</div>
            <div>24h Change</div>
            <div>Holdings</div>
            <div className="text-right">Total Value</div>
          </div>
          
          <div className="space-y-3">
            {prices.map((coin) => (
              <div key={coin.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-slate-50 md:bg-transparent p-4 rounded-2xl md:rounded-none md:border-b md:border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="w-10 h-10 md:w-8 md:h-8 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900">{coin.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{coin.symbol}</div>
                  </div>
                </div>
                
                <div className="flex justify-between md:block">
                  <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Price</span>
                  <span className="font-mono text-sm font-semibold text-slate-700">${coin.current_price.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between md:block">
                  <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">24h</span>
                  <div className={\`flex items-center gap-1 text-sm font-bold \${coin.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-red-500"}\`}>
                    {coin.price_change_percentage_24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
                
                <div className="flex justify-between md:block">
                  <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Holdings</span>
                  <span className="font-mono text-sm font-semibold text-slate-700">{coin.balance.toLocaleString()} {coin.symbol}</span>
                </div>
                
                <div className="flex justify-between md:block md:text-right pt-2 md:pt-0 border-t border-slate-200 md:border-0 mt-2 md:mt-0">
                  <span className="text-xs text-slate-400 md:hidden uppercase font-bold tracking-wider">Value</span>
                  <span className="font-bold text-slate-900">\${(coin.balance * coin.current_price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
            {prices.length === 0 && !isLoading && (
              <div className="py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl">No assets found</div>
            )}
          </div>
        </div>`);
fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', code);
