import re

with open("src/components/bank/UberEatsApp.tsx", "r") as f:
    code = f.read()

new_restaurants = """const RESTAURANTS = [
  {
    id: 1, name: "Valourian Sovereign Property Brokerage", cuisine: "Real Estate & Deeds", rating: 5.0, deliveryTime: "Secure Escrow", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'p1', name: 'Sydney Harbour Waterfront Mansion Deed & Keys', price: 25000000 },
      { id: 'p2', name: 'Manhattan Penthouse Title & Keys', price: 35000000 },
      { id: 'p3', name: 'Private Island - South Pacific (Deed)', price: 42000000 },
      { id: 'p4', name: 'Commercial Skyscraper - CBD (Title)', price: 150000000 },
      { id: 'p5', name: 'Gold Vault Access Keys & Title', price: 5000000 }
    ]
  },
  {
    id: 2, name: "Valourian Luxury Apparel & Fashion", cuisine: "Designer Wear", rating: 4.9, deliveryTime: "15-30 min", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'a1', name: 'Bespoke Tailored Italian Suit', price: 4500 },
      { id: 'a2', name: 'Cashmere Winter Jacket', price: 2100 },
      { id: 'a3', name: 'Designer Silk Trousers', price: 850 },
      { id: 'a4', name: 'Premium Cotton Undies (Pack of 3)', price: 120 },
      { id: 'a5', name: 'Merino Wool Socks (Pack of 5)', price: 90 },
      { id: 'a6', name: 'Performance Joggers', price: 180 },
      { id: 'a7', name: 'Organic Cotton T-Shirt (White)', price: 75 },
      { id: 'a8', name: 'Limited Edition Baseball Hat', price: 150 },
      { id: 'a9', name: 'Leather Duffle Bag', price: 1200 },
      { id: 'a10', name: 'Silk Pocket Square', price: 65 }
    ]
  },
  {
    id: 3, name: "Deep Tech & Computing Cluster", cuisine: "High-End Electronics", rating: 4.9, deliveryTime: "15-30 min", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", is24Hours: true,
    menu: [
      { id: 't1', name: 'Quantum Processor Node (AURA-9)', price: 125000 },
      { id: 't2', name: 'Starlink Enterprise Kit', price: 2500 },
      { id: 't3', name: 'Valourian Secure Mobile Terminal', price: 4500 },
      { id: 't4', name: 'H100 AI Compute Server', price: 45000 },
      { id: 't5', name: 'Encrypted Hardware Wallet (Titanium)', price: 850 },
      { id: 't6', name: 'Neuro-Link Interface Headset', price: 12000 }
    ]
  },
  {
    id: 4, name: "Sovereign Cellars & Spirits", cuisine: "Fine Wine & Champagne", rating: 4.9, deliveryTime: "15-30 min", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'w1', name: 'Dom Pérignon Vintage 2008 (Case of 6)', price: 1800 },
      { id: 'w2', name: 'Château Lafite Rothschild 2010', price: 2200 },
      { id: 'w3', name: 'Louis Roederer Cristal 2014', price: 450 },
      { id: 'w4', name: 'Penfolds Grange 2018', price: 950 },
      { id: 'w5', name: 'Macallan 25 Year Old Sherry Oak', price: 3500 },
      { id: 'w6', name: 'Yamazaki 18 Year Old Single Malt', price: 1200 }
    ]
  },
  {
    id: 5, name: "Oceanic Surf & Dive Operations", cuisine: "Watersports Gear", rating: 4.8, deliveryTime: "15-30 min", image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80", is24Hours: true,
    menu: [
      { id: 's1', name: 'Custom Carbon Fiber Surfboard', price: 1500 },
      { id: 's2', name: 'Premium 4/3mm Neoprene Wetsuit', price: 550 },
      { id: 's3', name: 'Professional Scuba Dive Computer', price: 1200 },
      { id: 's4', name: 'Titanium Diver Watch', price: 8500 },
      { id: 's5', name: 'Aerodynamic Hydrofoil Board', price: 2800 }
    ]
  },
  {
    id: 6, name: "Aria Premium Dining", cuisine: "Fine Dining", rating: 4.9, deliveryTime: "15-55 min", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'r1', name: 'Beluga Caviar Tasting Menu', price: 450 },
      { id: 'r2', name: 'A5 Wagyu Beef Tenderloin', price: 280 },
      { id: 'r3', name: 'Lobster Thermidor', price: 195 },
      { id: 'r4', name: 'Truffle Risotto', price: 120 },
      { id: 'r5', name: 'Gold Leaf Chocolate Soufflé', price: 85 }
    ]
  },
  {
    id: 7, name: "Nobu Sydney", cuisine: "Japanese", rating: 4.8, deliveryTime: "15-55 min", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'n1', name: 'Black Cod Miso', price: 85 },
      { id: 'n2', name: 'Yellowtail Jalapeño', price: 45 },
      { id: 'n3', name: 'Premium Sashimi Platter (24 pcs)', price: 180 },
      { id: 'n4', name: 'Wagyu Toban Yaki', price: 110 }
    ]
  },
  {
    id: 8, name: "Quay Restaurant", cuisine: "Modern Australian", rating: 4.9, deliveryTime: "15-55 min", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'q1', name: 'Snow Egg Dessert', price: 45 },
      { id: 'q2', name: 'Confit Pig Belly', price: 65 },
      { id: 'q3', name: 'Maremma Duck', price: 85 },
      { id: 'q4', name: 'Smoked Eel Cream & Caviar', price: 110 }
    ]
  },
  {
    id: 9, name: "Gucci Flagship CBD", cuisine: "Luxury Accessories", rating: 4.8, deliveryTime: "15-30 min", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'g1', name: 'GG Marmont Matelassé Shoulder Bag', price: 2800 },
      { id: 'g2', name: 'Princetown Leather Slipper', price: 1100 },
      { id: 'g3', name: 'Ophidia GG Medium Tote', price: 2100 },
      { id: 'g4', name: 'Gucci Dive Watch', price: 1850 }
    ]
  },
  {
    id: 10, name: "Rolex Boutique Sydney", cuisine: "Horology", rating: 5.0, deliveryTime: "Secure Escrow", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80", is24Hours: true,
    menu: [
      { id: 'rx1', name: 'Cosmograph Daytona (Platinum)', price: 125000 },
      { id: 'rx2', name: 'Submariner Date (White Gold)', price: 65000 },
      { id: 'rx3', name: 'Day-Date 40 (Rose Gold)', price: 58000 },
      { id: 'rx4', name: 'GMT-Master II (Meteorite Dial)', price: 85000 }
    ]
  }
];"""

match_rest = re.search(r'const RESTAURANTS = \[.*?\];', code, flags=re.DOTALL)
if match_rest:
    code = code[:match_rest.start()] + new_restaurants + code[match_rest.end():]
    with open("src/components/bank/UberEatsApp.tsx", "w") as f:
        f.write(code)
    print("Patched RESTAURANTS successfully.")
else:
    print("Could not find RESTAURANTS array.")

