const fs = require('fs');

// 1. BookingApp.tsx import
let bookingCode = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');
if (!bookingCode.includes('useGlobalCurrency')) {
  bookingCode = 'import { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";\n' + bookingCode;
  fs.writeFileSync('src/components/bank/BookingApp.tsx', bookingCode);
}

// 2. AuraDriveMap.tsx viewport -> bounds
let auraCode = fs.readFileSync('src/components/bank/AuraDriveMap.tsx', 'utf-8');
auraCode = auraCode.replace(/routes\[0\]\.viewport/g, 'routes[0].bounds');
fs.writeFileSync('src/components/bank/AuraDriveMap.tsx', auraCode);

// 3. SovereignStore.tsx specs
let sovCode = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');
sovCode = sovCode.replace(/specs:\s*\["Mach 0\.925",\s*"7,500 nm range",\s*"VIP Configuration"\]\n\s*\}/g, 'specs: ["Mach 0.925", "7,500 nm range", "VIP Configuration"]\n  }');
// The previous script might not have matched because of missing \n or spaces.
// Let's just do a simpler replace.
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1540962351504-03099e0a754b\?auto=format&fit=crop&w=1200&q=80"\s*\}/g, 'image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80", specs: ["Mach 0.925", "7,500 nm range", "VIP Configuration"] }');
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1499793983690-e29da59ef1c2\?auto=format&fit=crop&w=1200&q=80"\s*\}/g, 'image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", specs: ["1,200 Acres", "Private Airstrip", "Fully Staffed"] }');
sovCode = sovCode.replace(/image:\s*"https:\/\/images\.unsplash\.com\/photo-1600565193348-f74bd3c7ccdf\?auto=format&fit=crop&w=1200&q=80"\s*\}/g, 'image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80", specs: ["Michelin-trained", "Global Deployment", "12-month retainer"] }');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', sovCode);
