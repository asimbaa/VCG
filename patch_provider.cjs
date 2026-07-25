const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');
content = content.replace(/<option value="DHL">DHL Express<\/option>/, '<option value="DHL">DHL Express</option>\n                      <option value="Aura Drive Tesla Fleet">Aura Drive Tesla Fleet</option>');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
