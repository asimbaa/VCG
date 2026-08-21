with open("src/components/bank/OrderTrackingDashboard.tsx", "r") as f:
    content = f.read()
    
# Replace lucide imports
content = content.replace(
    'import { Car, FileText, Home } from "lucide-react";',
    'import { Car, FileText, Home, Package, Clock, Truck, ShieldCheck } from "lucide-react";'
)

with open("src/components/bank/OrderTrackingDashboard.tsx", "w") as f:
    f.write(content)
