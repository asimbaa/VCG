const fs = require('fs');
let file = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// 1. Add import
if (!file.includes('SovereignDispatchMonitor')) {
    file = file.replace(
        'import { SovereignStore } from "./SovereignStore";', 
        'import { SovereignStore } from "./SovereignStore";\nimport { SovereignDispatchMonitor } from "./SovereignDispatchMonitor";'
    );
}

// 2. Add Tab
if (!file.includes('id: "dispatch"')) {
    file = file.replace(
        '{ id: "store", label: "Apple Store", icon: ShoppingBag },',
        '{ id: "store", label: "Apple Store", icon: ShoppingBag },\n          { id: "dispatch", label: "Sovereign Dispatch", icon: Truck },'
    );
}

// 3. Import Truck if not exists
if (!file.includes('Truck,')) {
    file = file.replace(
        /import \{(.*?)\} from "lucide-react";/,
        'import { Truck, $1 } from "lucide-react";'
    );
}

// 4. Render Component
const renderBlock = `
            ) : activeTab === ("dispatch" as any) ? (
              <SovereignDispatchMonitor />
`;

if (!file.includes('activeTab === ("dispatch"')) {
    file = file.replace(
        ') : activeTab === ("store" as any) ? (', 
        renderBlock + '            ) : activeTab === ("store" as any) ? ('
    );
}

// 5. Title icons
const iconBlock = `                  ) : activeTab === ("dispatch" as any) ? (
                    <Truck className="w-5 h-5 text-blue-600" />
`;

if (!file.includes('activeTab === ("dispatch" as any) ? (\n                    <Truck')) {
     file = file.replace(
        ') : activeTab === ("store" as any) ? (', 
        iconBlock + '                  ) : activeTab === ("store" as any) ? ('
    );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', file);
console.log("Dashboard patched.");
