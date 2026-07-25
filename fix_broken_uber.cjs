const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');

code = code.replace(
  '${formatConverted(pickup} to ${destination} (${selectedVehicle.name}) [Incl. Tip: AUD $${tipAmount)}]',
  '${pickup} to ${destination} (${selectedVehicle.name}) [Incl. Tip: ${formatConverted(tipAmount)}]'
);

code = code.replace(
  '- Service: ${formatConverted(selectedVehicle.name} (${selectedVehicle.carModel})\\n- Driver: ${selectedVehicle.driver}\\n- Pickup: ${pickup}\\n- Destination: ${destination}\\n- Distance: ${route.distance}\\n- Duration: ${route.duration}\\n\\nFARE DETAILS (AUD):\\n- Base Fare: $${(fare * 0.7))}\\n- Distance charge: $${formatConverted((fare * 0.2))}\\n- Priority Hub Surcharge: $${formatConverted((fare * 0.1))}\\n- Total Fare: AUD $${formatConverted(fare)}',
  '- Service: ${selectedVehicle.name} (${selectedVehicle.carModel})\\n- Driver: ${selectedVehicle.driver}\\n- Pickup: ${pickup}\\n- Destination: ${destination}\\n- Distance: ${route.distance}\\n- Duration: ${route.duration}\\n\\nFARE DETAILS:\\n- Base Fare: ${formatConverted(fare * 0.7)}\\n- Distance charge: ${formatConverted(fare * 0.2)}\\n- Priority Hub Surcharge: ${formatConverted(fare * 0.1)}\\n- Total Fare: ${formatConverted(fare)}'
);

fs.writeFileSync('src/components/bank/UberApp.tsx', code);
