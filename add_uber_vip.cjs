const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');

const vipVehicle = `
  {
    id: "uber-chopper",
    name: "Uber Chopper (VIP)",
    carModel: "Airbus H130 Helicopter",
    capacity: 6,
    eta: 5,
    priceEstimate: 1200.00,
    driver: "Capt. Reynolds",
    rating: 5.0,
    distance: "Helipad",
    type: "Air",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80"
  },`;

code = code.replace(
  'const RIDE_OPTIONS = [',
  'const RIDE_OPTIONS = [\n' + vipVehicle
);

fs.writeFileSync('src/components/bank/UberApp.tsx', code);
