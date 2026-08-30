const fs = require('fs');

const createHelper = `
export const createPaymentEvent = async (db, auth, amount, merchant, description) => {
  try {
    if (!auth.currentUser) return null;
    const docRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'payment_events'), {
      amount,
      merchant,
      description,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    
    // Simulate processing delay then confirm
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'payment_events', docRef.id), {
          status: 'confirmed'
        });
      } catch(e) {}
    }, 2500);
    
    return docRef.id;
  } catch(e) {
    console.error("Failed to create payment event", e);
    return null;
  }
};
`;

let content = fs.readFileSync('src/firebase.ts', 'utf8');
if (!content.includes('createPaymentEvent')) {
  // We need to make sure serverTimestamp, collection, addDoc, doc, updateDoc are imported.
  content = content.replace(
    'import { addDoc as firestoreAddDoc, setDoc as firestoreSetDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc } from "firebase/firestore";',
    'import { addDoc as firestoreAddDoc, setDoc as firestoreSetDoc, updateDoc as firestoreUpdateDoc, deleteDoc as firestoreDeleteDoc, collection, serverTimestamp, doc, updateDoc, addDoc } from "firebase/firestore";\n' + createHelper
  );
  fs.writeFileSync('src/firebase.ts', content);
}
