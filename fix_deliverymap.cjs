const fs = require('fs');
let code = fs.readFileSync('src/components/bank/DeliveryMap.tsx', 'utf8');

code = code.replace(/setTelemetry\(\(prev\) => \{[\s\S]*?return \{[\s\S]*?lat: prev\.lat,[\s\S]*?lng: prev\.lng,[\s\S]*?heading: headingVal \|\| \(latitude \? 12 : 0\),[\s\S]*?speed: currentSpeed,[\s\S]*?distanceRem: distanceRem[\s\S]*?\};[\s\S]*?\}\);/, 
`setTelemetry((prev) => {
      return {
        lat: latitude || prev.lat, 
        lng: longitude || prev.lng, 
        heading: headingVal || (latitude ? 12 : 0), 
        speed: currentSpeed,
        distanceRem: distanceRem
      };
    });`);

fs.writeFileSync('src/components/bank/DeliveryMap.tsx', code);
console.log("Fixed DeliveryMap with specific regex");
