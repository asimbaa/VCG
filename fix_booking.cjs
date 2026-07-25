const fs = require('fs');
let code = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');
if (!code.includes('import { useGlobalCurrency }')) {
  code = code.replace(
    /import \{ motion/g,
    'import { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";\nimport { motion'
  );
}
fs.writeFileSync('src/components/bank/BookingApp.tsx', code);
