const fs = require('fs');
const content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const target1 = '{ id: "ubereats", label: "Uber Eats", icon: ShoppingBag },\n          { id: "store", label: "Apple Store", icon: ShoppingBag },';
const replacement1 = '{ id: "ubereats", label: "Uber Eats", icon: ShoppingBag },\n          { id: "store", label: "Apple Store", icon: ShoppingBag },\n          { id: "vouchers", label: "Vouchers & Print", icon: Printer },\n          { id: "concierge", label: "Purchase Concierge", icon: ShoppingCart },';

if(content.includes(target1)) {
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content.replace(target1, replacement1));
    console.log("Replaced navigation tabs successfully.");
} else {
    console.log("Could not find target1");
}
