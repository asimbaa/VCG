const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Add the icons we need at the top if they aren't there
if (!content.includes('Printer,')) {
    content = content.replace('import {', 'import { Printer, ShoppingCart, ');
}

const target1 = '{ id: "ubereats", label: "Uber Eats", icon: ShoppingBag },\n          { id: "store", label: "Apple Store", icon: ShoppingBag },';
const replacement1 = '{ id: "ubereats", label: "Uber Eats", icon: ShoppingBag },\n          { id: "store", label: "Apple Store", icon: ShoppingBag },\n          { id: "vouchers", label: "Vouchers & Print", icon: Printer },\n          { id: "concierge", label: "Purchase Concierge", icon: ShoppingCart },';

if(content.includes(target1)) {
    content = content.replace(target1, replacement1);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
    console.log("Replaced navigation tabs successfully.");
} else {
    console.log("Could not find target1");
}
