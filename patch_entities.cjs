const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('import { PortfolioEntitiesTab }')) {
    content = content.replace('import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";', 'import { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";\nimport { PortfolioEntitiesTab } from "./PortfolioEntitiesTab";');
}

if (!content.includes('id: "entities"')) {
    content = content.replace('{ id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },', '{ id: "entities", label: "Global Entities & DUNS", icon: Building2 },\n          { id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },');
}

const endTernary = '              </div>\n            ) : activeTab === "swarm" ? (';
const newEndTernary = `              </div>
            ) : activeTab === "entities" ? (
                <PortfolioEntitiesTab />
            ) : activeTab === "swarm" ? (`;

if (content.includes(endTernary)) {
    content = content.replace(endTernary, newEndTernary);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
    console.log("Patched Entities successfully.");
} else {
    console.log("Could not patch Entities Tab ternary.");
}
