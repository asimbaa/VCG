const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf-8');

const vipRest = `
  {
    id: "r-vip-1",
    name: "Sovereign Private Culinary Team",
    rating: 5.0,
    deliveryTime: "60-90 min",
    deliveryFee: 500,
    category: "Bespoke Dining",
    image: "https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=800&q=80",
    menu: [
      { id: "m-vip-1", name: "Beluga Caviar & Dom Perignon", description: "250g Imperial Beluga Caviar with a chilled bottle of 2012 Dom Perignon.", price: 2500, image: "https://images.unsplash.com/photo-1599021456807-25db0f974333?w=400&q=80" },
      { id: "m-vip-2", name: "A5 Wagyu Tomahawk Feast", description: "In-home preparation of a 2kg A5 Kobe Wagyu tomahawk with truffle sides.", price: 1200, image: "https://images.unsplash.com/photo-1544025162-831e5f8f5334?w=400&q=80" }
    ]
  },`;

code = code.replace(
  'const RESTAURANTS: Restaurant[] = [',
  'const RESTAURANTS: Restaurant[] = [\n' + vipRest
);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', code);
