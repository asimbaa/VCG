const fs = require('fs');
let code = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf-8');

if (!code.includes('useGlobalCurrency')) {
  code = code.replace(
    'import { motion, AnimatePresence } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";\nimport { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";'
  );

  code = code.replace(
    'export function SovereignStore() {',
    'export function SovereignStore() {\n  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n'
  );

  code = code.replace(
    '<h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">',
    '<div className="flex items-center gap-4"><h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">'
  );
  
  code = code.replace(
    'Valourian Hardware Store</h2>',
    'Valourian Hardware Store</h2><CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} /></div>'
  );
  
  // Custom manual replacements for SovereignStore
  code = code.replace(/AUD \$\{(.*?)\.toLocaleString\(\)\}/g, '${formatConverted($1)}');
  code = code.replace(/>\$\{(.*?)\.toLocaleString\(\)\}/g, '>{formatConverted($1)}');
  code = code.replace(/>AUD \$\{(.*?)\}/g, '>{formatConverted($1)}');
  code = code.replace(/`AUD \$\{(.*?)\}`/g, '`${formatConverted($1)}`');

  fs.writeFileSync('src/components/bank/SovereignStore.tsx', code);
}
