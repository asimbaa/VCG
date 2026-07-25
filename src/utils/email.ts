import { getWorkspaceAccessToken, signInWithGoogle } from '../firebase';
import { toast } from 'sonner';

// Keep track of rate limits and queue
const emailQueue: Array<{to: string, subject: string, htmlBody: string, resolve: (val: boolean) => void}> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || emailQueue.length === 0) return;
  isProcessingQueue = true;
  
  while (emailQueue.length > 0) {
    const email = emailQueue.shift();
    if (!email) continue;
    
    try {
      let token = getWorkspaceAccessToken();
      if (!token) {
        toast.error("Workspace Comms Disconnected. Emails are queued.", { id: "email-queue" });
        email.resolve(false);
        continue;
      }
      
      const emailContent = [
        `To: ${email.to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${email.subject}`,
        '',
        email.htmlBody
      ].join('\r\n');

      const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        console.log(`Email successfully sent to ${email.to}: ${email.subject}`);
        email.resolve(true);
      }
    } catch (e) {
      console.error("Failed to send email:", e);
      email.resolve(false);
    }
    
    // Rate limiting pause
    await new Promise(r => setTimeout(r, 500));
  }
  
  isProcessingQueue = false;
};

export const sendWorkspaceEmail = async (to: string, subject: string, htmlBody: string): Promise<boolean> => {
  return new Promise((resolve) => {
    emailQueue.push({ to, subject, htmlBody, resolve });
    processQueue();
  });
};

export const generateProfessionalReceipt = (details: any) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-2xl mx-auto p-8 border border-[#e2e8f0] rounded-xl bg-white">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Sovereign Executive</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Official Transaction Record</p>
        </div>
        <div style="text-align: right;">
          <p style="color: #0f172a; margin: 0; font-size: 14px; font-weight: bold;">ID: ${details.id || Math.random().toString(36).substring(7).toUpperCase()}</p>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">${new Date().toLocaleString()}</p>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; rounded-lg margin-bottom: 30px;">
        <h2 style="color: #0f172a; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Transaction Details</h2>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-size: 14px; font-weight: bold;">Merchant/Recipient:</span>
          <span style="color: #0f172a; font-size: 14px; font-weight: bold;">${details.merchant || details.recipient}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #64748b; font-size: 14px; font-weight: bold;">Status:</span>
          <span style="color: #10b981; font-size: 14px; font-weight: bold;">CLEARED & APPROVED</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #cbd5e1;">
          <span style="color: #0f172a; font-size: 18px; font-weight: 900;">Total Amount Settled:</span>
          <span style="color: #0f172a; font-size: 24px; font-weight: 900;">${details.amount}</span>
        </div>
      </div>
      
      <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px;">
        <p>This is an automated encrypted receipt from the Sovereign Banking Network.</p>
        <p>Valourian Capital OS • Secure Transaction Infrastructure</p>
      </div>
    </div>
  `;
};
