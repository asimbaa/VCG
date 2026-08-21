const fs = require('fs');
let file = fs.readFileSync('src/components/bank/CryptoPortfolio.tsx', 'utf8');

file = file.replace('import { Zap,  motion } from "framer-motion";', 'import { motion } from "framer-motion";');

if (!file.includes('import { Zap')) {
    file = file.replace('import { Bitcoin,', 'import { Bitcoin, Zap,');
}

fs.writeFileSync('src/components/bank/CryptoPortfolio.tsx', file);
