const fs = require('fs');
let code = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');

code = code.replace(
  /description: "Factory-new Gulfstream G700 with ultra-long-range capacity. Sovereign Capital VIP bespoke interior layout. Available for immediate handover.",\s*price: 110000000,\s*category: "vehicles",\s*brand: "Gulfstream",\s*image: "https:\/\/images\.unsplash\.com\/photo-1540962351504-03099e0a754b\?auto=format&fit=crop&w=1200&q=80"\s*\}/g,
  `description: "Factory-new Gulfstream G700 with ultra-long-range capacity. Sovereign Capital VIP bespoke interior layout. Available for immediate handover.",
    price: 110000000,
    category: "vehicles",
    brand: "Gulfstream",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80",
    specs: ["Mach 0.925", "7,500 nm range", "VIP Configuration"]
  }`
);

code = code.replace(
  /description: "Exclusively managed private atoll in the South Pacific. Fully staffed resort, airstrip, and superyacht dock.",\s*price: 75000000,\s*category: "real_estate",\s*brand: "Sovereign Real Estate",\s*image: "https:\/\/images\.unsplash\.com\/photo-1499793983690-e29da59ef1c2\?auto=format&fit=crop&w=1200&q=80"\s*\}/g,
  `description: "Exclusively managed private atoll in the South Pacific. Fully staffed resort, airstrip, and superyacht dock.",
    price: 75000000,
    category: "real_estate",
    brand: "Sovereign Real Estate",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
    specs: ["1,200 Acres", "Private Airstrip", "Fully Staffed"]
  }`
);

code = code.replace(
  /description: "A private 5-star Michelin-trained culinary team on retainer for 12 months. Global deployment capabilities.",\s*price: 1200000,\s*category: "services",\s*brand: "Sovereign Hospitality",\s*image: "https:\/\/images\.unsplash\.com\/photo-1600565193348-f74bd3c7ccdf\?auto=format&fit=crop&w=1200&q=80"\s*\}/g,
  `description: "A private 5-star Michelin-trained culinary team on retainer for 12 months. Global deployment capabilities.",
    price: 1200000,
    category: "services",
    brand: "Sovereign Hospitality",
    image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80",
    specs: ["Michelin-trained", "Global Deployment", "12-month retainer"]
  }`
);

fs.writeFileSync('src/components/bank/SovereignStore.tsx', code);
