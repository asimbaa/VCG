const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetEmail = `    // Only configure and send if SMTP is set up, otherwise mock success to prevent app crash
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
    }`;

const replacementEmail = `    let transporter;
    let senderAddress;
    let isEthereal = false;
    
    // Auto-provision an Ethereal test account if no real SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      senderAddress = '"Valourian Capital" <' + process.env.SMTP_USER + '>';
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log("No SMTP configured. Automatically provisioning an Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      senderAddress = '"Valourian Capital (Test)" <' + testAccount.user + '>';
      isEthereal = true;
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: senderAddress,
      to: to,
      subject: subject,
      html: htmlBody,
    });
    
    console.log("Message sent: %s", info.messageId);
    
    if (isEthereal) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.json({ 
        success: true, 
        messageId: info.messageId,
        testUrl: nodemailer.getTestMessageUrl(info),
        mock: false,
        message: "Sent via Ethereal Test Account. Check server logs for Preview URL."
      });
    } else {
      res.json({ success: true, messageId: info.messageId, mock: false });
    }`;

code = code.replace(targetEmail, replacementEmail);
fs.writeFileSync('server.ts', code);
