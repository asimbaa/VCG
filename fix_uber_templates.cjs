const fs = require('fs');
let code = fs.readFileSync('src/components/bank/UberApp.tsx', 'utf-8');

code = code.replace(/\{formatConverted/g, '${formatConverted');
// Wait, if I do this I will break JSX again.
// Let's just manually replace in the template strings.

code = code.replace(/`Premium Chauffeured transport: \$\{pickup\} to \$\{destination\} \(\$\{selectedVehicle\.name\}\) \[Incl\. Tip: \{formatConverted\(tipAmount\)\}\]`/g, '`Premium Chauffeured transport: ${pickup} to ${destination} (${selectedVehicle.name}) [Incl. Tip: ${formatConverted(tipAmount)}]`');
code = code.replace(/toast\.success\(`Tip of \{formatConverted\(tipAmount\)\} added to your ride billing!`\);/g, 'toast.success(`Tip of ${formatConverted(tipAmount)} added to your ride billing!`);');
code = code.replace(/subject: `Your trip with Uber - \{formatConverted\(fare\)}`,/g, 'subject: `Your trip with Uber - ${formatConverted(fare)}`,');
code = code.replace(/preview: `Total: \{formatConverted\(fare\)}\. Charged dynamically to Sovereign Card \$\{cardRefLabel\}\.`,/g, 'preview: `Total: ${formatConverted(fare)}. Charged dynamically to Sovereign Card ${cardRefLabel}.`,');
code = code.replace(/FARE DETAILS:\\n- Base Fare: \{formatConverted\(fare \* 0\.7\)}\\n- Distance charge: \{formatConverted\(fare \* 0\.2\)}\\n- Priority Hub Surcharge: \{formatConverted\(fare \* 0\.1\)}\\n- Total Fare: \{formatConverted\(fare\)}/g, 'FARE DETAILS:\\n- Base Fare: ${formatConverted(fare * 0.7)}\\n- Distance charge: ${formatConverted(fare * 0.2)}\\n- Priority Hub Surcharge: ${formatConverted(fare * 0.1)}\\n- Total Fare: ${formatConverted(fare)}');
code = code.replace(/toast\.success\(`Ride completed safely! \{formatConverted\(fare\)\} charged to Corporate Treasury\. Receipt dispatched to Workspace Comms\.`\);/g, 'toast.success(`Ride completed safely! ${formatConverted(fare)} charged to Corporate Treasury. Receipt dispatched to Workspace Comms.`);');

// And undo the $ for JSX
code = code.replace(/\$\{formatConverted/g, '{formatConverted'); // undo all
// Then apply template fix again
code = code.replace(/`([^`]*)(\{formatConverted\([^}]+\}\))([^`]*)`/g, function(m, p1, p2, p3) { return '`' + p1 + '$' + p2 + p3 + '`'; });
