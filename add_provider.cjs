const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

if (!code.includes('CurrencyProvider')) {
  code = code.replace(
    'import App from \'./App.tsx\'',
    'import App from \'./App.tsx\'\nimport { CurrencyProvider } from \'./contexts/CurrencyContext\';'
  );

  code = code.replace(
    '<App />',
    '<CurrencyProvider><App /></CurrencyProvider>'
  );

  fs.writeFileSync('src/main.tsx', code);
}
