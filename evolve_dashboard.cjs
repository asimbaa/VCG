const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// 1. Add import for CommandPalette
content = content.replace(
  /import \{ WebsiteDeployments \} from "\.\/WebsiteDeployments";/,
  `import { CommandPalette } from "./CommandPalette";\nimport { WebsiteDeployments } from "./WebsiteDeployments";`
);

// 2. Add state to ValourianDashboard
// Find the activeTab state
const statePattern = /const \[activeTab, setActiveTab\] = useState<string>\("treasury"\);/;
const newState = `const [activeTab, setActiveTab] = useState<string>("treasury");
  const [cmdOpen, setCmdOpen] = useState(false);
  
  // Global Cmd+K / Cmd+P listener
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'p')) {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);
`;
content = content.replace(statePattern, newState);

// 3. Render CommandPalette in return statement
const returnPattern = /return \(\s*<div className="w-full mx-auto space-y-8 relative">/;
const newReturn = `return (
    <div className="w-full mx-auto space-y-8 relative flex flex-col min-h-[100dvh] overflow-x-hidden">
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} setActiveTab={setActiveTab} />
`;
content = content.replace(returnPattern, newReturn);

// 4. Update the layout to be more mobile responsive
const gridPattern = /<div\s*className=\{\`grid grid-cols-1 \$\{isFullWidthTab \? "lg:grid-cols-1" : "lg:grid-cols-12"\} gap-8\`\}\s*>/;
const newGridPattern = `<div
        className={\`flex flex-col-reverse lg:grid lg:grid-cols-1 \${isFullWidthTab ? "lg:grid-cols-1" : "lg:grid-cols-12"} gap-4 lg:gap-8\`}
      >`;
content = content.replace(gridPattern, newGridPattern);

// 5. Enhance loading smoothness of apps (Will-change on the container)
const containerPattern = /className=\{\`\$\{isFullWidthTab \? "w-full" : "lg:col-span-7"\} space-y-6\`\}/;
const newContainerPattern = `className={\`\${isFullWidthTab ? "w-full" : "lg:col-span-7"} space-y-6 w-full max-w-full overflow-hidden transform-gpu will-change-transform\`}`;
content = content.replace(containerPattern, newContainerPattern);


fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
