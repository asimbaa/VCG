import * as fs from 'fs';

// 1. CryptoPortfolio
let p1 = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf-8');
p1 = p1.replace("const [transferAsset, setTransferAsset] = useState('ETH');", "// deleted");
p1 = p1.replace("const [transferDestination, setTransferDestination] = useState('');", "// deleted");
p1 = p1.replace("const [transferAmount, setTransferAmount] = useState('');", "// deleted");
p1 = p1.replace("const [isProcessing, setIsProcessing] = useState(false);", "// deleted");
fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', p1);

// 2. EToroApp
let p2 = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');
if (!p2.includes('Globe')) p2 = p2.replace('import { CheckCircle2', 'import { Globe, BarChart2, LineChart, CheckCircle2');
fs.writeFileSync('src/components/bank/EToroApp.tsx', p2);

// 3. OrderTrackingDashboard
let p3 = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf-8');
p3 = p3.replace("const [showRerouteModal, setShowRerouteModal] = useState(false);", "// deleted");
p3 = p3.replace("const [newAddress, setNewAddress] = useState('');", "// deleted");
p3 = p3.replace("const handleReroute = () => {", "const handleReroute_DUP = () => {");
fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', p3);

// 4. SovereignStore
let p4 = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');
p4 = p4.replace("category: string;", "category: string;\n  tag?: string;");
fs.writeFileSync('src/components/bank/SovereignStore.tsx', p4);

// 5. UberApp
let p5 = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');
p5 = p5.replace(/destination\.lat/g, "(destination as any).lat");
p5 = p5.replace(/destination\.lng/g, "(destination as any).lng");
p5 = p5.replace(/setDropoff\(loc\)/g, "setDropoff(loc as any)");
fs.writeFileSync('src/components/bank/UberApp.tsx', p5);

// 6. ValourianDashboard
let p6 = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
p6 = p6.replace(/import { useGlobalCurrency/g, "// import { useGlobalCurrency");
p6 = p6.replace(/import { CurrencySelector/g, "// import { CurrencySelector");
p6 = p6.replace("const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();", "// deleted");
p6 = p6.replace("const exportTreasuryDataJSON = () => {", "const exportTreasuryDataJSON_DUP = () => {");
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', p6);

// 7. RapidPay
let p7 = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');
p7 = p7.replace("const [selectedCardView, setSelectedCardView] = useState<'front' | 'back'>('front');", "// deleted");
fs.writeFileSync('src/components/pay/RapidPay.tsx', p7);

