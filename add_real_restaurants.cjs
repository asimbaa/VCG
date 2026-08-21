const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `const RESTAURANTS = [`;
const replacement = `const RESTAURANTS = [
  {
    id: 1001, name: "Quay Restaurant (Direct Dispatch)", cuisine: "Contemporary Australian & Fine Dining", rating: 5.0, deliveryTime: "VIP Courier", image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80", is24Hours: true,
    menu: [
      { id: "q1", name: "Eight-Course Tasting Menu for Two", price: 750 },
      { id: "q2", name: "White Coral Dessert (Signature)", price: 85 },
      { id: "q3", name: "Caviar & Crumpets Supplement", price: 210 }
    ]
  },
  {
    id: 1002, name: "Tetsuya's (Sovereign Escort)", cuisine: "Japanese-French Degustation", rating: 4.9, deliveryTime: "Chilled Fleet", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80", is24Hours: true,
    menu: [
      { id: "t1", name: "Confit of Ocean Trout (Signature)", price: 120 },
      { id: "t2", name: "Wagyu Beef with Braised Leeks", price: 155 },
      { id: "t3", name: "Full Degustation Experience (At Home)", price: 650 }
    ]
  },
  {
    id: 1003, name: "Bennelong (Express Drone)", cuisine: "Modern Australian", rating: 4.9, deliveryTime: "Immediate Transport", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", is24Hours: true,
    menu: [
      { id: "b1", name: "Roasted John Dory on the Bone", price: 145 },
      { id: "b2", name: "Cherry Jam Lamington", price: 45 },
      { id: "b3", name: "Sydney Rock Oysters (Dozen)", price: 95 }
    ]
  },`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
