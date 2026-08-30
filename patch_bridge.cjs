const fs = require('fs');
let code = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!code.includes('import { RealityBridge }')) {
    code = code.replace(
        'const generateValidLuhnCard', 
        'import { RealityBridge } from "./RealityBridge";\n\nconst generateValidLuhnCard'
    );
    
    // Add tab rendering logic
    const renderTarget = '{activeTab === "send" ? (';
    const renderReplacement = '{activeTab === "reality" ? (<RealityBridge balances={balances} onComplete={() => setActiveTab("treasury")} />) : activeTab === "send" ? (';
    code = code.replace(renderTarget, renderReplacement);
    
    // Also inject the button in the header or navigation
    // Let's find the navigation rendering
    const navTarget = '<div className="flex items-center justify-around px-2 py-2 overflow-x-auto hide-scrollbar gap-1">';
    // Let's add it to the top TABS array or sidebar if there is one. Wait, in ValourianDashboard, there is a grid of buttons.
    // Let's add a floating action button on the bottom left for the Reality Bridge.
    const floatTarget = '{/* Floating AI Agent Deep Space Cluster */}';
    const floatReplacement = `      {/* Deploy to Reality Button */}
      <button 
        onClick={() => setActiveTab('reality')}
        className="fixed bottom-6 left-6 z-[100] bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:bg-blue-500 transition-all group font-black uppercase tracking-widest text-xs border border-blue-400"
      >
        <Globe className="w-5 h-5 mr-2 group-hover:animate-spin" /> Sim2Real
      </button>

      {/* Floating AI Agent Deep Space Cluster */}`;
      
    code = code.replace(floatTarget, floatReplacement);
    fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', code);
    console.log("Patched RealityBridge into ValourianDashboard");
}
