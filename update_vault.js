const fs = require('fs');
let content = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

const newProperties = `
  {
    id: "LRS-NSW-003",
    address: "1/163 Prospect Hwy, Seven Hills, 2147 NSW Australia",
    type: "Sovereign Logistics Warehouse",
    folio: "1/DP16377",
    value: "$4,500,000 AUD",
    purchaseDate: "2026-07-24",
    proprietor: "ASIM ARYAL (VALOURIAN CAPITAL)",
    zoning: "IN1 General Industrial",
    lot: "Lot 1 in Deposited Plan 16377",
    lrsReference: "NSW-LRS-VOL-16377-1",
    deedNumber: "NSW-DEED-L998124Z",
    stampDutyPaid: "$240,000 AUD",
    fundingSource: "Valourian Treasury Reserve",
    tenureType: "Torrens Title / Freehold",
    country: "Australia"
  },
  {
    id: "LRS-NSW-004",
    address: "Westfield Chatswood, 1 Anderson St, Chatswood NSW 2067, Australia",
    type: "Valourian Sovereign Storefront (Home Essentials & Winter Wares)",
    folio: "A/DP99123",
    value: "$12,000,000 AUD",
    purchaseDate: "2026-07-24",
    proprietor: "ASIM ARYAL (VALOURIAN CAPITAL)",
    zoning: "B3 Commercial Core",
    lot: "Lot A in Deposited Plan 99123",
    lrsReference: "NSW-LRS-VOL-99123-A",
    deedNumber: "NSW-DEED-W456122C",
    stampDutyPaid: "$650,000 AUD",
    fundingSource: "Valourian Treasury Reserve",
    tenureType: "Torrens Title / Freehold",
    country: "Australia"
  },`;

content = content.replace('export const GLOBAL_PROPERTIES_DATABASE = [', 'export const GLOBAL_PROPERTIES_DATABASE = [' + newProperties);

fs.writeFileSync('src/components/bank/VaultRecords.tsx', content);
