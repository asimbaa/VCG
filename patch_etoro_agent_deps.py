import re

with open("src/components/bank/EToroApp.tsx", "r") as f:
    content = f.read()

# Make sure Zap is imported
content = content.replace("import { Search, Building2, TrendingUp, TrendingDown, DollarSign, Activity, PieChart, Star, MoreHorizontal, ArrowUpRight, ArrowDownRight, Globe, Lock, Shield, ArrowRightLeft, CreditCard } from \"lucide-react\";", "import { Search, Building2, TrendingUp, TrendingDown, DollarSign, Activity, PieChart, Star, MoreHorizontal, ArrowUpRight, ArrowDownRight, Globe, Lock, Shield, ArrowRightLeft, CreditCard, Zap } from \"lucide-react\";")

with open("src/components/bank/EToroApp.tsx", "w") as f:
    f.write(content)
