const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const endTernary = '              </div>\n            ) : activeTab === "terminal" ? (';
const newEndTernary = `              </div>
            ) : activeTab === "swarm" ? (
                <SwarmIntelligenceTab />
            ) : activeTab === "terminal" ? (`;

if (content.includes(endTernary)) {
    content = content.replace(endTernary, newEndTernary);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
    console.log("Patched Swarm successfully.");
} else {
    console.log("Could not patch Swarm Tab ternary.");
}
