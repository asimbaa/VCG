const fs = require('fs');

let bookCode = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');
if (!bookCode.includes('const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();')) {
  bookCode = bookCode.replace(
    'export function BookingApp({ user, balances, setBalances }: {',
    'export function BookingApp({ user, balances, setBalances }: {'
  ).replace(
    '  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;\n}) {',
    '  setBalances: React.Dispatch<React.SetStateAction<Record<string, number>>>;\n}) {\n  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();'
  );
  fs.writeFileSync('src/components/bank/BookingApp.tsx', bookCode);
}

let sovCode = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');
sovCode = sovCode.replace(/specs\?: string\[\];/g, 'specs: string[];'); // Ensure optional is removed if added
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1540962351504-03099e0a754b\?auto=format&fit=crop&w=1200&q=80"(?!,?\s*specs)/g, 'image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80", specs: ["Mach 0.925", "7,500 nm range", "VIP Configuration"]');
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1499793983690-e29da59ef1c2\?auto=format&fit=crop&w=1200&q=80"(?!,?\s*specs)/g, 'image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", specs: ["1,200 Acres", "Private Airstrip", "Fully Staffed"]');
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1600565193348-f74bd3c7ccdf\?auto=format&fit=crop&w=1200&q=80"(?!,?\s*specs)/g, 'image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80", specs: ["Michelin-trained", "Global Deployment", "12-month retainer"]');

// just in case they were added but without a comma
sovCode = sovCode.replace(/"https:\/\/images\.unsplash\.com\/photo-1540962351504-03099e0a754b\?auto=format&fit=crop&w=1200&q=80"\s*specs:/g, '"https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80", specs:');
sovCode = sovCode.replace(/"https:\/\/images\.unsplash\.com\/photo-1499793983690-e29da59ef1c2\?auto=format&fit=crop&w=1200&q=80"\s*specs:/g, '"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", specs:');
sovCode = sovCode.replace(/"https:\/\/images\.unsplash\.com\/photo-1600565193348-f74bd3c7ccdf\?auto=format&fit=crop&w=1200&q=80"\s*specs:/g, '"https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80", specs:');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', sovCode);
