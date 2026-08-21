const fs = require('fs');
let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

if (!content.includes('sendWorkspaceEmail')) {
    content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport { sendWorkspaceEmail, generateProfessionalReceipt } from '../../utils/email';");
}

const target = `onClick={() => {
                          toast.success("Logistics API Triggered: Dispatching 200 Pre-Activated Physical Cards via Secure Courier.");
                          setTimeout(() => {
                            toast.success("Delivery scheduled for Monday. Track in Logistics module.");
                          }, 1500);
                        }}`;

const repl = `onClick={async () => {
                          toast.success("Logistics API Triggered: Dispatching 200 Pre-Activated Physical Cards via Secure Courier.");
                          
                          if (user && user.email) {
                             const receiptHtml = generateProfessionalReceipt({
                                id: 'VAL-PHYS-BATCH-' + Math.random().toString(36).substring(2,8).toUpperCase(),
                                merchant: 'Valourian Physical Logistics Division',
                                recipient: user.email,
                                amount: '200 Units (Pre-Activated Black Cards)'
                             });
                             const emailBody = \`
                               <div style="margin-bottom: 20px;">
                                 <h2 style="color: #0f172a;">Secure Logistics Manifest Generated</h2>
                                 <p style="color: #334155;">Your request for 200 physical sovereign black cards has been accepted. The units are being crafted and encoded with your cryptographic seed.</p>
                                 <p style="color: #334155;"><strong>Delivery Scheduled:</strong> Next Monday via Secure Armored Courier.</p>
                                 <p style="color: #334155;"><strong>Routing:</strong> Direct delivery with mandatory signature & biometric verification.</p>
                               </div>
                               \${receiptHtml}
                             \`;
                             
                             const success = await sendWorkspaceEmail(user.email, "Physical Card Logistics Dispatch Manifest", emailBody);
                             if (success) {
                                toast.success("Real Workspace Email Manifest Delivered!");
                             }
                          }
                          
                          setTimeout(() => {
                            toast.success("Delivery scheduled for Monday. Track in Logistics module.");
                          }, 1500);
                        }}`;
                        
content = content.replace(target, repl);
fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
console.log("ValourianDashboard real email patched.");
