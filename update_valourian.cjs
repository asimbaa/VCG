const fs = require('fs');

let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf-8');

// Add import
if (!code.includes('OrderTrackingDashboard')) {
  code = code.replace(
    'import { UberEatsApp } from "./UberEatsApp";',
    'import { UberEatsApp } from "./UberEatsApp";\nimport { OrderTrackingDashboard } from "./OrderTrackingDashboard";'
  );
}

// Add tab
code = code.replace(
  '{ id: "ubereats", label: "Uber Eats", icon: Smartphone },',
  '{ id: "ubereats", label: "Uber Eats", icon: Smartphone },\n          { id: "ordertracking", label: "Order Tracking", icon: MapPin },'
);

// Render component
code = code.replace(
  ') : activeTab === ("ubereats" as any) ? (',
  ') : activeTab === ("ordertracking" as any) ? (\n              <OrderTrackingDashboard />\n            ) : activeTab === ("ubereats" as any) ? ('
);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
