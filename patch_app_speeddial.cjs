const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('FloatingSpeedDial')) {
  // Insert import
  content = content.replace(
    'import { ValourianAI } from "./components/bank/ValourianAI";',
    'import { ValourianAI } from "./components/bank/ValourianAI";\nimport { FloatingSpeedDial } from "./components/FloatingSpeedDial";'
  );

  // Insert component rendering
  content = content.replace(
    '<ValourianAI />',
    '<ValourianAI />\n        <FloatingSpeedDial\n          onOpenAI={() => window.dispatchEvent(new Event("open-valourian-ai"))}\n          onOpenAlerts={() => window.dispatchEvent(new Event("open-threshold-alerts"))}\n          onOpenGuide={() => window.dispatchEvent(new Event("open-ai-guide"))}\n        />'
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
