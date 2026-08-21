import * as fs from 'fs';

// 1. CryptoPortfolio
let p1 = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf-8');
const lines1 = p1.split('\n');
const res1 = [];
let count1 = 0, count2 = 0, count3 = 0;
for (let line of lines1) {
    if (line.includes("const [transferAsset, setTransferAsset] = useState")) {
        count1++; if (count1 > 1) continue;
    }
    if (line.includes("const [transferDestination, setTransferDestination] = useState")) {
        count2++; if (count2 > 1) continue;
    }
    if (line.includes("const [transferAmount, setTransferAmount] = useState")) {
        count3++; if (count3 > 1) continue;
    }
    res1.push(line);
}
fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', res1.join('\n'));

// 2. OrderTrackingDashboard
let p3 = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf-8');
const lines3 = p3.split('\n');
const res3 = [];
let count4 = 0;
for (let line of lines3) {
    if (line.includes("const [newAddress, setNewAddress] = useState")) {
        count4++; if (count4 > 1) continue;
    }
    res3.push(line);
}
fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', res3.join('\n'));

// 3. UberApp
let p5 = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');
p5 = p5.replace(/destination\.lat/g, "(destination as any).lat");
p5 = p5.replace(/destination\.lng/g, "(destination as any).lng");
p5 = p5.replace(/setDropoff\(loc\)/g, "setDropoff(loc as any)");
fs.writeFileSync('src/components/bank/UberApp.tsx', p5);

// 4. ValourianDashboard
let p6 = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
const lines6 = p6.split('\n');
const res6 = [];
let count5 = 0, count6 = 0, count7 = 0;
for (let line of lines6) {
    if (line.includes("import { useGlobalCurrency")) {
        count5++; if (count5 > 1) continue;
    }
    if (line.includes("import { CurrencySelector")) {
        count6++; if (count6 > 1) continue;
    }
    if (line.includes("const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();")) {
        count7++; if (count7 > 1) continue;
    }
    res6.push(line);
}
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', res6.join('\n'));

// 5. RapidPay
let p7 = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');
const lines7 = p7.split('\n');
const res7 = [];
let count8 = 0;
for (let line of lines7) {
    if (line.includes("const [selectedCardView, setSelectedCardView] = useState")) {
        count8++; if (count8 > 1) continue;
    }
    res7.push(line);
}
fs.writeFileSync('src/components/pay/RapidPay.tsx', res7.join('\n'));

