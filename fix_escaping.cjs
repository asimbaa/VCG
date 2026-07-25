const fs = require('fs');
let code = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf-8');
code = code.replace("animate={{ width: \\`\\${trackingData.progress}%\\` }}", "animate={{ width: `${trackingData.progress}%` }}");
fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', code);
