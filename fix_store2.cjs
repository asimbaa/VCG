const fs = require('fs');
let code = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');

code = code.replace(
  '<h2 className="text-2xl font-black tracking-tight text-white uppercase">Sovereign Omni-Store</h2>',
  '<div className="flex items-center gap-4"><h2 className="text-2xl font-black tracking-tight text-white uppercase">Sovereign Omni-Store</h2><CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} /></div>'
);

fs.writeFileSync('src/components/bank/SovereignStore.tsx', code);
