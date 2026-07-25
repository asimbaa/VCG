const fs = require('fs');
let code = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');

const vipHotel = `
  {
    id: "h-vip-1",
    name: "Sovereign Private Island Resort",
    location: "Whitsundays, Australia",
    rating: 5.0,
    reviews: 12,
    price: 15000,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    description: "Exclusive use of a private island resort. Includes personal submarine, Michelin-star private chef, and 24/7 security detail.",
    amenities: ["Private Island", "Submarine Access", "Michelin Chef", "Helipad", "Full Security"]
  },`;

code = code.replace(
  'const HOTELS = [',
  'const HOTELS = [\n' + vipHotel
);

fs.writeFileSync('src/components/bank/BookingApp.tsx', code);
