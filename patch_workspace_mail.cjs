const fs = require('fs');
let code = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

const target1 = `  // Load configuration based on email key
  useEffect(() => {
    try {
      const stored = localStorage.getItem(\`val_smtp_\${selectedAccount.email}\`);
      if (stored) {
        const config = JSON.parse(stored);
        setSmtpHost(config.host || "smtp.gmail.com");
        setSmtpPort(config.port || "465");
        setSmtpUser(config.user || selectedAccount.email);
        setSmtpPass(config.pass || "");
        setSmtpFrom(config.from || selectedAccount.name);
      } else {
        const isGmail = selectedAccount.email.includes("gmail.com");
        setSmtpHost(isGmail ? "smtp.gmail.com" : "smtp.ethereal.email");
        setSmtpPort(isGmail ? "465" : "587");
        setSmtpUser(selectedAccount.email);
        setSmtpPass("");
        setSmtpFrom(selectedAccount.name);
      }
    } catch (e) { }
  }, [selectedAccount]);

  const saveSmtpSettings = (host: string, port: string, userVal: string, passVal: string, fromVal: string) => {
    try {
      const config = { host, port, user: userVal, pass: passVal, from: fromVal };
      localStorage.setItem(\`val_smtp_\${selectedAccount.email}\`, JSON.stringify(config));
      setSmtpHost(host);
      setSmtpPort(port);
      setSmtpUser(userVal);
      setSmtpPass(passVal);
      setSmtpFrom(fromVal);
      toast.success(\`SMTP credentials locked in securely for \${selectedAccount.email}!\`);
    } catch (e) {
      toast.error("Failed to secure credentials cache.");
    }
  };`;

const replace1 = `  // Load configuration based on email key
  useEffect(() => {
    if (!user) return;
    const loadSettings = async () => {
      try {
        const stored = localStorage.getItem(\`val_smtp_\${selectedAccount.email}\`);
        if (stored) {
          const config = JSON.parse(stored);
          setSmtpHost(config.host || "smtp.gmail.com");
          setSmtpPort(config.port || "465");
          setSmtpUser(config.user || selectedAccount.email);
          setSmtpPass(config.pass || "");
          setSmtpFrom(config.from || selectedAccount.name);
        } else {
          // Check firestore
          const docRef = doc(db, "users", user.uid, "smtp_configs", selectedAccount.email);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const config = snap.data();
            setSmtpHost(config.host || "smtp.gmail.com");
            setSmtpPort(config.port || "465");
            setSmtpUser(config.user || selectedAccount.email);
            setSmtpPass(config.pass || "");
            setSmtpFrom(config.from || selectedAccount.name);
            localStorage.setItem(\`val_smtp_\${selectedAccount.email}\`, JSON.stringify(config));
          } else {
            const isGmail = selectedAccount.email.includes("gmail.com");
            setSmtpHost(isGmail ? "smtp.gmail.com" : "smtp.ethereal.email");
            setSmtpPort(isGmail ? "465" : "587");
            setSmtpUser(selectedAccount.email);
            setSmtpPass("");
            setSmtpFrom(selectedAccount.name);
          }
        }
      } catch (e) { }
    };
    loadSettings();
  }, [selectedAccount, user]);

  const saveSmtpSettings = async (host: string, port: string, userVal: string, passVal: string, fromVal: string) => {
    try {
      const config = { host, port, user: userVal, pass: passVal, from: fromVal };
      localStorage.setItem(\`val_smtp_\${selectedAccount.email}\`, JSON.stringify(config));
      setSmtpHost(host);
      setSmtpPort(port);
      setSmtpUser(userVal);
      setSmtpPass(passVal);
      setSmtpFrom(fromVal);
      if (user) {
        await setDoc(doc(db, "users", user.uid, "smtp_configs", selectedAccount.email), config);
      }
      toast.success(\`SMTP credentials locked in securely for \${selectedAccount.email}!\`);
    } catch (e) {
      toast.error("Failed to secure credentials cache.");
    }
  };`;

if(code.includes('const saveSmtpSettings = (host: string')) {
  code = code.replace(target1, replace1);
  fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', code);
  console.log("Patched WorkspaceMail.tsx");
} else {
  console.log("target1 not found");
}
