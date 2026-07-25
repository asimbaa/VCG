const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf-8');

if (!code.includes('useGlobalCurrency')) {
  code = code.replace(
    'import { motion, AnimatePresence } from \'framer-motion\';',
    'import { motion, AnimatePresence } from \'framer-motion\';\nimport { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";'
  );

  code = code.replace(
    'export function UberEatsApp() {',
    'export function UberEatsApp() {\n  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n'
  );

  code = code.replace(
    '<h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">',
    '<div className="flex items-center gap-4"><h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">'
  );
  
  code = code.replace(
    'Uber Eats</h1>',
    'Uber Eats</h1><CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} /></div>'
  );
  
  // Custom manual replacements for UberEats
  code = code.replace(/AUD \$\{(.*?)\.toFixed\(2\)\}/g, '${formatConverted($1)}');
  code = code.replace(/>\$\{(.*?)\.toFixed\(2\)\}/g, '>{formatConverted($1)}');

  fs.writeFileSync('src/components/bank/UberEatsApp.tsx', code);
}
