import * as fs from 'fs';

// ValourianDashboard
let p6 = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');
p6 = p6.replace(/const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency\(\);/g, "");
p6 = p6.replace("const [searchQuery, setSearchQuery] = useState('');", "const { globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n  const [searchQuery, setSearchQuery] = useState('');");
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', p6);

