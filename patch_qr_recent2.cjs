const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

const oldRapidPay = `export function RapidPay({ user }: { user: any }) {
  const { currency: globalCur`;
const newRapidPay = `export function RapidPay({ user }: { user: any }) {
  const [recentScans, setRecentScans] = useState<{data: string, type: string, timestamp: Date}[]>([]);
  const { currency: globalCur`;

if (!content.includes('const [recentScans, setRecentScans] = useState')) {
    content = content.replace(oldRapidPay, newRapidPay);
}

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
