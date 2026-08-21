const fs = require('fs');
let file = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

// I need to ensure the HQ details perfectly match the requested luxury amenities.
const updateHQ = `
  {
    id: "LRS-NSW-HQ01",
    address: "Valourian Global HQ, Governor Phillip Tower, 1 Farrer Pl, Sydney NSW 2000",
    type: "Ultra-Luxury Corporate Nexus (Levels 35-45)",
    folio: "88/DP10403",
    value: "$4,500,000,000 AUD (25-Year Pre-Paid Sovereign Fitout)",
    purchaseDate: "2026-08-20",
    proprietor: "VALOURIAN CAPITAL (ASIM ARYAL)",
    zoning: "B8 Metropolitan Centre - Executive Elite",
    lot: "Full Penthouse & Sub-Penthouse Corporate Tier",
    lrsReference: "NSW-LRS-VOL-10403-HQ",
    deedNumber: "NSW-DEED-HQ998124X",
    stampDutyPaid: "$320,000,000 AUD",
    fundingSource: "Valourian Master Trust",
    tenureType: "25-Year Sovereign Corporate Lease",
    country: "Australia",
    amenities: "On-site Michelin-grade chefs, premium wellness gyms, heated pools, nootropic bars, Apple M-Series maxed fleet for all staff, high-bandwidth dedicated fiber optic rings, 24/7 dedicated supportive building staff & courier concierges."
  },
`;

// I will overwrite the existing HQ block
file = file.replace(/\{\s*id: "LRS-NSW-HQ01",[\s\S]*?country: "Australia"\s*\}/, updateHQ.trim());

fs.writeFileSync('src/components/bank/VaultRecords.tsx', file);
console.log("HQ updated.");
