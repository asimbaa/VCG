const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');
content = content.replace(
  'import { addDoc as firestoreAddDoc, setDoc as firestoreSetDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, collection, serverTimestamp, doc, updateDoc, addDoc } from "firebase/firestore";',
  'import { addDoc as firestoreAddDoc, setDoc as firestoreSetDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, collection, serverTimestamp } from "firebase/firestore";'
);
fs.writeFileSync('src/firebase.ts', content);
