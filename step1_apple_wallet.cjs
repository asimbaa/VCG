const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Inside cards tab, around the map of digitalCards
const appleWalletBtn = `
                                            <button 
                                                onClick={() => toast.success("Contacting Apple Secure Element... Tokenizing... Added to Apple Wallet successfully.", { icon: "🍎" })}
                                                className="w-full mt-4 bg-black/80 hover:bg-black text-white font-bold py-2 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500"
                                            >
                                                Add to Apple Wallet
                                            </button>
`;

if (!file.includes('Add to Apple Wallet')) {
    // Find where the card is rendered
    file = file.replace(
        '<div className="mt-4 flex justify-between items-end">',
        appleWalletBtn + '\n                                            <div className="mt-4 flex justify-between items-end">'
    );
}

// Rename biometric to Zero-Friction Sovereign Clearance
file = file.replace(/biometric verification/g, 'Sovereign Clearance');
file = file.replace(/Biometric/g, 'Sovereign Clearance');
file = file.replace(/Scanning biometrics/g, 'Verifying Master Key');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
