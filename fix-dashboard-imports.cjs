const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Fix DeepSpaceTerminal import
content = content.replace('import { DeepSpaceTerminal }\nimport { PartnerNetworkTab } from "./PartnerNetworkTab";\nimport { CommandCenterTab } from "./CommandCenterTab"; from "./DeepSpaceTerminal";', 
'import { DeepSpaceTerminal } from "./DeepSpaceTerminal";\nimport { PartnerNetworkTab } from "./PartnerNetworkTab";\nimport { CommandCenterTab } from "./CommandCenterTab";');

// Fix Network import in email utils
content = content.replace('import { Network, sendWorkspaceEmail', 'import { sendWorkspaceEmail');
// Add Network to lucide-react if not there
if (!content.includes('Network,')) {
    content = content.replace('FileJson, ShoppingCart,', 'FileJson, ShoppingCart, Network,');
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("Imports fixed");
