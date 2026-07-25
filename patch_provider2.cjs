const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');
content = content.replace(/<option value="Aura Drive Tesla Fleet">Aura Drive Tesla Fleet<\/option>/, '<option value="Aura Drive Tesla Fleet">Aura Drive Tesla Fleet</option>\n                      <option value="Apple Store Fleet">Apple Store Fleet</option>');
fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
