import re

with open('src/components/bank/BankDashboard.tsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { SovereignLogisticsDashboard } from './SovereignLogisticsDashboard';\n"
if "SovereignLogisticsDashboard" not in content:
    content = content.replace('import { DeliveryMap } from "./DeliveryMap";', 'import { DeliveryMap } from "./DeliveryMap";\n' + import_stmt)

# Insert component
insert_target = """                {/* Tracking & Route Config Core Container */}"""
if "<SovereignLogisticsDashboard />" not in content:
    content = content.replace(insert_target, "                <div className=\"mb-8\">\n                  <SovereignLogisticsDashboard />\n                </div>\n" + insert_target)

with open('src/components/bank/BankDashboard.tsx', 'w') as f:
    f.write(content)
