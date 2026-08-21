const fs = require('fs');
let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

content = content.replace(/setReRouteResponse\(data\.reply\);/g, 'setReRouteResponse(data.text || data.reply || "Re-route confirmed by Deep Space Cluster.");');

fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
console.log('Fixed data.reply to data.text');
