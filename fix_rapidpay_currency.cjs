const fs = require('fs');
let code = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

if (!code.includes('useGlobalCurrency')) {
  code = code.replace(
    'import { motion, AnimatePresence } from "framer-motion";',
    'import { motion, AnimatePresence } from "framer-motion";\nimport { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";'
  );

  code = code.replace(
    'export function RapidPay() {',
    'export function RapidPay() {\n  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n'
  );

  code = code.replace(
    '<h1 className="text-3xl font-black text-white tracking-tighter">Valourian RapidPay</h1>',
    '<div className="flex items-center gap-4"><h1 className="text-3xl font-black text-white tracking-tighter">Valourian RapidPay</h1><CurrencySelector currency={globalCur} onChange={setCurrency} supportedCurrencies={supportedCurrencies} /></div>'
  );
  
  // Replace AUD strings. In RapidPay there's things like `AUD $${...}`
  code = code.replace(/AUD \$\{(.*?)\.toLocaleString\(\)\}/g, '${formatConverted($1)}');
  code = code.replace(/>\$\{(.*?)\.toLocaleString\([^)]*\)\}/g, '>{formatConverted($1)}');
  code = code.replace(/`AUD \$\{(.*?)\}`/g, '`${formatConverted($1)}`');

  fs.writeFileSync('src/components/pay/RapidPay.tsx', code);
}
