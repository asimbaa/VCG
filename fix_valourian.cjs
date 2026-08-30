const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// Fix VouchersAndPrintTab
content = content.replace(
  '  return (\n    <>\n      <PaymentStatusOverlay />',
  '  return ('
);

// Fix end of file
const badEnd = '      </>\n  );\n}';
if (content.endsWith(badEnd)) {
  content = content.slice(0, content.length - badEnd.length) + ');\n}';
}

// Add PaymentStatusOverlay properly in the main component
// find "export function ValourianDashboard"
const exportIndex = content.indexOf('export function ValourianDashboard');
const returnIndex = content.indexOf('return (', exportIndex);

if (returnIndex !== -1 && !content.slice(returnIndex, returnIndex + 100).includes('<PaymentStatusOverlay />')) {
   content = content.slice(0, returnIndex + 8) + '\n    <>\n      <PaymentStatusOverlay />' + content.slice(returnIndex + 8);
   
   // find the last return statement block of the function?
   // Actually the main component return ends at the end of the file!
   // Let's just append `</>` before the last `);\n}`
   const lastIndex = content.lastIndexOf(');\n}');
   if (lastIndex !== -1) {
     content = content.slice(0, lastIndex) + '    </>\n  );\n}';
   }
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
