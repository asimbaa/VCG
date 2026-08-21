const fs = require('fs');
let file = fs.readFileSync('src/firebase.ts', 'utf8');

file = file.replace('import { getFirestore, initializeFirestore, , doc, getDocFromServer } from \'firebase/firestore\';', 'import { getFirestore, initializeFirestore, doc, getDocFromServer } from \'firebase/firestore\';');

file = file.replace(
    'export const db = (firebaseConfig as any).firestoreDatabaseId   ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)  : getFirestore(app);',
    'export const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: undefined }, (firebaseConfig as any).firestoreDatabaseId);'
);

fs.writeFileSync('src/firebase.ts', file);
console.log("Firebase ts fixed.");
