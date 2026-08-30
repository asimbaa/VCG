const fs = require('fs');
let content = fs.readFileSync('src/components/bank/GlobalTreasuryTab.tsx', 'utf8');

// Update crypto and real estate allocations
content = content.replace(
  "{ name: 'Physical Real Estate', value: 150000000000, color: '#f59e0b' }",
  "{ name: 'Physical Real Estate', value: 850000000000, color: '#f59e0b' }"
);
content = content.replace(
  "{ name: 'Sovereign Crypto Vault', value: 25000000000, color: '#06b6d4' }",
  "{ name: 'Sovereign Crypto Vault', value: 1250000000000, color: '#06b6d4' }" // $1.25 Trillion in Crypto
);

// Add cashflow metrics
if (content.includes('+14.2% YTD')) {
  content = content.replace(
    '<TrendingUp className="w-4 h-4" /> +14.2% YTD',
    '<TrendingUp className="w-4 h-4" /> +14.2% YTD\n                </span>\n                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">\n                  <DollarSign className="w-4 h-4" /> +$4.82B Daily Cashflow'
  );
}

fs.writeFileSync('src/components/bank/GlobalTreasuryTab.tsx', content);
