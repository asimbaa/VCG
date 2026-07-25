import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Add missing import
content = content.replace("import { TrendingUp, ArrowRightLeft, DollarSign, Activity, Wallet, Search, BarChart2, ShieldCheck, Zap, Bitcoin, LineChart, Globe, ArrowUpRight, ArrowDownRight } from \"lucide-react\";", "import { TrendingUp, ArrowRightLeft, DollarSign, Activity, Wallet, Search, BarChart2, ShieldCheck, Zap, Bitcoin, LineChart, Globe, ArrowUpRight, ArrowDownRight, Bot } from \"lucide-react\";")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
