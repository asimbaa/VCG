const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const stateTarget = `const [voucherCodeInput, setVoucherCodeInput] = useState("");`;
const stateRepl = `const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [isSyncingVouchers, setIsSyncingVouchers] = useState(false);`;
content = content.replace(stateTarget, stateRepl);

const effectTarget = `// Synchronize Active Order from fast Firestore 'active_orders' collection`;
const effectRepl = `// Fetch Global Vouchers
  useEffect(() => {
    if (!user || !user.uid) return;
    setIsSyncingVouchers(true);
    const q = query(collection(db, "global_vouchers"), where("creatorId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const vouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyVouchers(vouchers);
      setIsSyncingVouchers(false);
    });
    return () => unsub();
  }, [user]);

  // Synchronize Active Order from fast Firestore 'active_orders' collection`;
content = content.replace(effectTarget, effectRepl);

fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
console.log("Vouchers state and effect added.");
