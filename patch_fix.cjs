const fs = require('fs');

// Fix UberEatsApp.tsx
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');
content = content.replace('cartTotal + deliveryFee + serviceFee', 'cartTotal');
fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);

// Fix ValourianDashboard.tsx
let valourian = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
if (!valourian.includes('BookOpen')) {
  valourian = valourian.replace('import { Home, FileText, History, ShieldCheck, Bot, Network, Terminal, Mail, Smartphone, Building2, Car, ShoppingBag, Printer, ShoppingCart, Truck } from "lucide-react";', 'import { Home, FileText, History, ShieldCheck, Bot, Network, Terminal, Mail, Smartphone, Building2, Car, ShoppingBag, Printer, ShoppingCart, Truck, BookOpen } from "lucide-react";');
}
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', valourian);
