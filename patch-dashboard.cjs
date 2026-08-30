const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Add imports
if (!content.includes('import { PartnerNetworkTab }')) {
    content = content.replace('import { DeepSpaceTerminal }', 'import { DeepSpaceTerminal }\nimport { PartnerNetworkTab } from "./PartnerNetworkTab";\nimport { CommandCenterTab } from "./CommandCenterTab";');
}

// Ensure "terminal" and "gateway" tabs exist in the nav.
// Let's replace 'DeepSpaceTerminal' if we want, or just let them live.
// The user has `{ id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },`

// Let's find the `id: "terminal"` part and ensure `gateway` exists nearby.
if (!content.includes('id: "gateway"')) {
    content = content.replace('{ id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },', '{ id: "gateway", label: "Partner Network API", icon: Network },\n          { id: "terminal", label: "Alpha-Core Terminal", icon: Terminal },');
}

// Make sure Network is imported from lucide-react
if (!content.includes('Network,')) {
    content = content.replace('import {', 'import { Network,');
}

// Add ternary conditions for "terminal" and "gateway"
const endTernary = '              </div>\n            ) : activeTab === "vouchers" ? (';
const newEndTernary = `              </div>
            ) : activeTab === "terminal" ? (
                <CommandCenterTab />
            ) : activeTab === "gateway" ? (
                <PartnerNetworkTab />
            ) : activeTab === "vouchers" ? (`;

if (content.includes(endTernary)) {
    content = content.replace(endTernary, newEndTernary);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
    console.log("Patched successfully.");
} else {
    console.log("Could not find the ternary insertion point. Trying alternative...");
    
    // Fallback: search for concierge end
    const fallbackTernary = ') : activeTab === "concierge" ? (\n                <PurchaseConciergeTab />\n            ) : null}';
    const fallbackNewTernary = `) : activeTab === "concierge" ? (
                <PurchaseConciergeTab />
            ) : activeTab === "terminal" ? (
                <CommandCenterTab />
            ) : activeTab === "gateway" ? (
                <PartnerNetworkTab />
            ) : null}`;
            
    if (content.includes(fallbackTernary)) {
       content = content.replace(fallbackTernary, fallbackNewTernary);
       fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
       console.log("Patched successfully via fallback.");
    } else {
       console.log("Could not find fallback either!");
    }
}

