import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# find lucide-react imports
if 'QrCode' not in content[:1000]:
    content = content.replace('} from "lucide-react";', '  QrCode, Settings, ShieldAlert, Activity, Smartphone, Plane, Server\n} from "lucide-react";')

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
print("Imports patched.")
