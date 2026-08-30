const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { SwarmIntelligenceTab }')) {
    content = content.replace('import { CommandCenterTab } from "./CommandCenterTab";', 'import { CommandCenterTab } from "./CommandCenterTab";\nimport { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";');
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
