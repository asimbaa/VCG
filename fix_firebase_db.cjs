const fs = require('fs');
let file = fs.readFileSync('src/firebase.ts', 'utf8');

const newInit = 'export const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: undefined }, (firebaseConfig as any).firestoreDatabaseId);';

file = file.replace(/export const db = [\s\S]*?: getFirestore\(app\);/, newInit);

fs.writeFileSync('src/firebase.ts', file);
console.log("Firebase db export fixed.");
