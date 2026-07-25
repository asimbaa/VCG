const fs = require('fs');
let code = fs.readFileSync('src/components/bank/BookingApp.tsx', 'utf-8');
code = code.replace(/AUD \$\{hotel\.price\.toLocaleString\(\)\}/g, '${formatConverted(hotel.price)}');
fs.writeFileSync('src/components/bank/BookingApp.tsx', code);
