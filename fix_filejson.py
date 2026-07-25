import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Fix the framer-motion import
content = content.replace('import { FileJson, motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";')
content = content.replace('import { FileJson, FileJson,', 'import { FileJson,')

# Add FileJson to lucide-react if not there
if "FileJson," not in content:
    content = content.replace('import {  Wallet', 'import { FileJson,  Wallet')

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)

