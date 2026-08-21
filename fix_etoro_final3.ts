import * as fs from 'fs';
let content = fs.readFileSync('src/components/bank/EToroApp.tsx', 'utf-8');

// 1. Fix activeTab state type
content = content.replace("const [activeTab, setActiveTab] = useState('portfolio');", "const [activeTab, setActiveTab] = useState<string>('portfolio');");

// 2. Add 'motion' import
if (!content.includes('import { motion }')) {
  content = content.replace('import { useAuth', "import { motion } from 'framer-motion';\nimport { useAuth");
}

fs.writeFileSync('src/components/bank/EToroApp.tsx', content);
