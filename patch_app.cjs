const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// 1. Add new imports
const newImports = `
import { EnterpriseWikiTab } from "./EnterpriseWikiTab";
import { SovereignGatewaysTab } from "./SovereignGatewaysTab";
`;
content = content.replace('import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";', 'import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";' + newImports);

// 2. Add to Tab List at the top (removing duplicates and prioritizing high value)
const tabListMatch = content.match(/const TABS = \[([\s\S]*?)\]\.map/);
if (tabListMatch) {
    // We will just dynamically inject into the map via replace
}
const oldTabs = `          { id: "properties", label: "Real Estate", icon: Home },
          { id: "receipts", label: "Receipts & Invoices", icon: FileText },`;

const newTabs = `          { id: "wiki", label: "Enterprise Knowledge Base", icon: BookOpen },
          { id: "gateways", label: "Sovereign Gateways & ATM", icon: Network },
          { id: "properties", label: "Real Estate", icon: Home },
          { id: "receipts", label: "Receipts & Invoices", icon: FileText },`;
          
content = content.replace(oldTabs, newTabs);

// 3. Update Ternary statements to render the new tabs
const endTernary = `              </div>
            ) : activeTab === "entities" ? (`;

const newEndTernary = `              </div>
            ) : activeTab === "wiki" ? (
                <EnterpriseWikiTab />
            ) : activeTab === "gateways" ? (
                <SovereignGatewaysTab />
            ) : activeTab === "entities" ? (`;

content = content.replace(endTernary, newEndTernary);

// 4. Boost balances to multi-trillion logic
content = content.replace('AUD: 940000000.0, // $940 Million AUD', 'AUD: 2450000000000.0, // $2.45 Trillion AUD');
content = content.replace('initialBalances.AUD < 940000000', 'initialBalances.AUD < 2450000000000');
content = content.replace('initialBalances.AUD = 940000000.0;', 'initialBalances.AUD = 2450000000000.0;');

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("Patched successfully.");
