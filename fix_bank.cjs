const fs = require('fs');
let content = fs.readFileSync('src/components/bank/BankDashboard.tsx', 'utf8');

// Fix the useEffect unsubscribe
content = content.replace(
  '    return (\n    <>\n      <PaymentStatusOverlay />) => unsubscribe();',
  '    return () => unsubscribe();'
);

// Fix the end of file trailing tags
const badEnd = '      </>\n  );\n}';
if (content.endsWith(badEnd)) {
  content = content.slice(0, content.length - badEnd.length) + ');\n}';
}

// Find main return
const mainReturnMatch = content.match(/  return \(\n    <div className="min-h-screen/);
if (mainReturnMatch) {
  content = content.replace(
    '  return (\n    <div className="min-h-screen',
    '  return (\n    <>\n      <PaymentStatusOverlay />\n    <div className="min-h-screen'
  );
  const lastIndex = content.lastIndexOf(');\n}');
  if (lastIndex !== -1) {
    content = content.slice(0, lastIndex) + '    </>\n  );\n}';
  }
}

fs.writeFileSync('src/components/bank/BankDashboard.tsx', content);
