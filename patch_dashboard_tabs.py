import re

with open("src/components/bank/ValourianDashboard.tsx", "r") as f:
    content = f.read()

# 1. Clean up the sidebar tabs. Remove the individual app tabs and group them.
tabs_to_remove = [
    '{ id: "uber", label: "Uber", icon: Car },',
    '{ id: "telemetry", label: "Asset Telemetry", icon: Satellite },',
    '{ id: "ubereats", label: "Uber Eats", icon: Smartphone },',
    '{ id: "ordertracking", label: "Order Tracking", icon: MapPin },',
    '{ id: "skyscanner", label: "Skyscanner", icon: Globe },',
    '{ id: "etoro", label: "eToro", icon: TrendingUp },',
    '{ id: "commbank", label: "Valourian", icon: Landmark },',
    '{ id: "commsec", label: "CommSec", icon: TrendingUp },',
    '{ id: "nab", label: "NAB", icon: Landmark },',
    '{ id: "pgy", label: "PGY Pilot Energy", icon: Zap },',
    '{ id: "coinbase", label: "Coinbase", icon: Bitcoin },'
]

for tab in tabs_to_remove:
    content = content.replace(tab, "")

# Remove ReserveArbitrageWidget from portfolio tab to avoid duplication
content = content.replace("<ReserveArbitrageWidget />", "")

with open("src/components/bank/ValourianDashboard.tsx", "w") as f:
    f.write(content)
