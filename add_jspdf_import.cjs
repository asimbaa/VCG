const fs = require('fs');
const file = 'src/components/bank/UberEatsApp.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { jsPDF }')) {
  code = code.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport { jsPDF } from "jspdf";');
  fs.writeFileSync(file, code);
}
