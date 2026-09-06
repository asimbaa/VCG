const fs = require('fs');
let code = fs.readFileSync('src/utils/email.ts', 'utf8');

const targetLog = `        if (data.mock) {
            console.log(\`Email mock sent (configure SMTP in .env to send real emails) to \${email.to}\`);
            toast.success("Email sent! (Check Server Console)");
        } else {
            console.log(\`Email successfully delivered to \${email.to}: \${email.subject}\`);
            toast.success("Email Delivered Successfully via SMTP.");
        }`;

const replacementLog = `        if (data.testUrl) {
            console.log(\`Email delivered to Ethereal Testing Sandbox. Preview URL: \${data.testUrl}\`);
            toast.success("Email Sent! (Check terminal for Ethereal Preview URL)", { duration: 6000 });
            // Optionally, you could open the test URL in a new window, but standard logging is safer
        } else if (data.mock) {
            console.log(\`Email mock sent (configure SMTP in .env to send real emails) to \${email.to}\`);
            toast.success("Email sent! (Check Server Console)");
        } else {
            console.log(\`Email successfully delivered to \${email.to}: \${email.subject}\`);
            toast.success("Email Delivered Successfully via SMTP.");
        }`;

code = code.replace(targetLog, replacementLog);
fs.writeFileSync('src/utils/email.ts', code);
