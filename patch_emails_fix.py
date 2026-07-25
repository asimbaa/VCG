import re

with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    content = f.read()

target = """    {
      id: 2,
      category: 'invoices',
      subject: 'Invoice #VAL-2941: Global Asset Clearance via Sovereign Network',
      sender: 'Valourian Treasury',
      date: 'Yesterday, 14:15 PM',
      read: true,
      content: 'The following asset clearance has been executed across the Valourian blockchain utilizing zero-knowledge proof settlement.

Total Settled: $200,000,000.00 AUD
Transaction Hash: 0x9b8a...3f1c
Status: PAID (Zero Limits Clearance Verified)

Attached is the immutable smart contract invoice and the proof of purchase. The treasury reserves have been automatically rebalanced across the distributed ledger.',
      attachments: [{ name: 'SmartContract_Invoice_VAL2941.pdf', size: '1.2 MB', icon: FileText }, { name: 'Ledger_Verification.hash', size: '256 B', icon: FileText }]
    },
    {
      id: 3,
      category: 'maps',
      subject: 'Tactical Route Map: Westfield Chatswood to Artarmon Central Hub',
      sender: 'Sovereign Logistics Command',
      date: 'Oct 12, 10:00 AM',
      read: true,
      content: 'Your secure delivery vector has been locked and encrypted. Autonomous escort drones are currently mapping real-time traffic anomalies.

Origin: Westfield Chatswood (Secured Loading Bay)
Destination: Artarmon Sovereign Hub (Vault 4)
Threat Level: Zero (Path Clear)

The Sovereign Logistics dashboard is streaming live telemetry. Proceed to the command center to monitor the asset transfer.',
      attachments: [{ name: 'Route_Map_Secure_Vector.png', size: '3.4 MB', icon: MapIcon }, { name: 'Drone_Telemetry_Log.json', size: '840 KB', icon: FileText }]
    },
    {
      id: 4,
      category: 'login',
      subject: 'Sovereign Identity Verification Code',
      sender: 'Valourian Shield',
      date: 'Oct 10, 09:45 AM',
      read: true,
      content: 'A new session initialization was detected from your primary visual interface.

Verification Code: 849-201-XYZ

Please submit this code via your neural interface to bypass the retinal firewall. This code is valid for exactly 180 seconds and is shielded against external interception.',
      attachments: []
    }"""

replace = """    {
      id: 2,
      category: 'invoices',
      subject: 'Invoice #VAL-2941: Global Asset Clearance via Sovereign Network',
      sender: 'Valourian Treasury',
      date: 'Yesterday, 14:15 PM',
      read: true,
      content: `The following asset clearance has been executed across the Valourian blockchain utilizing zero-knowledge proof settlement.

Total Settled: $200,000,000.00 AUD
Transaction Hash: 0x9b8a...3f1c
Status: PAID (Zero Limits Clearance Verified)

Attached is the immutable smart contract invoice and the proof of purchase. The treasury reserves have been automatically rebalanced across the distributed ledger.`,
      attachments: [{ name: 'SmartContract_Invoice_VAL2941.pdf', size: '1.2 MB', icon: FileText }, { name: 'Ledger_Verification.hash', size: '256 B', icon: FileText }]
    },
    {
      id: 3,
      category: 'maps',
      subject: 'Tactical Route Map: Westfield Chatswood to Artarmon Central Hub',
      sender: 'Sovereign Logistics Command',
      date: 'Oct 12, 10:00 AM',
      read: true,
      content: `Your secure delivery vector has been locked and encrypted. Autonomous escort drones are currently mapping real-time traffic anomalies.

Origin: Westfield Chatswood (Secured Loading Bay)
Destination: Artarmon Sovereign Hub (Vault 4)
Threat Level: Zero (Path Clear)

The Sovereign Logistics dashboard is streaming live telemetry. Proceed to the command center to monitor the asset transfer.`,
      attachments: [{ name: 'Route_Map_Secure_Vector.png', size: '3.4 MB', icon: MapIcon }, { name: 'Drone_Telemetry_Log.json', size: '840 KB', icon: FileText }]
    },
    {
      id: 4,
      category: 'login',
      subject: 'Sovereign Identity Verification Code',
      sender: 'Valourian Shield',
      date: 'Oct 10, 09:45 AM',
      read: true,
      content: `A new session initialization was detected from your primary visual interface.

Verification Code: 849-201-XYZ

Please submit this code via your neural interface to bypass the retinal firewall. This code is valid for exactly 180 seconds and is shielded against external interception.`,
      attachments: []
    }"""

content = content.replace(target, replace)
with open('src/components/messagecenter/MessageCenter.tsx', 'w') as f:
    f.write(content)
