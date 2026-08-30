const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  'const docRef = await addDoc(',
  'const docRef = (await addDoc('
);
content = content.replace(
  'timestamp: serverTimestamp()\n    });',
  'timestamp: serverTimestamp()\n    })) as any;'
);

fs.writeFileSync('src/firebase.ts', content);
