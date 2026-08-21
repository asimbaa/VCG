const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/    \} catch \(e\) \{\n      toast\.error\("Could not generate PDF"\);\n    \}\n  \};\n  \};/g, '    } catch (e) {\n      toast.error("Could not generate PDF");\n    }\n  };');
  fs.writeFileSync(file, content);
}

fix('src/components/bank/BankDashboard.tsx');
fix('src/components/bank/ValourianDashboard.tsx');
