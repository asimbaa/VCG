const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

const targetReturn = `  return (
    <div className="w-full mx-auto space-y-8 relative flex flex-col min-h-[100dvh] overflow-x-hidden">
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} setActiveTab={setActiveTab} />`;

const replacementReturn = `  return (
    <div className="w-full mx-auto space-y-8 relative flex flex-col min-h-[100dvh] overflow-x-hidden">
      <div className="valourian-ambient-bg"></div>
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} setActiveTab={setActiveTab} />`;

code = code.replace(targetReturn, replacementReturn);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
