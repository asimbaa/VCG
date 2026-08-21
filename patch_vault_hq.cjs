const fs = require('fs');

let file = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

const newProperty = `  {
    id: "LRS-NSW-HQ01",
    address: "Governor Phillip Tower, 1 Farrer Pl, Sydney NSW 2000, Australia",
    type: "Valourian Capital Global Headquarters (Fully Staffed & Furnished)",
    folio: "88/DP10403",
    value: "$4,500,000,000 AUD (25-Year Premium Lease & Sovereign Fitout)",
    purchaseDate: "2026-08-20",
    proprietor: "ASIM ARYAL (VALOURIAN CAPITAL)",
    zoning: "B8 Metropolitan Centre",
    lot: "Levels 35-45 (Top Floors) in Deposited Plan 10403",
    lrsReference: "NSW-LRS-VOL-10403-HQ",
    deedNumber: "NSW-DEED-HQ998124X",
    stampDutyPaid: "$320,000,000 AUD",
    fundingSource: "Valourian Master Trust",
    tenureType: "25-Year Sovereign Corporate Lease",
    country: "Australia"
  },
`;

if (!file.includes('Governor Phillip Tower')) {
    file = file.replace('export const GLOBAL_PROPERTIES_DATABASE = [', 'export const GLOBAL_PROPERTIES_DATABASE = [\n' + newProperty);
}

const newRegDoc = `  {
    id: "REG-PROP-SYDHQ01",
    name: "Governor Phillip Tower (Levels 35-45), Sydney NSW 2000",
    type: "Sovereign 25-Year Corporate Lease",
    category: "Property",
    financialValue: "$4,500,000,000 AUD",
    purchaseDate: "2026-08-20",
    documentRef: "NSW-LRS-VOL-HQ01",
    status: "Active - Fully Staffed & Furnished",
    legalProof: "Valourian Capital Master Trust - CEO Asim Aryal",
    purchaser: "Asim Aryal",
    taxStatus: "Fully Paid ($320,000,000 NSW Stamp Duty)"
  },
`;

if (!file.includes('Governor Phillip Tower (Levels 35-45)')) {
    file = file.replace('export const REGULATORY_DOCUMENTS = [', 'export const REGULATORY_DOCUMENTS = [\n' + newRegDoc);
}

fs.writeFileSync('src/components/bank/VaultRecords.tsx', file);
console.log("VaultRecords patched with Global HQ.");
