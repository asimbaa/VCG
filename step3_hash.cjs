const fs = require('fs');
let file = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

if (!file.includes('Sovereign Hash:')) {
    // We add a hash generation logic
    file = file.replace(
        'type: "Ultra-Luxury Corporate Nexus (Levels 35-45)",',
        'type: "Ultra-Luxury Corporate Nexus (Levels 35-45)",\n    hash: "a4c28f1b3e94589d8f6d7e6c4b2a1f0d3e5c9b7a4f2d1e8c6b3a9f0d7e5c4b2",\n    mintDate: "2026-08-20T18:45:00Z",'
    );
    file = file.replace(
        'type: "Sovereign Logistics Warehouse",',
        'type: "Sovereign Logistics Warehouse",\n    hash: "f8d3c2b1a0e9d8c7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4",\n    mintDate: "2026-07-24T10:00:00Z",'
    );

    // Now render it in the UI
    const hashBlock = `
                    <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Cryptographic Title Hash (Immutable)</span>
                      </div>
                      <div className="font-mono text-xs text-slate-400 break-all">
                        {prop.hash || "3d5f8c9b2e1a4d7f6c0b9a8e7d6f5c4b3a2e1d0f9b8a7c6d5e4f3b2a1c0d9e8"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Minted: {prop.mintDate || prop.purchaseDate}</div>
                    </div>
`;
    // Find where the prop is rendered
    file = file.replace(
        '<div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">',
        hashBlock + '\n                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">'
    );
}

fs.writeFileSync('src/components/bank/VaultRecords.tsx', file);
