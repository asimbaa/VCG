import re

with open("src/components/bank/ValourianStrategicAssets.tsx", "r") as f:
    content = f.read()

import_statement = 'import { Search, Filter, Activity, MapPin, Globe, CreditCard, ShieldCheck, Zap, Database, Server, Smartphone, Car, Plane, TrendingUp, Landmark } from "lucide-react";\nimport { ValourianStrategicMoat } from "./ValourianStrategicMoat";\n'
content = re.sub(r'import \{.*?\} from "lucide-react";', import_statement, content)

moat_placement = """          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">"""
new_moat_placement = """          
          {/* Unifying the Strategic Moat capabilities right here above the assets */}
          <div className="mb-12">
             <ValourianStrategicMoat />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">"""

content = content.replace(moat_placement, new_moat_placement)

with open("src/components/bank/ValourianStrategicAssets.tsx", "w") as f:
    f.write(content)
