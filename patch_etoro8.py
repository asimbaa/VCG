import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Fix duplicates
content = content.replace("import { TrendingUp, ArrowRightLeft, DollarSign, Activity, Wallet, Search, BarChart2, ShieldCheck, Zap } from \"lucide-react\";\nimport { motion, AnimatePresence } from \"framer-motion\";\nconst useAuth = () => ({ user: { uid: 'mock-user-123' } });\nimport { db } from \"../../firebase\";\nimport { doc, getDoc, updateDoc, setDoc } from \"firebase/firestore\";\nimport { toast } from \"sonner\";\nimport { Bitcoin, LineChart, Globe, DollarSign, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';", "import { TrendingUp, ArrowRightLeft, DollarSign, Activity, Wallet, Search, BarChart2, ShieldCheck, Zap, Bitcoin, LineChart, Globe, ArrowUpRight, ArrowDownRight } from \"lucide-react\";\nimport { motion, AnimatePresence } from \"framer-motion\";\nconst useAuth = () => ({ user: { uid: 'mock-user-123' } });\nimport { db } from \"../../firebase\";\nimport { doc, getDoc, updateDoc, setDoc } from \"firebase/firestore\";\nimport { toast } from \"sonner\";")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
