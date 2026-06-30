const fs = require('fs');
const files = ['src/components/bank/CommBankDashboard.tsx', 'src/App.tsx'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let d = fs.readFileSync(file, 'utf8');
    d = d.replace(/CommBank VIP Capital/g, 'Valourian Capital');
    d = d.replace(/CommBank VIP/g, 'Valourian Capital');
    d = d.replace(/CommBankHub/g, 'Valourian Treasury');
    d = d.replace(/CommBank/g, 'Valourian');
    d = d.replace(/commbank_vipcapital\.com/gi, 'valourian.com');
    d = d.replace(/cbavip\.com\.au/gi, 'valourian.com');
    d = d.replace(/cbavip/gi, 'valourian');
    d = d.replace(/Valourian Capital Capital OS/g, 'Valourian Capital OS');
    d = d.replace(/Valourian Capital Capital/g, 'Valourian Capital');
    d = d.replace(/Valourian Capital OS OS/g, 'Valourian Capital OS');
    fs.writeFileSync(file, d);
  }
}
console.log('Done replacement');
