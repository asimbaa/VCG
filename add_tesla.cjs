const fs = require('fs');
let content = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

const newProp = `  {
    id: "VEH-TESLA-001",
    address: "Tesla Lidcombe Delivery Centre, B1/29 Birnie Ave Lidcombe, NSW 2141",
    type: "Tesla Model Y Performance Dual Motor All-Wheel Drive",
    folio: "RN119834827",
    value: "$114,500 AUD",
    purchaseDate: "2026-08-20",
    proprietor: "ASIM ARYAL",
    zoning: "Electric Vehicle (Performance)",
    lot: "VIN: LRWY232_a43d726b25932adabcf11bff2f15c070",
    lrsReference: "RMS-NSW-REG-84729",
    deedNumber: "TESLA-INV-AU-991283",
    stampDutyPaid: "$3,435 AUD",
    fundingSource: "Valourian Sovereign Fleet Reserve",
    tenureType: "Outright Corporate Ownership",
    country: "Australia",
    benificialInfluxUnitValues: "10,000 Influx Units"
  },`;

content = content.replace(
    /(\{\s*id: "LRS-NSW-009")/,
    `${newProp}\n  $1`
);
fs.writeFileSync('src/components/bank/VaultRecords.tsx', content);
