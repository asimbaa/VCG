const fs = require('fs');
let code = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');
if (!code.includes('useGlobalCurrency')) {
  code = code.replace(
    /import React, \{ useState, useEffect \} from 'react';/,
    `import React, { useState, useEffect } from 'react';\nimport { useGlobalCurrency } from "../../contexts/CurrencyContext";\nimport { CurrencySelector } from "../ui/CurrencySelector";`
  );
  fs.writeFileSync('src/components/bank/BookingApp.tsx', code);
}
