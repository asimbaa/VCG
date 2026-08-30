const fs = require('fs');

function patchFile(filePath, componentName) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add forwardRef and useImperativeHandle if not present
  if (!content.includes('forwardRef')) {
    content = content.replace('import React, { useState,', 'import React, { useState, forwardRef, useImperativeHandle,');
    if (!content.includes('forwardRef')) {
      content = content.replace('import { useState', 'import React, { useState, forwardRef, useImperativeHandle');
    }
  }

  // 2. Change signature
  const regex = new RegExp(`export function ${componentName}\\(\\s*(?:\\{\\s*\\}\\s*)?\\)\\s*\\{`);
  content = content.replace(regex, `export const ${componentName} = React.forwardRef((props, ref) => {`);

  // 3. Add useImperativeHandle inside
  const useStateRegex = /const \[isOpen, setIsOpen\] = useState\(false\);/;
  if (content.match(useStateRegex)) {
    content = content.replace(
      useStateRegex,
      `const [isOpen, setIsOpen] = useState(false);\n  useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));`
    );
  }

  // 4. Remove the floating buttons
  // This is tricky. I'll just find the button block and comment it out or remove it based on specific strings.
  
  fs.writeFileSync(filePath, content);
}
