const fs = require('fs');
const cards = JSON.parse(fs.readFileSync('generated_cards.json', 'utf8'));

const replaceInFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  
  const startStr = "const [digitalCards, setDigitalCards] = useState<any[]>(() => {";
  const start = content.indexOf(startStr);
  
  if (start > -1) {
    const endStr = "    ];\n  });";
    const end = content.indexOf(endStr, start);
    
    if (end > -1) {
      const newInit = `const [digitalCards, setDigitalCards] = useState<any[]>(() => {
    try {
      const saved = window.localStorage.getItem('valourian_digital_cards_v7');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ${JSON.stringify(cards, null, 6)};
  });`;
      
      content = content.slice(0, start) + newInit + content.slice(end + endStr.length);
      fs.writeFileSync(path, content);
      console.log(path + " updated");
    } else {
      console.log("End not found in " + path);
    }
  } else {
    console.log("Start not found in " + path);
  }
};

replaceInFile('./src/components/bank/ValourianDashboard.tsx');
replaceInFile('./src/components/bank/BankDashboard.tsx');
