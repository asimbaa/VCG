const fs = require('fs');
let content = fs.readFileSync('src/components/bank/SovereignStore.tsx', 'utf8');

// Ensure jsPDF is imported
if (!content.includes("import { jsPDF } from 'jspdf';")) {
  content = content.replace("import React,", "import { jsPDF } from 'jspdf';\nimport React,");
}

const replacement = `
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VALOURIAN CAPITAL", 15, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SOVEREIGN TITLE DEED", 15, 32);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF ABSOLUTE OWNERSHIP", 15, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 70);

    const fileName = \`Valourian_Title_Deed_\${assetName.replace(/\\s+/g, "_")}.pdf\`;
    doc.save(fileName);
    toast.success(\`Title Deed Certificate for "\${assetName}" successfully downloaded as PDF!\`, { icon: "📥" });
  };
`;

content = content.replace(/const blob = new Blob\(\[content\][\s\S]*?toast\.success\([^)]+\);\n  \};/, replacement.trim() + "\n  };");

fs.writeFileSync('src/components/bank/SovereignStore.tsx', content);
