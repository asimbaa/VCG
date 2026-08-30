const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { SovereignLogisticsTab } from "./SovereignLogisticsTab";')) {
  content = content.replace(
    'import { GlobalTreasuryTab } from "./GlobalTreasuryTab";',
    'import { GlobalTreasuryTab } from "./GlobalTreasuryTab";\nimport { SovereignLogisticsTab } from "./SovereignLogisticsTab";'
  );
}

// Ensure the render block points "dispatch" and "aura" to SovereignLogisticsTab
if (!content.includes('activeTab === "dispatch" || activeTab === "aura" ? (\\n              <SovereignLogisticsTab />')) {
  content = content.replace(
    'activeTab === "dispatch" ? (',
    'activeTab === "dispatch" || activeTab === "aura" ? (\n              <SovereignLogisticsTab />\n            ) : false ? ('
  );
  
  content = content.replace(
    'activeTab === "aura" ? (',
    'false ? ('
  );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
