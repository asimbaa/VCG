const fs = require('fs');
const content = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf8');
const activeFleetMatch = content.match(/export const ACTIVE_FLEET = \[([\s\S]*?)\];/);
if (activeFleetMatch) {
  const arrStr = '[' + activeFleetMatch[1] + ']';
  try {
    const arr = eval(arrStr);
    arr.forEach((item, i) => {
      if (!item.coords) console.log('Missing coords at index ' + i);
    });
    console.log('Done checking ACTIVE_FLEET');
  } catch(e) { console.log('Eval error'); }
}
