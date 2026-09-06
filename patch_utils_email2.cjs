const fs = require('fs');
let code = fs.readFileSync('src/utils/email.ts', 'utf8');

const toReplace = `      let token = getWorkspaceAccessToken();
      if (!token) {
        toast.error("Workspace Comms Disconnected. Emails are queued.", { id: "email-queue" });
        email.resolve(false);
        continue;
      }
      
      const emailContent = [
        \`To: \${email.to}\`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        \`Subject: \${email.subject}\`,
        '',
        email.htmlBody
      ].join('\\r\\n');

      const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\\+/g, '-')
        .replace(/\\//g, '_')
        .replace(/=+$/, '');`;

code = code.replace(toReplace, "");
fs.writeFileSync('src/utils/email.ts', code);
