const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

if (!content.includes('QRCodeSVG')) {
  content = content.replace("import { motion, AnimatePresence } from \"framer-motion\";", "import { motion, AnimatePresence } from \"framer-motion\";\nimport { QRCodeSVG } from \"qrcode.react\";");
  fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
  console.log("QRCodeSVG imported.");
}
