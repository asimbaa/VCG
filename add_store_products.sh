#!/bin/bash
awk '
/const STORE_PRODUCTS: Product\[\] = \[/ {
  print $0;
  print "  { id: \"gl1\", name: \"Valcambi 1kg Gold Cast Bar\", brand: \"Valourian Reserve\", price: 110000, image: \"https://images.unsplash.com/photo-1610375461246-83ff852e5313?w=800&q=80\", tag: \"Commodities\", instantDelivery: false },";
  print "  { id: \"crypto1\", name: \"100 Bitcoin (BTC) Hardware Wallet\", brand: \"Valourian Crypto\", price: 9500000, image: \"https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80\", tag: \"Crypto\", instantDelivery: true },";
  print "  { id: \"share1\", name: \"10,000 Apple (AAPL) Common Stock Shares\", brand: \"Valourian Equities\", price: 1750000, image: \"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80\", tag: \"Equities\", instantDelivery: true },";
  print "  { id: \"card1\", name: \"Valourian Master Line Black Card (Physical)\", brand: \"Financial Services\", price: 250000, image: \"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80\", tag: \"Credit\", instantDelivery: false },";
  print "  { id: \"hotel1\", name: \"Four Seasons Sydney (Penthouse Annual Lease)\", brand: \"Valourian Estates\", price: 1200000, image: \"https://images.unsplash.com/photo-1542314831-c6a420828f42?w=800&q=80\", tag: \"Real Estate\", instantDelivery: false },";
  next;
}
{ print }
' src/components/bank/SovereignStore.tsx > src/components/bank/SovereignStore.tsx.tmp && mv src/components/bank/SovereignStore.tsx.tmp src/components/bank/SovereignStore.tsx
