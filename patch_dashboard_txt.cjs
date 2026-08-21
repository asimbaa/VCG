const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const replacement = `
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("VALOURIAN CAPITAL VAULT", 15, 20);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.text(doc.title, 15, 45);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      
      const lines = pdf.splitTextToSize(content, 180);
      pdf.text(lines, 15, 60);

      pdf.save(\`\${doc.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf\`);
      toast.success(\`\${doc.title} downloaded as PDF.\`, { icon: "⬇️" });
    } catch (e) {
      toast.error("Could not generate PDF");
    }
  };
`;

  content = content.replace(/const blob = new Blob\(\[content\], \{ type: "text\/plain" \}\);[\s\S]*?toast\.success\([^)]+\);\n  \};/, replacement.trim() + "\n  };");
  
  // Make the function async
  content = content.replace(/const handleDownloadVaultDoc = \(doc: any\) => \{/, "const handleDownloadVaultDoc = async (doc: any) => {");

  fs.writeFileSync(filepath, content);
}

patchFile('src/components/bank/ValourianDashboard.tsx');
patchFile('src/components/bank/BankDashboard.tsx');

