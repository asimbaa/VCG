import re

with open('src/components/bank/WorkspaceMail.tsx', 'r') as f:
    content = f.read()

# Add a new email to the top of INITIAL_EMAILS
new_email = """  {
    id: "mail-central-index",
    sender: "Valourian AI Core <system@valourian.com>",
    subject: "🔗 CENTRAL INDEX: Access Keys, Logins, Proof of Purchases & Key Links",
    preview: "Quick access guide to all Valourian systems, invoices, real-time tracking, maps, and component logins.",
    time: "09:00 AM",
    isUnread: true,
    folder: "inbox",
    tags: ["Important", "Logins", "Verification"],
    body: `Founder (Asim Aryal),

This is your secure Central Index. Keep this email pinned for immediate access to your entire Valourian infrastructure.

**🔐 LOGIN CREDENTIALS & ACCESS KEYS**
- Primary Email: asim.nsw@gmail.com
- Backup Comm: asim.aryal@protonmail.com | asimaryal2@gmail.com
- Master Vault Password: [BIOMETRIC_LOCKED - USE FINGERPRINT SCANNER]
- AWS Root Access: asim.nsw@gmail.com / [AUTHORIZED_VIA_SSO]
- Amazon Prime Enterprise: asim.nsw@gmail.com / [AUTHORIZED_VIA_SSO]
- Westfield Chatswood Storefront POS Admin: valourian-chatswood-01

**📦 PROOF OF PURCHASES & INVOICES**
- AWS Enterprise License & Amazon Fulfillment: [VIEW INVOICE #AWS-VAL-991]
- Westfield Chatswood Lease & Fitout: [VIEW INVOICE #WST-CHT-001]
- Seven Hills Warehouse Purchase: [VIEW DEED NSW-DEED-L998124Z]
- Apple Store Enterprise Fleet (MacBooks & iPhones): [VIEW INVOICE #APL-ENT-884]

**🗺️ STORES, MAPS & LOGISTICS TRACKING**
- Sovereign Logistics Dispatch Map: <a href="#" style="color:#3b82f6;text-decoration:underline;">[Open Logistics Map & Tracking]</a>
- Order Tracking (Real-time): <a href="#" style="color:#3b82f6;text-decoration:underline;">[Open Order Tracking Dashboard]</a>
- Aura Drive Fleet Map: <a href="#" style="color:#3b82f6;text-decoration:underline;">[Open Aura Drive Neural Sentry]</a>
- Real Uber & UberEats Operations: <a href="#" style="color:#3b82f6;text-decoration:underline;">[Open Fleet Command]</a>
- Westfield Chatswood Storefront: 1 Anderson St, Chatswood NSW 2067 (Home Essentials, Winter Wares, Pajamas, Merino Wool)
- Central Dispatch Warehouse: 1/163 Prospect Hwy, Seven Hills, 2147 NSW
- Delivery Destination: Unit 712 15 Barton Rd Artarmon NSW 2064

**🔗 INTERNAL & EXTERNAL APIS**
- Firebase Auth / Firestore: Active (Syncing Real-time)
- Google Maps Platform (Logistics/Routes): Active
- Stripe / Payment Gateways: Active (Black Cards Provisioned)
- AWS / Amazon Logistics Network: Active & Bridged

Every time a purchase is made or a login verification is required, it will be automatically routed to this Inbox and linked to your Master Profile.

End of Transmission.`,
    attachments: [
      { name: "Valourian_Master_Links_Guide.pdf", size: "2.1 MB" },
      { name: "AWS_Amazon_Enterprise_Licenses.pdf", size: "12.4 MB" },
      { name: "Chatswood_Storefront_Inventory.xlsx", size: "1.8 MB" }
    ]
  },
"""

content = content.replace("const INITIAL_EMAILS: EmailData[] = [", "const INITIAL_EMAILS: EmailData[] = [\n" + new_email)

with open('src/components/bank/WorkspaceMail.tsx', 'w') as f:
    f.write(content)
