import re

with open("src/components/docucraft/DriveIntegration.tsx", "r") as f:
    content = f.read()

download_fn = """
  const handleDownload = (file: any) => {
    // Generate a secure payload placeholder blob
    const content = `VALOURIAN SOVEREIGN VAULT SECURE PAYLOAD\\n\\nFile Name: ${file.name}\\nSecurity Class: OMEGA\\n\\nThis document is cryptographically bound to the current session.\\nTimestamp: ${new Date().toISOString()}\\nStatus: VERIFIED_AND_DECRYPTED\\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name + (file.name.endsWith('.pdf') || file.name.endsWith('.docx') ? '' : '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Notification for immersion
    // (Assuming we might not have toast imported, let's use a native alert or assume toast exists)
    // We already have 'import { ..., Loader2, RefreshCw } from 'lucide-react';'
    // Let's just do a simple log or rely on the UI update
  };
"""

if "const handleDownload" not in content:
    content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n" + download_fn)

content = content.replace(
    '<button className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg transition-colors">                      <Download className="w-4 h-4" />                    </button>',
    '<button onClick={(e) => { e.stopPropagation(); handleDownload(file); }} className="p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg transition-colors">                      <Download className="w-4 h-4" />                    </button>'
)

with open("src/components/docucraft/DriveIntegration.tsx", "w") as f:
    f.write(content)

print("DriveIntegration patched successfully")
