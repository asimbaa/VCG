import * as fs from 'fs';

// 1. CryptoPortfolio
let p1 = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf-8');
p1 = p1.replace(/const \[transferAsset, setTransferAsset\] = useState\('ETH'\);/g, "");
p1 = p1.replace(/const \[transferDestination, setTransferDestination\] = useState\(''\);/g, "");
p1 = p1.replace(/const \[transferAmount, setTransferAmount\] = useState\(''\);/g, "");
// Add back exactly one instance
p1 = p1.replace("const [isProcessing, setIsProcessing] = useState(false);", "const [transferAsset, setTransferAsset] = useState('ETH');\nconst [transferDestination, setTransferDestination] = useState('');\nconst [transferAmount, setTransferAmount] = useState('');\nconst [isProcessing, setIsProcessing] = useState(false);");
fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', p1);

// 2. EToroApp
let p2 = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');
p2 = "import { Globe, BarChart2, LineChart } from 'lucide-react';\n" + p2;
fs.writeFileSync('src/components/bank/EToroApp.tsx', p2);

// 3. OrderTrackingDashboard
let p3 = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf-8');
p3 = p3.replace(/const \[newAddress, setNewAddress\] = useState\(''\);/g, "");
p3 = p3.replace("const [showRerouteModal, setShowRerouteModal] = useState(false);", "const [newAddress, setNewAddress] = useState('');\nconst [showRerouteModal, setShowRerouteModal] = useState(false);");
fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', p3);

// 4. SovereignStore
let p4 = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');
p4 = p4.replace("category: string;", "category?: string;");
fs.writeFileSync('src/components/bank/SovereignStore.tsx', p4);

// 5. UberApp
let p5 = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');
p5 = p5.replace(/destination\.lat/g, "(destination as any).lat");
p5 = p5.replace(/destination\.lng/g, "(destination as any).lng");
fs.writeFileSync('src/components/bank/UberApp.tsx', p5);

// 6. ValourianDashboard
let p6 = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
p6 = p6.replace(/\/\/ import { useGlobalCurrency/g, "import { useGlobalCurrency");
p6 = p6.replace(/\/\/ import { CurrencySelector/g, "import { CurrencySelector");
p6 = p6.replace(/const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency\(\);/g, "");
p6 = p6.replace("const [searchQuery, setSearchQuery] = useState('');", "const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\nconst [searchQuery, setSearchQuery] = useState('');");
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', p6);

// 7. RapidPay
let p7 = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');
p7 = p7.replace(/const \[selectedCardView, setSelectedCardView\] = useState<'front' \| 'back'>\('front'\);/g, "");
p7 = p7.replace("const [showNFCModal, setShowNFCModal] = useState(false);", "const [selectedCardView, setSelectedCardView] = useState<'front' | 'back'>('front');\nconst [showNFCModal, setShowNFCModal] = useState(false);");
fs.writeFileSync('src/components/pay/RapidPay.tsx', p7);

