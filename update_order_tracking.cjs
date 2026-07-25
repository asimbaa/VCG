const fs = require('fs');
let content = fs.readFileSync('src/components/bank/OrderTrackingDashboard.tsx', 'utf8');

const newTrackingState = `{
    orderId: "VAL-STORE-9901-AUS",
    status: 'in_transit',
    estimatedDeliveryTime: "8:45 PM",
    courierName: "Valourian VIP Fleet (Alex V.)",
    courierVehicle: "Black Mercedes-Benz Sprinter (V-Class)",
    courierRating: 5.0,
    restaurantName: "Valourian Sovereign Storefront (Chatswood)",
    deliveryAddress: "Unit 712 15 Barton Rd Artarmon NSW 2064 Australia",
    progress: 45,
    latitude: -33.7969, // near Chatswood
    longitude: 151.1834,
  }`;

content = content.replace(/{[\s\n]*orderId:\s*"ORD-9482-BXZ"[^}]*}/, newTrackingState);

fs.writeFileSync('src/components/bank/OrderTrackingDashboard.tsx', content);
