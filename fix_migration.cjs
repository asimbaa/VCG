const fs = require('fs');
let content = fs.readFileSync('src/components/bank/DataMigrationTerminal.tsx', 'utf8');

// Replace firebase imports
content = content.replace(
  "import { db, addDoc, collection, serverTimestamp } from '../../firebase';",
  "import { db, addDoc } from '../../firebase';\nimport { collection, serverTimestamp } from 'firebase/firestore';"
);

fs.writeFileSync('src/components/bank/DataMigrationTerminal.tsx', content);
