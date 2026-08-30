const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { GlobalTreasuryTab } from "./GlobalTreasuryTab";')) {
  content = content.replace(
    'import { SovereignGatewaysTab } from "./SovereignGatewaysTab";',
    'import { SovereignGatewaysTab } from "./SovereignGatewaysTab";\nimport { GlobalTreasuryTab } from "./GlobalTreasuryTab";'
  );
}

if (!content.includes('{ id: "treasury", label: "Global Treasury", icon: Globe }')) {
  content = content.replace(
    '{ id: "portfolio", label: "Enterprise Portfolio", icon: Workflow },',
    '{ id: "treasury", label: "Global Treasury", icon: Globe },\n          { id: "portfolio", label: "Enterprise Portfolio", icon: Workflow },'
  );
}

if (!content.includes('activeTab === "treasury" ? (')) {
  content = content.replace(
    'activeTab === "portfolio" ? (',
    'activeTab === "treasury" ? (\n              <GlobalTreasuryTab />\n            ) : activeTab === "portfolio" ? ('
  );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
