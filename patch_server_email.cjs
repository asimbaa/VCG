const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importStatement = `import path from "path";\nimport nodemailer from "nodemailer";`;
code = code.replace(`import path from "path";`, importStatement);

const emailEndpoint = `
// ==========================================
// REAL-TIME EMAIL INFRASTRUCTURE (NODEMAILER)
// ==========================================
app.post("/api/email/send", async (req, res) => {
  try {
    const { to, subject, htmlBody } = req.body;
    if (!to || !subject || !htmlBody) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Only configure and send if SMTP is set up, otherwise mock success to prevent app crash
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: '"Valourian Capital" <' + process.env.SMTP_USER + '>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: htmlBody, // html body
      });
      
      console.log("Message sent: %s", info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } else {
      console.log("No SMTP configured. Mocking email send to: " + to);
      res.json({ success: true, mock: true, message: "SMTP credentials not provided in .env, email mocked." });
    }
  } catch (err: any) {
    console.error("Email Sending Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

code = code.replace(`// ==========================================
// REAL-TIME FLEET & WORKFORCE INFRASTRUCTURE
// ==========================================`, emailEndpoint + `\n// ==========================================
// REAL-TIME FLEET & WORKFORCE INFRASTRUCTURE
// ==========================================`);

fs.writeFileSync('server.ts', code);
