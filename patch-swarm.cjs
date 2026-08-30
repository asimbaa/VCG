const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Add import
if (!content.includes('import { SwarmIntelligenceTab }')) {
    content = content.replace('import { CommandCenterTab } from "./CommandCenterTab";', 'import { CommandCenterTab } from "./CommandCenterTab";\nimport { SwarmIntelligenceTab } from "./SwarmIntelligenceTab";');
}

// Ensure BrainCircuit is in lucide-react imports
if (!content.includes('BrainCircuit,')) {
    content = content.replace('import {  FileJson,', 'import { BrainCircuit, FileJson,');
}

// Add to nav tabs
if (!content.includes('id: "swarm"')) {
    content = content.replace('{ id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },', '{ id: "swarm", label: "Swarm AI Core", icon: BrainCircuit },\n          { id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },');
}

// Add ternary
const endTernary = '              </div>\n            ) : activeTab === "vouchers" ? (';
const newEndTernary = `              </div>
            ) : activeTab === "swarm" ? (
                <SwarmIntelligenceTab />
            ) : activeTab === "vouchers" ? (`;

if (content.includes(endTernary)) {
    content = content.replace(endTernary, newEndTernary);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
    console.log("Patched Swarm successfully.");
} else {
    console.log("Could not patch Swarm Tab ternary.");
}

