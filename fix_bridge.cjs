const fs = require('fs');
let code = fs.readFileSync('src/components/bank/RealityBridge.tsx', 'utf8');

const target = `setTimeout(() => {
            setSyncState('success');
            setLogs(l => [...l, 'SYSTEM LIVE. Welcome to Reality.']);
            toast.success("Simulation deployed to reality successfully.", { icon: "🌍" });
          }, 2000);`;

const replacement = `setTimeout(async () => {
            setSyncState('success');
            setLogs(l => [...l, 'SYSTEM LIVE. Welcome to Reality.']);
            toast.success("Simulation deployed to reality successfully.", { icon: "🌍" });
            
            // Actually hit the DB to stamp reality state
            try {
              const { auth, db } = await import('../../firebase');
              const { doc, setDoc } = await import('firebase/firestore');
              if (auth.currentUser) {
                await setDoc(doc(db, 'deployments', auth.currentUser.uid), {
                  status: 'REALITY_DEPLOYED',
                  timestamp: new Date().toISOString(),
                  totalValueMapped: totalValue,
                  infrastructure: 'AWS_QUANTUM_CORE'
                }, { merge: true });
              }
            } catch(e) {
              console.error(e);
            }
          }, 2000);`;

if (code.includes('setLogs(l => [...l, \'SYSTEM LIVE. Welcome to Reality.\']);')) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/bank/RealityBridge.tsx', code);
    console.log("Updated RealityBridge to write to DB");
}
