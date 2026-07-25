const fs = require('fs');
let code = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');

const vipItems = `
  {
    id: "gulfstream1",
    name: "Gulfstream G700 Private Jet",
    description: "Factory-new Gulfstream G700 with ultra-long-range capacity. Sovereign Capital VIP bespoke interior layout. Available for immediate handover.",
    price: 110000000,
    category: "vehicles",
    brand: "Gulfstream",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80"
  },
  {
    id: "penthouse1",
    name: "Barangaroo Sovereign Penthouse",
    description: "Tri-level penthouse in Sydney's Barangaroo district. Private elevator, panoramic harbour views, helipad access.",
    price: 35000000,
    category: "property",
    brand: "Valourian Real Estate",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
  },
  {
    id: "island1",
    name: "Private Island (Whitsundays)",
    description: "Fully secluded 120-acre private island. Includes a deep-water marina, airstrip, and off-grid eco-villa complex.",
    price: 45000000,
    category: "property",
    brand: "Valourian Real Estate",
    image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80"
  },
`;

code = code.replace(
  'const STORE_PRODUCTS: Product[] = [',
  'const STORE_PRODUCTS: Product[] = [\n' + vipItems
);

// Add 'property' to categories if there is a category selector
code = code.replace(
  '["All", "electronics", "vehicles", "property", "jewelry", "art"]',
  '["All", "electronics", "vehicles", "property", "jewelry", "art"]' // wait, I don't know the exact array
);

fs.writeFileSync('src/components/bank/SovereignStore.tsx', code);
