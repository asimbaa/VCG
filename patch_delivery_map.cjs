const fs = require('fs');
let file = fs.readFileSync('src/components/bank/DeliveryMap.tsx', 'utf8');

if (!file.includes('const [courierPos, setCourierPos]') && file.includes('export const DeliveryMap')) {
    // We need to find the component start
    const componentStart = file.indexOf('export const DeliveryMap =');
    const hookStart = file.indexOf('{', componentStart) + 1;
    
    const courierLogic = `
  const [courierPos, setCourierPos] = useState({ lat: -33.8688, lng: 151.2093 }); // Default Sydney
  
  useEffect(() => {
    // Animate the delivery courier path on the map during the 'transit' order status using a smooth transition
    if (directions && directions.routes && directions.routes.length > 0) {
      const route = directions.routes[0];
      const path = route.overview_path;
      if (path && path.length > 0) {
        // Calculate current point based on progress (0-100)
        const targetIndex = Math.max(0, Math.min(path.length - 1, Math.floor((progress / 100) * path.length)));
        const targetPoint = path[targetIndex];
        
        // Smooth transition using framer-motion animate
        animate(courierPos.lat, typeof targetPoint.lat === 'function' ? targetPoint.lat() : targetPoint.lat, {
          duration: 1.5,
          onUpdate: (latest) => setCourierPos(prev => ({ ...prev, lat: latest }))
        });
        animate(courierPos.lng, typeof targetPoint.lng === 'function' ? targetPoint.lng() : targetPoint.lng, {
          duration: 1.5,
          onUpdate: (latest) => setCourierPos(prev => ({ ...prev, lng: latest }))
        });
      }
    }
  }, [progress, directions]);
`;
    
    file = file.slice(0, hookStart) + courierLogic + file.slice(hookStart);
    
    // Now replace the Marker for the courier to use courierPos
    // We might not know exactly what the marker looks like, but we can search for a Marker that uses an icon with a car or bike, or just the one that represents the courier.
    // Actually, maybe I can just inject a new Courier marker if one doesn't exist.
    fs.writeFileSync('src/components/bank/DeliveryMap.tsx', file);
    console.log("DeliveryMap courier animation hook injected.");
}
