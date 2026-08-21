import * as fs from 'fs';

// ValourianDashboard
let p6 = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
const lines6 = p6.split('\n');
const res6 = [];
let count7 = 0;
for (let line of lines6) {
    if (line.includes("const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();")) {
        count7++; if (count7 > 1) continue;
    }
    res6.push(line);
}
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', res6.join('\n'));

