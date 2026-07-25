const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

const newStoreItems = `
  {
    id: "item-winter-pajamas",
    name: "Premium Winter Pajamas Set",
    brand: "Valourian Home",
    category: "Winter Wares",
    price: 180,
    image: "https://images.unsplash.com/photo-1620610931535-c324e94119d8?auto=format&fit=crop&q=80&w=800",
    specs: ["Organic Cotton", "Fleece Lined", "Thermal Retention"]
  },
  {
    id: "item-merino-shirt",
    name: "Merino Wool Long Sleeve Shirt",
    brand: "Valourian Essentials",
    category: "Outwear",
    price: 250,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    specs: ["100% Australian Merino Wool", "Breathable", "Odor Resistant"]
  },
  {
    id: "item-merino-trousers",
    name: "Merino Wool Trousers",
    brand: "Valourian Essentials",
    category: "Leisure Ware",
    price: 320,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
    specs: ["Tailored Fit", "Thermal Regulation", "Stretch Fabric"]
  },
  {
    id: "item-family-outfits",
    name: "Family Wardrobe Collection (Men, Women, Kids)",
    brand: "Valourian Collection",
    category: "Apparel",
    price: 1500,
    image: "https://images.unsplash.com/photo-1489987707023-afc67161e1bd?auto=format&fit=crop&q=80&w=800",
    specs: ["Complete Wardrobe Sets", "Boys & Girls Included", "Matching Winter Themes"]
  },
  {
    id: "item-thick-socks",
    name: "Thick Comfy Winter Socks (6-Pack)",
    brand: "Valourian Comfort",
    category: "Accessories",
    price: 85,
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=800",
    specs: ["Double Layered", "Heated Coils Compatible", "Extra Cushioning"]
  },
  {
    id: "item-comfort-shoes",
    name: "Premium Comfortable Shoes",
    brand: "Valourian Footwear",
    category: "Footwear",
    price: 450,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    specs: ["Orthopedic Support", "Memory Foam", "All-Weather Grip"]
  },
  {
    id: "item-home-essentials",
    name: "Home Essentials Master Kit",
    brand: "Valourian Home",
    category: "Home",
    price: 2200,
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
    specs: ["Smart Thermostats", "Premium Blankets", "Ambient Lighting"]
  },`;

content = content.replace('const STORE_PRODUCTS: Product[] = [', 'const STORE_PRODUCTS: Product[] = [' + newStoreItems);

fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
