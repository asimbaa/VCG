import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# 1. Import useGlobalCurrency and CurrencySelector
imports_block = """import { useGlobalCurrency } from "../../contexts/CurrencyContext";
import { CurrencySelector } from "../ui/CurrencySelector";
"""
content = re.sub(r'import \{ useEffect, useRef \} from "react";', imports_block + 'import { useEffect, useRef } from "react";', content)

# 2. Add hook usage inside ValourianDashboard
hook_usage = """export function ValourianDashboard({ user }: { user: any }) {
  const { currency: globalCur, setCurrency, formatConverted, supportedCurrencies } = useGlobalCurrency();
"""
content = content.replace("export function ValourianDashboard({ user }: { user: any }) {", hook_usage)

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
