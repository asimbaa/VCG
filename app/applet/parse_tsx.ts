import fs from 'fs';
import * as babel from '@babel/core';
const code = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf-8');
const parseOptions = {
    presets: ['@babel/preset-typescript', ['@babel/preset-react', {runtime: 'automatic'}]],
    filename: 'BankDashboard.tsx'
};

try {
    babel.parseSync(code, parseOptions);
    console.log("No syntax errors found!");
} catch (e: any) {
    console.error(e.message);
}
