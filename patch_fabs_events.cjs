const fs = require('fs');

function patchComponent(file, eventName, btnTextMatch) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add useEffect to listen for event
  if (!content.includes(`window.addEventListener('${eventName}'`)) {
    const useEffectStr = `
  React.useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('${eventName}', handleOpen);
    return () => window.removeEventListener('${eventName}', handleOpen);
  }, []);
`;
    // Find where to insert it - after the useState(false);
    const stateRegex = /const \[isOpen, setIsOpen\] = useState\(false\);/;
    content = content.replace(stateRegex, `const [isOpen, setIsOpen] = useState(false);\n${useEffectStr}`);
    
    // Also need to make sure React is imported, but they all use React hooks anyway so React should be in scope or we can just use useEffect.
    content = content.replace('React.useEffect', 'useEffect');
    if (!content.includes('useEffect(')) {
       content = content.replace('import { useState', 'import { useState, useEffect');
    }
  }

  // Hide the original button
  // I'll just look for className="fixed bottom-..." and add ' hidden ' to it.
  content = content.replace(/className=(['"{`])([^'"{`]*fixed bottom-[^'"{`]*)(['"`}])/g, (match, p1, p2, p3) => {
    // If it already has hidden, leave it
    if (p2.includes(' hidden ')) return match;
    // Don't hide the modal itself! The modal usually has "bottom-" but wait...
    // The button has "rounded-full". The modal usually has "w-80" or "w-96".
    if (p2.includes('rounded-full') && !p2.includes('w-80') && !p2.includes('w-96')) {
      return `className=${p1}hidden ${p2}${p3}`;
    }
    return match;
  });

  fs.writeFileSync(file, content);
}

patchComponent('src/components/AIGuide.tsx', 'open-ai-guide');
patchComponent('src/components/bank/ThresholdAlerts.tsx', 'open-threshold-alerts');
patchComponent('src/components/bank/ValourianAI.tsx', 'open-valourian-ai');

