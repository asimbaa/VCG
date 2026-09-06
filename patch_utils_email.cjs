const fs = require('fs');
let code = fs.readFileSync('src/utils/email.ts', 'utf8');

const targetQueue = `      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64EncodedEmail
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Gmail API Error:", err);
        if (response.status === 401) {
           toast.error("Gmail authorization expired. Please sign in again.");
           signInWithGoogle(); // Trigger sign in
        }
        email.resolve(false);
      } else {
        console.log(\`Email successfully sent to \${email.to}: \${email.subject}\`);
        email.resolve(true);
      }`;

const replacementQueue = `      // Enhanced Server-side Email Sending (bypasses Gmail Auth if SMTP is configured)
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email.to,
          subject: email.subject,
          htmlBody: email.htmlBody
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Backend Email API Error:", err);
        email.resolve(false);
      } else {
        const data = await response.json();
        if (data.mock) {
            console.log(\`Email mock sent (configure SMTP in .env to send real emails) to \${email.to}\`);
            toast.success("Email sent! (Check Server Console)");
        } else {
            console.log(\`Email successfully delivered to \${email.to}: \${email.subject}\`);
            toast.success("Email Delivered Successfully via SMTP.");
        }
        email.resolve(true);
      }`;

code = code.replace(targetQueue, replacementQueue);
fs.writeFileSync('src/utils/email.ts', code);
