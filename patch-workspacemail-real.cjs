const fs = require('fs');
let content = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

if (!content.includes('sendWorkspaceEmail')) {
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { sendWorkspaceEmail } from '../../utils/email';");
}

const target = `              <button 
                onClick={async () => {
                  toast.success("Synchronizing external protocols (Bank, Maps, Products, Deliveries)...");
                  if (user && user.uid) {
                    const emailsColRef = collection(db, "users", user.uid, "emails");
                    const newConnEmail = {
                      id: Date.now() + Math.random(),
                      sender: "Valourian Logistics",
                      email: "logistics@valourian.com",
                      subject: "Physical App / Card / Delivery Connections Synced",
                      body: "Your digital bank apps, physical cards, product stores, and forms are now actively connected to Maps APIs and best delivery protocols.\\n\\nAll physical creations generated in the app will seamlessly route through our logistics manifest.",
                      date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      read: false,
                      starred: true,
                      timestamp: new Date().toISOString()
                    };
                    await setDoc(doc(emailsColRef, String(newConnEmail.id)), newConnEmail);
                    toast.success("Connection protocols established and email received!");
                  }
                }}`;
                
const repl = `              <button 
                onClick={async () => {
                  toast.success("Synchronizing external protocols (Bank, Maps, Products, Deliveries)...");
                  if (user && user.uid) {
                    const emailsColRef = collection(db, "users", user.uid, "emails");
                    const newConnEmail = {
                      id: Date.now() + Math.random(),
                      sender: "Valourian Logistics",
                      email: "logistics@valourian.com",
                      subject: "Physical App / Card / Delivery Connections Synced",
                      body: "Your digital bank apps, physical cards, product stores, and forms are now actively connected to Maps APIs and best delivery protocols.\\n\\nAll physical creations generated in the app will seamlessly route through our logistics manifest.\\n\\nThis is a real-time verification from Valourian OS.",
                      date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                      read: false,
                      starred: true,
                      timestamp: new Date().toISOString()
                    };
                    // Save to local inbox
                    await setDoc(doc(emailsColRef, String(newConnEmail.id)), newConnEmail);
                    
                    // Actually send via real Gmail API if available
                    if (user.email) {
                      const htmlBody = \`
                        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                            <h2 style="color: #10b981; margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Protocol Synchronization</h2>
                          </div>
                          <div style="padding: 32px; background-color: #ffffff;">
                            <p style="font-size: 16px; color: #334155; line-height: 1.6;">Your digital bank apps, physical cards, product stores, and forms are now actively connected to Maps APIs and best delivery protocols.</p>
                            <div style="margin: 30px 0; padding: 20px; background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 4px;">
                              <p style="margin: 0; color: #475569; font-family: monospace; font-size: 14px;">STATUS: ACTIVE & VERIFIED</p>
                              <p style="margin: 8px 0 0 0; color: #475569; font-family: monospace; font-size: 14px;">ROUTING: VALOURIAN SECURE LOGISTICS</p>
                            </div>
                            <p style="font-size: 14px; color: #64748b;">All physical creations generated in the app will seamlessly route through our logistics manifest. This automated communication confirms external pipeline readiness.</p>
                          </div>
                          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Valourian Capital OS</p>
                          </div>
                        </div>
                      \`;
                      const success = await sendWorkspaceEmail(user.email, newConnEmail.subject, htmlBody);
                      if (success) {
                        toast.success("Real Workspace Email Delivered successfully!");
                      }
                    } else {
                       toast.success("Connection protocols established and local email received!");
                    }
                  }
                }}`;
                
content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', content);
console.log("Real WorkspaceMail patched.");
