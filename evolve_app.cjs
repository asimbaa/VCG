const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `const FOUNDER_EMAILS = [
  'asim.nsw@gmail.com',
  'asimaryal2@gmail.com',
  'asim.aryal@protonmail.com',
  'valouriancapital@gmail.com',
  'asimmaryal@gmail.com',
  'asimaryal10@gmail.com',
  'asimausco@gmail.com',
  'valourianbank@gmail.com'
];

export const isFounder = (email: string | null | undefined) => {
  if (!email) return true; // Defaulting to CEO mode in dev
  return FOUNDER_EMAILS.includes(email.toLowerCase());
};

const CEO_USER = {
    uid: "ceo-founder-override",
    email: "asim.nsw@gmail.com",
    displayName: "Mr. Asim Aryal (Founder CEO Director)",
    photoURL: "https://ui-avatars.com/api/?name=Asim+Aryal&background=10b981&color=fff",
    emailVerified: true
  } as User;`;

content = content.replace(/const CEO_USER = \{[\s\S]*?\} as User;/, replacement);

fs.writeFileSync('src/App.tsx', content);
