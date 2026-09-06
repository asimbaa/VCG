const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BlackCardsController.tsx', 'utf8');

content = content.replace(
\`              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setCurrency && setCurrency('USD')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'USD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>USD</button>
                <button onClick={() => setCurrency && setCurrency('AUD')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'AUD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>AUD</button>
                <button onClick={() => setCurrency && setCurrency('EUR')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'EUR' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>EUR</button>
              </div>
            </div>

            <div className="space-y-4">\`,
\`              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setCurrency && setCurrency('USD')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'USD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>USD</button>
                <button onClick={() => setCurrency && setCurrency('AUD')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'AUD' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>AUD</button>
                <button onClick={() => setCurrency && setCurrency('EUR')} className={\\\`px-3 py-1 rounded text-xs font-medium \${currency === 'EUR' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50'}\\\`}>EUR</button>
              </div>

            <div className="space-y-4">\`
);

fs.writeFileSync('src/components/bank/BlackCardsController.tsx', content);
