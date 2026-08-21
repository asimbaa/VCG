const fs = require('fs');
let file = fs.readFileSync('src/components/bank/DeliveryMap.tsx', 'utf8');

// Undo bad replace if it happened
if (file.includes('prev.lat || latitude')) {
  // We need to rewrite it correctly
  const correctLogic = `
    setTelemetry((prev) => {
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
`;
  file = file.replace(/\/\/ Smooth transition using Framer Motion animate[\s\S]*?lng: prev\.lng, \/\/ Handled by animate/g, correctLogic);
  fs.writeFileSync('src/components/bank/DeliveryMap.tsx', file);
  console.log("Telemetry animation fixed.");
}
