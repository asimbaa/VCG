const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');

if (!code.includes('useGlobalCurrency')) {
  code = code.replace(
    'import { motion, AnimatePresence } from \'framer-motion\';',
    'import { motion, AnimatePresence } from \'framer-motion\';\nimport { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";'
  );

  code = code.replace(
    'export function UberApp() {',
    'export function UberApp() {\n  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n'
  );

  code = code.replace(
    '<h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">',
    '<div className="flex items-center gap-4"><h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">'
  );
  
  code = code.replace(
    'Uber</h1>',
    'Uber</h1><CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} /></div>'
  );
  
  // replace exact AUD ${...toFixed(2)} usages
  code = code.replace(/AUD \$\{(.*?)\.toFixed\(2\)\}/g, '${formatConverted($1)}');
  code = code.replace(/Est: \$\{(.*?)\.toFixed\(2\)\}/g, 'Est: ${formatConverted($1)}');
  code = code.replace(/\$\{(.*?)\.toFixed\(2\)\}/g, '${formatConverted($1)}');

  fs.writeFileSync('src/components/bank/UberApp.tsx', code);
}
