const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

code = code.replace(/const DirectorVaultModal = \(\{\n? *isOpen,\n? *onClose,\n? *\}\: \{\n? *isOpen\: boolean;\n? *onClose\: \(\) \=\> void;\n? *\}\) \=\> \{/, `const DirectorVaultModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
   if (user?.email !== "asim.nsw@gmail.com") return null;`);

code = code.replace(/const DirectorVaultModal = \(\{ isOpen, onClose \}\: \{ isOpen\: boolean, onClose\: \(\) \=\> void \}\) \=\> \{/, `const DirectorVaultModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
   if (user?.email !== "asim.nsw@gmail.com") return null;`);


code = code.replace(/<DirectorVaultModal isOpen=\{showDirectorVault\} onClose=\{\(\) \=\> setShowDirectorVault\(false\)\} \/>/, `<DirectorVaultModal isOpen={showDirectorVault} onClose={() => setShowDirectorVault(false)} user={user} />`);

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
