const fs = require('fs');
let file = fs.readFileSync('src/firebase.ts', 'utf8');

if (!file.includes('experimentalForceLongPolling')) {
    // Replace getFirestore import to include initializeFirestore
    file = file.replace(/import \{ getFirestore(.*?)\} from 'firebase\/firestore';/, "import { getFirestore, initializeFirestore, $1} from 'firebase/firestore';");

    // Replace getFirestore() calls with initializeFirestore() with polling
    file = file.replace(
        /export const db = \(firebaseConfig as any\)\.firestoreDatabaseId \? getFirestore\(app, \(firebaseConfig as any\)\.firestoreDatabaseId\) : getFirestore\(app\);/g,
        "export const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: undefined }, (firebaseConfig as any).firestoreDatabaseId);"
    );
    
    fs.writeFileSync('src/firebase.ts', file);
    console.log("Firebase experimentalForceLongPolling enabled.");
}
