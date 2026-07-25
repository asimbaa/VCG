const fs = require('fs');
const file = 'src/components/bank/ValourianDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '            ) : activeTab === ("ubereats" as any) ? (';
const injection = `
            ) : activeTab === ("skyscanner" as any) ? (
              <ValourianAcquisitionsApp appName="Skyscanner" category="Global Travel & Flights Infrastructure" valuation="$1.75 Billion AUD" ownedShares="100% (Strategic Buyout)" />
            ) : activeTab === ("etoro" as any) ? (
              <ValourianAcquisitionsApp appName="eToro" category="Global Trading & Brokerage Infrastructure" valuation="$4.2 Billion AUD" ownedShares="100% (Strategic Buyout)" />
            ) : activeTab === ("commbank" as any) ? (
              <ValourianAcquisitionsApp appName="Commonwealth Bank" ticker="CBA.AX" category="Tier 1 Australian Banking Infrastructure" valuation="$185.3 Billion AUD" ownedShares="Majority Stake / Core Control" />
            ) : activeTab === ("commsec" as any) ? (
              <ValourianAcquisitionsApp appName="CommSec" category="Australian Retail Trading Infrastructure" valuation="$5.8 Billion AUD" ownedShares="100% Integrated" />
            ) : activeTab === ("nab" as any) ? (
              <ValourianAcquisitionsApp appName="National Australia Bank" ticker="NAB.AX" category="Tier 1 Australian Commercial Banking" valuation="$105.1 Billion AUD" ownedShares="Majority Stake / Strategic Board Control" />
            ) : activeTab === ("pgy" as any) ? (
              <ValourianAcquisitionsApp appName="Pilot Energy Limited" ticker="PGY.AX" category="Australian Energy Infrastructure" valuation="$54 Million AUD" ownedShares="100% (Hostile Takeover via eToro Integration)" />
            ) : activeTab === ("coinbase" as any) ? (
              <ValourianAcquisitionsApp appName="Coinbase" ticker="COIN" category="Global Crypto Custody & Exchange" valuation="$42.5 Billion AUD" ownedShares="100% (Strategic Buyout)" />
`;

content = content.replace(anchor, injection + anchor);
fs.writeFileSync(file, content);
