import re

with open('src/components/bank/ValourianDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { LiquidityNettingWidget } from "./LiquidityNettingWidget";', 'import { LiquidityNettingWidget } from "./LiquidityNettingWidget";\nimport { ValourianStrategicMoat } from "./ValourianStrategicMoat";')

content = content.replace('<LiquidityNettingWidget />', '<LiquidityNettingWidget />\n                      <ValourianStrategicMoat />')

with open('src/components/bank/ValourianDashboard.tsx', 'w') as f:
    f.write(content)
