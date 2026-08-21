const fs = require('fs');

let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

const newProducts = `
  {
    id: "item-luxury-watch",
    name: "Audemars Piguet Royal Oak",
    brand: "Audemars Piguet",
    category: "Accessories",
    price: 85000,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800",
    specs: ["Automatic Movement", "18k Rose Gold", "Sapphire Crystal"]
  },
  {
    id: "item-designer-suit",
    name: "Bespoke Italian Tailored Suit",
    brand: "Brioni",
    category: "Apparel",
    price: 7500,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
    specs: ["Made to Measure", "Super 150s Wool", "Silk Lining"]
  },
  {
    id: "item-supercar",
    name: "Ferrari SF90 Stradale",
    brand: "Ferrari",
    category: "vehicles",
    price: 850000,
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800",
    specs: ["Hybrid V8", "986 hp", "AWD"]
  },
  {
    id: "item-yacht",
    name: "Sunseeker 95 Luxury Yacht",
    brand: "Sunseeker",
    category: "property",
    price: 9500000,
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=800",
    specs: ["5 Cabins", "Crew Quarters", "Twin MTU Engines"]
  },
  {
    id: "app-vision-pro",
    name: "Apple Vision Pro",
    brand: "Apple",
    category: "Hardware",
    price: 3499,
    image: "https://images.unsplash.com/photo-1707345512638-997d31a10eaa?auto=format&fit=crop&q=80&w=800",
    specs: ["Spatial Computing", "Micro-OLED", "M2 Chip"]
  },
  {
    id: "item-rolex",
    name: "Rolex Daytona Platinum",
    brand: "Rolex",
    category: "Accessories",
    price: 125000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
    specs: ["Ice Blue Dial", "Cerachrom Bezel", "Calibre 4130"]
  },
`;

content = content.replace('// Apple', newProducts + '\n  // Apple');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
