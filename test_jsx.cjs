const fs = require('fs');
const babel = require('@babel/core');

try {
  const code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');
  babel.transformSync(code, {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    filename: 'ValourianDashboard.tsx'
  });
  console.log("Syntax OK.");
} catch (e) {
  console.log(e.message);
}
