const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert import
code = code.replace(
  'import { doc, getDocFromServer } from "firebase/firestore";',
  'import { doc, getDocFromServer } from "firebase/firestore";\nimport { startPeriodicBackup } from "./services/BackupService";'
);

// Insert hook inside App
const hookCode = `
  useEffect(() => {
    if (user) {
      const stopBackup = startPeriodicBackup(300000); // 5 mins
      return stopBackup;
    }
  }, [user]);
`;

code = code.replace(
  'const [emailSent, setEmailSent] = useState(false);',
  'const [emailSent, setEmailSent] = useState(false);' + hookCode
);

fs.writeFileSync('src/App.tsx', code);
