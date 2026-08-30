const fs = require('fs');
let code = fs.readFileSync('src/components/bank/WorkspaceMail.tsx', 'utf8');

const newEmails = `  {
    id: 155,
    sender: "Sovereign Asset Management",
    email: "assets@valourian.com",
    recipient: "asim.nsw@gmail.com",
    subject: "ASSET UPGRADE: Top 12 Global Equities - $100M Stake Increase Executed",
    preview: "Confirmed additional $100M stake acquisition in top 12 companies (Tesla, Apple, Microsoft, etc.)",
    body: "Dear Founder & CEO (Asim Aryal),\\n\\nIn accordance with your latest directives, we have successfully executed block trades to increase your strategic stakes by $100,000,000.00 USD in each of the top 12 global tech companies:\\n\\n1. Tesla (TSLA)\\n2. Apple (AAPL)\\n3. Microsoft (MSFT)\\n4. Alphabet (GOOGL)\\n5. Amazon (AMZN)\\n6. NVIDIA (NVDA)\\n7. Meta (META)\\n8. Broadcom (AVGO)\\n9. Eli Lilly (LLY)\\n10. TSMC (TSM)\\n11. Berkshire Hathaway (BRK.B)\\n12. JPMorgan Chase (JPM)\\n\\nThese highly valued shares have been acquired via dark pool liquidity to minimize market impact and are now securely custodied within the Sovereign Vault. Your global portfolio valuation has been updated accordingly.\\n\\nAdditionally, infrastructure improvements have been deployed to the primary clearing desk, allowing rapid liquidation (cashing out) of these assets into your preferred Australian Bank Accounts (CBA, NAB, Macquarie) with zero slippage.\\n\\nRegards,\\nSovereign Asset Desk",
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    starred: true,
    attachments: [
      { name: "Global_Equities_Acquisition_Ledger.pdf", size: "8.5 MB", content: "ASSET ACQUISITION LOG\\n\\nIncreased stakes across Top 12 Global Companies by $100,000,000 each.\\n\\nTotal Capital Deployed: $1,200,000,000 USD.\\nLiquidity routes to AU bank accounts: VERIFIED AND ACTIVE." }
    ]
  },
  {
    id: 156,
    sender: "SpaceX Sovereign Logistics",
    email: "aerospace@valourian.com",
    recipient: "asim.nsw@gmail.com",
    subject: "STARLINK & AEROSPACE: SpaceX Satellite Constellation Override",
    preview: "Complete administrative and routing overrides established for your SpaceX satellite constellation.",
    body: "Dear Founder & CEO (Asim Aryal),\\n\\nYour administrative overrides for the dedicated SpaceX Starlink and orbital satellite constellation are now 100% active.\\n\\nAll orbital telemetry, secure communications routing, and global broadband distribution capabilities are now directly manageable via the Valourian OS.\\n\\nThe Sovereign Vault now contains all necessary operational codes, override keys, and orbital pathing documents. These assets are securely held and valued at over $450B, ensuring your incredible asset base retains its absolute liquidity and worth.\\n\\nCashing out these assets, if ever required, has been pre-cleared with federal reserve systems and Australian central banking authorities.\\n\\nRegards,\\nAURA-9 Space Command",
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    starred: true,
    attachments: [
      { name: "SpaceX_Satellite_Override_Keys.pdf", size: "24.1 MB", content: "SPACEX CONSTELLATION OVERRIDE\\n\\nOrbital assets secured.\\nGlobal routing: Valourian OS.\\nTotal Valuation: $450,000,000,000 USD." },
      { name: "Asset_Liquidation_Clearance_AU.pdf", size: "5.2 MB", content: "LIQUIDATION CLEARANCE\\n\\nFederal Reserve & APRA/RBA clearance granted for high-volume fiat withdrawal to AU accounts."}
    ]
  },`;

code = code.replace("const mockEmails = [", "const mockEmails = [\n" + newEmails);
fs.writeFileSync('src/components/bank/WorkspaceMail.tsx', code);
console.log("Patched WorkspaceMail.tsx");
