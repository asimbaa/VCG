const fs = require('fs');

function patchComponent(file, componentName, buttonRegex) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make the signature accept props
  const sigRegex = new RegExp(`export function ${componentName}\\(\\)\\s*\\{`);
  content = content.replace(sigRegex, `export function ${componentName}({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {`);
  
  // Replace internal state with props if provided
  const stateRegex = /const \[isOpen, setIsOpen\] = useState\(false\);/;
  content = content.replace(stateRegex, `const [internalOpen, setInternalOpen] = useState(false);\n  const _isOpen = isOpen !== undefined ? isOpen : internalOpen;\n  const _setIsOpen = setIsOpen || setInternalOpen;`);
  
  // Replace isOpen and setIsOpen usages
  content = content.replace(/isOpen/g, (match, offset, fullString) => {
    // Only replace if it's not part of _isOpen or setIsOpen or internalOpen
    if (fullString.substring(offset - 1, offset) === '_' || fullString.substring(offset - 3, offset) === 'set' || fullString.substring(offset, offset + 7) === 'isOpen:') return match;
    return '_isOpen';
  });
  content = content.replace(/setIsOpen/g, '_setIsOpen');
  
  // Actually, string replace for isOpen might mess up some things.
  fs.writeFileSync(file, content);
}
