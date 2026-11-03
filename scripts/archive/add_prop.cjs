const fs = require('fs');
let content = fs.readFileSync('src/components/bank/VaultRecords.tsx', 'utf8');

const newProp = `  {
    id: "LRS-NSW-009",
    address: "Unit 712, 15 Barton Road, Artarmon NSW 2064, Australia",
    type: "Luxury Penthouse Suite",
    folio: "712/DP84295",
    value: "$2,450,000 AUD",
    purchaseDate: "2024-05-15",
    proprietor: "ASIM ARYAL",
    zoning: "R4 High Density Residential",
    lot: "Lot 712 in Deposited Plan 84295",
    lrsReference: "NSW-LRS-VOL-84295-712",
    deedNumber: "NSW-DEED-A849204A",
    stampDutyPaid: "$114,845 AUD",
    fundingSource: "Valourian Treasury Reserve",
    tenureType: "Strata Title / Freehold",
    country: "Australia",
    benificialInfluxUnitValues: "4,500 Influx Units"
  },`;

if (!content.includes("15 Barton Road, Artarmon NSW 2064, Australia") && content.includes("VEH-TESLA-001")) {
    content = content.replace(
        /(\{\s*id: "VEH-TESLA-001"[^}]+\},)/,
        `$1\n${newProp}`
    );
    fs.writeFileSync('src/components/bank/VaultRecords.tsx', content);
    console.log("Added Unit 712 to properties");
}
