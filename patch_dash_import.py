import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# Make sure Bot is imported
content = content.replace("import { CreditCard, ArrowRightLeft, Clock, Search, Wallet, PieChart, Activity, DollarSign, Building2, Globe, TrendingUp, Filter, ShieldCheck, Zap, MoreHorizontal, ArrowUpRight, Copy, Terminal, Mail, FileText, ChevronRight, Settings, ShoppingBag, Banknote, Landmark, Smartphone, Plane, Utensils, Bitcoin, MapPin } from \"lucide-react\";", "import { CreditCard, ArrowRightLeft, Clock, Search, Wallet, PieChart, Activity, DollarSign, Building2, Globe, TrendingUp, Filter, ShieldCheck, Zap, MoreHorizontal, ArrowUpRight, Copy, Terminal, Mail, FileText, ChevronRight, Settings, ShoppingBag, Banknote, Landmark, Smartphone, Plane, Utensils, Bitcoin, MapPin, Bot } from \"lucide-react\";")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
