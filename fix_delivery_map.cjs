const fs = require('fs');
let file = fs.readFileSync('src/components/bank/DeliveryMap.tsx', 'utf8');

const targetLogic = `
    setTelemetry((prev) => {
      // Smooth transition using Framer Motion animate
      if (latitude !== undefined && longitude !== undefined) {
        animate(prev.lat || latitude, latitude, {
          duration: 1.2,
          ease: "linear",
          onUpdate: (val) => setTelemetry(t => ({ ...t, lat: val }))
        });
        animate(prev.lng || longitude, longitude, {
          duration: 1.2,
          ease: "linear",
          onUpdate: (val) => setTelemetry(t => ({ ...t, lng: val }))
        });
      }

      return {
        lat: prev.lat, 
        lng: prev.lng, 
        heading: headingVal || (latitude ? 12 : 0), 
        speed: currentSpeed,
        distanceRem: distanceRem
      };
    });
`;

file = file.replace(/setTelemetry\(\(prev\) => \(\{\n\s*lat: latitude !== undefined \? latitude : prev.lat,\n\s*lng: longitude !== undefined \? longitude : prev.lng,\n\s*heading: headingVal \|\| \(latitude \? 12 : 0\), \n\s*speed: currentSpeed,\n\s*distanceRem: distanceRem\n\s*\}\)\);/g, 
  targetLogic
);

fs.writeFileSync('src/components/bank/DeliveryMap.tsx', file);
console.log("Telemetry animation applied properly.");
