const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const [user, setUser] = useState<User | null>(null);`;
const replacement1 = `const [user, setUser] = useState<User | null>(null);
  const CEO_USER = {
    uid: "ceo-founder-override",
    email: "asim.nsw@gmail.com",
    displayName: "Sovereign CEO",
    photoURL: "https://ui-avatars.com/api/?name=Sovereign+CEO&background=10b981&color=fff",
    emailVerified: true
  } as User;
  
  const effectiveUser = user || CEO_USER;`;

const target2 = `if (!user) {
    return (
      <ErrorBoundary>
         <ValourianAuth />
      </ErrorBoundary>
    );
  }`;
const replacement2 = `/* Bypass Auth for CEO Power Access */`;

// Replace all usages of 'user' with 'effectiveUser' in the render section
let renderSection = code.substring(code.indexOf('return ('));
renderSection = renderSection.replace(/user\.photoURL/g, 'effectiveUser.photoURL');
renderSection = renderSection.replace(/user\.email/g, 'effectiveUser.email');
renderSection = renderSection.replace(/user\.displayName/g, 'effectiveUser.displayName');
renderSection = renderSection.replace(/user=\{user\}/g, 'user={effectiveUser}');

code = code.substring(0, code.indexOf('return (')) + renderSection;
code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
