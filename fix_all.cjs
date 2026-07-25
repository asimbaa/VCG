const fs = require('fs');

function fixApp(file, exportStr) {
  let code = fs.readFileSync(file, 'utf-8');
  
  if (!code.includes('useGlobalCurrency')) {
    code = code.replace(
      'import { motion',
      'import { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";\nimport { motion'
    );
  }
  
  // Try to insert the hook just after the export function line
  // Use regex to find the start of the function body
  const exportRegex = new RegExp(`(export function ${exportStr}\\s*\\([^)]*\\)\\s*(?::\\s*[^\\{]+\\s*)?\\{\\n?)`);
  
  if (!code.includes('useGlobalCurrency()')) {
    code = code.replace(exportRegex, `$1  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n`);
  }
  
  fs.writeFileSync(file, code);
}

fixApp('src/components/bank/BookingApp.tsx', 'BookingApp');
fixApp('src/components/bank/SovereignStore.tsx', 'SovereignStore');
fixApp('src/components/bank/UberApp.tsx', 'UberApp');
fixApp('src/components/bank/UberEatsApp.tsx', 'UberEatsApp');
// RapidPay is in pay folder
let rpCode = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');
if (!rpCode.includes('useGlobalCurrency()')) {
    const exportRegex = new RegExp(`(export function RapidPay\\s*\\([^)]*\\)\\s*(?::\\s*[^\\{]+\\s*)?\\{\\n?)`);
    rpCode = rpCode.replace(exportRegex, `$1  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();\n`);
    fs.writeFileSync('src/components/pay/RapidPay.tsx', rpCode);
}


