#!/bin/bash

# Define the new items to insert right after the first [
awk '
/const RESTAURANTS = \[/ {
  print $0;
  print "  {";
  print "    id: 991, name: \"Tesla Automotive (Sovereign Delivery)\", cuisine: \"Electric Vehicles & Autopilot Tech\", rating: 5.0, deliveryTime: \"Immediate Transport\", image: \"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80\", is24Hours: true,";
  print "    menu: [";
  print "      { id: \"tsla1\", name: \"Tesla Model S Plaid (Fully Loaded)\", price: 210000 },";
  print "      { id: \"tsla2\", name: \"Tesla Cybertruck Cyberbeast\", price: 160000 },";
  print "      { id: \"tsla3\", name: \"Tesla Model X Plaid\", price: 195000 }";
  print "    ]";
  print "  },";
  print "  {";
  print "    id: 992, name: \"Apple Flagship (Direct Dispatch)\", cuisine: \"Advanced Electronics\", rating: 5.0, deliveryTime: \"Express Drone\", image: \"https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80\", is24Hours: true,";
  print "    menu: [";
  print "      { id: \"aapl1\", name: \"MacBook Pro 16-inch (M3 Max, 128GB RAM, 8TB)\", price: 11500 },";
  print "      { id: \"aapl2\", name: \"Apple Vision Pro (1TB, Zeiss Inserts)\", price: 6500 },";
  print "      { id: \"aapl3\", name: \"iPhone 15 Pro Max (1TB) + Titanium Care\", price: 2900 }";
  print "    ]";
  print "  },";
  print "  {";
  print "    id: 993, name: \"Sovereign Gold & Bullion Vault\", cuisine: \"Precious Metals\", rating: 5.0, deliveryTime: \"Armored Guard Escort\", image: \"https://images.unsplash.com/photo-1610375461246-83ff852e5313?w=800&q=80\", is24Hours: true,";
  print "    menu: [";
  print "      { id: \"gld1\", name: \"1kg 99.99% Pure Gold Cast Bar (Perth Mint)\", price: 110000 },";
  print "      { id: \"gld2\", name: \"Valcambi Suisse 500g Gold Bar\", price: 55000 },";
  print "      { id: \"gld3\", name: \"Monster Box (500) 1oz Silver Coins\", price: 25000 }";
  print "    ]";
  print "  },";
  print "  {";
  print "    id: 994, name: \"Valourian Luxury Hotel Acquisitions\", cuisine: \"Hospitality Real Estate\", rating: 5.0, deliveryTime: \"Digital Transfer\", image: \"https://images.unsplash.com/photo-1542314831-c6a420828f42?w=800&q=80\", is24Hours: true,";
  print "    menu: [";
  print "      { id: \"htl1\", name: \"Four Seasons Sydney (Majority Share 51%)\", price: 450000000 },";
  print "      { id: \"htl2\", name: \"Park Hyatt Sydney (Title Transfer)\", price: 320000000 }";
  print "    ]";
  print "  },";
  print "  {";
  print "    id: 995, name: \"American Express VIP Delivery\", cuisine: \"Exclusive Financial Instruments\", rating: 4.9, deliveryTime: \"White Glove Escort\", image: \"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80\", is24Hours: true,";
  print "    menu: [";
  print "      { id: \"crd1\", name: \"Centurion Black Card (Initiation & Minting)\", price: 15000 },";
  print "      { id: \"crd2\", name: \"Valourian Master Line Card (Physical Delivery)\", price: 250000 }";
  print "    ]";
  print "  },";
  next;
}
{ print }
' src/components/bank/UberEatsApp.tsx > src/components/bank/UberEatsApp.tsx.tmp && mv src/components/bank/UberEatsApp.tsx.tmp src/components/bank/UberEatsApp.tsx
