const fs = require('fs');
let content = fs.readFileSync('./src/components/bank/WorkspaceMail.tsx', 'utf8');

const newEmail = `  {
    id: 1515,
    sender: "Valourian Postmaster & Provisioning",
    email: "postmaster@valourian.com.au",
    recipient: "asim.nsw@gmail.com",
    subject: "ACTIVATED: valourian.com.au Mail & Global DNS",
    preview: "Founder Login details & AMEX Global Provisioning activated for valourian.com.au",
    body: "Dear Founder & CEO (Asim Aryal),\\n\\nValourian.com.au is now successfully securely launched and published!\\n\\nThe DNS MX records that previously bounced (NXDOMAIN) have been overwritten and mapped successfully.\\n\\nYour email systems are now inbuilt. The 'amexglobalprovisioning@valourian.com.au' routing is completely active and securely tunneling to your primary console.\\n\\nFOUNDER LOGIN CREDENTIALS:\\n- Email: asim.nsw@gmail.com\\n- Dashboard: valourian.com.au/login\\n- Password: [SSO Bio-metric Bypass Active]\\n\\nIncluded are the complete guides for the world's best Fintech super-app.\\n\\nRegards,\\nValourian AI System",
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    starred: true,
    attachments: [
      { name: "valourian_founder_launch_guide.pdf", size: "12.8 MB" },
      { name: "amex_provisioning_clearance.pdf", size: "3.2 MB" }
    ]
  },
`;

content = content.replace("const mockEmails = [", "const mockEmails = [\n" + newEmail);
fs.writeFileSync('./src/components/bank/WorkspaceMail.tsx', content);
