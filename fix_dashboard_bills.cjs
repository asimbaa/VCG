const fs = require('fs');

let content = fs.readFileSync('src/components/bank/ValourianDashboard.tsx', 'utf8');

// 1. Add import
if (!content.includes('GlobalBillsInvoices')) {
    content = content.replace(
        /import \{ VaultRecords, GLOBAL_PROPERTIES_DATABASE \} from "\.\/VaultRecords";/,
        `import { VaultRecords, GLOBAL_PROPERTIES_DATABASE } from "./VaultRecords";\nimport { GlobalBillsInvoices } from "./GlobalBillsInvoices";`
    );
}

// 2. Add to tab list
if (!content.includes('{ id: "bills", label: "Global Bills & Invoices", icon: DollarSign }')) {
    content = content.replace(
        /\{\s*id: "deposit",\s*label: "Deposits",\s*icon: Landmark\s*\},/,
        `{ id: "deposit", label: "Deposits", icon: Landmark },
          { id: "bills", label: "Global Bills & Invoices", icon: DollarSign },`
    );
}

// 3. Add to isFullWidthTab array
if (!content.includes('"bills",')) {
    content = content.replace(
        /"deposit",/,
        `"deposit",\n    "bills",`
    );
}

// 4. Add to router map
if (!content.includes('activeTab === "bills"')) {
    content = content.replace(
        /\) : activeTab === "compliance" \? \(/,
        `) : activeTab === "bills" ? (
                  <GlobalBillsInvoices />
                ) : activeTab === "compliance" ? (`
    );
}

// Also make sure DollarSign is imported from lucide-react if not already
if (!content.includes('DollarSign')) {
    content = content.replace(
        /CreditCard,/,
        `CreditCard,\n  DollarSign,`
    );
}

fs.writeFileSync('src/components/bank/ValourianDashboard.tsx', content);
