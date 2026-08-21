const fs = require('fs');

let content = fs.readFileSync('src/components/logistics/LogisticsDashboard.tsx', 'utf8');

// Also update it so the keys show Deep Space Computing cluster if re-routed
const reroutedLogic = `  const keysDelivery = [
    { id: 'KEY-732', address: '14 High St, Sydney', status: 'In Transit', provider: 'Starshipit / Auspost', trackingId: 'AUSPOST-991204', eta: 'Tomorrow, 2:00 PM' },
    { id: 'KEY-881', address: '88 Valourian Ave, Melbourne', status: 'Delivered', provider: 'UPS', trackingId: '1Z9999999999999999', eta: 'Delivered' },
  ];`;
  
const dynamicLogic = `  const [keysDelivery, setKeysDelivery] = useState([
    { id: 'KEY-732', address: '14 High St, Sydney', status: 'In Transit', provider: 'Starshipit / Auspost', trackingId: 'AUSPOST-991204', eta: 'Tomorrow, 2:00 PM' },
    { id: 'KEY-881', address: '88 Valourian Ave, Melbourne', status: 'Delivered', provider: 'UPS', trackingId: '1Z9999999999999999', eta: 'Delivered' },
  ]);`;
  
content = content.replace(reroutedLogic, dynamicLogic);

const handlerUpdate = `      const data = await res.json();
      setReRouteResponse(data.text || data.reply || "Re-route confirmed by Deep Space Cluster.");
      
      // Optically update the dashboard arrays
      if (activeTab === 'keys') {
         setKeysDelivery(prev => prev.map(k => k.id === reRouteItem.id ? {...k, address: newAddress, status: 'Re-Routing', provider: 'Deep Space Logistics'} : k));
      } else {
         setDynamicItems(prev => prev.map(i => i.id === reRouteItem.id ? {...i, address: newAddress, status: 'Re-Routing', provider: 'Deep Space Logistics'} : i));
      }
      
      toast.success(\`Re-route confirmed by Deep Space Computing Cluster for \${reRouteItem.trackingId}\`);`;

content = content.replace(/      const data = await res\.json\(\);\n      setReRouteResponse\(data\.text \|\| data\.reply \|\| "Re-route confirmed by Deep Space Cluster\."\);\n      toast\.success\(\`Re-route confirmed by Deep Space Computing Cluster for \$\{reRouteItem\.trackingId\}\`\);/, handlerUpdate);

fs.writeFileSync('src/components/logistics/LogisticsDashboard.tsx', content);
console.log('UI feedback updated for DSCC re-route.');
