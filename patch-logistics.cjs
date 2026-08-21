const fs = require('fs');
let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

if (!content.includes('D3MapRoutes')) {
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport D3MapRoutes from './D3MapRoutes';");
    content = content.replace("<div className=\"p-6 max-w-7xl mx-auto\">", "<div className=\"p-6 max-w-7xl mx-auto\">\n      <D3MapRoutes />\n");
    fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
    console.log("Patched LogisticsDashboard with D3MapRoutes");
}
