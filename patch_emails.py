import re

with open('src/components/messagecenter/MessageCenter.tsx', 'r') as f:
    content = f.read()

# Fix order
target1 = """  // Combine static and db messages
  const allMessages = useMemo(() => {
    const combined = [...messages, ...dbMessages.map(m => ({"""

replace1 = """  const messages = useMemo(() => [
    {
      id: 1,
      category: 'login',
      subject: 'Neuralink Quantum Authentication: Access Granted',
      sender: 'Sovereign IAM (Tier-1)',
      date: 'Today, 08:30 AM',
      read: false,
      content: `Valourian Security Protocol Alpha-7 has successfully verified your biometric and neural signatures.\n\nIdentity: ${user?.email || 'asim.nsw@gmail.com'}\nQuantum Encryption State: ACTIVE (AES-4096-GCM)\nDevice Matrix: Neuralink Pro & Apple Vision Pro (Synchronized)\nGeospatial Coordinates: Sydney, Australia (Encrypted Tunnel)\n\nAll deep space computational nodes confirm your access. Welcome back, Director. Your sovereign portfolio is operating at 99.999% uptime.`,
      attachments: [{ name: 'Access_Log_Alpha7.enc', size: '4.1 KB', icon: Key }]
    },
    {
      id: 2,
      category: 'invoices',
      subject: 'Invoice #VAL-2941: Global Asset Clearance via Sovereign Network',
      sender: 'Valourian Treasury',
      date: 'Yesterday, 14:15 PM',
      read: true,
      content: 'The following asset clearance has been executed across the Valourian blockchain utilizing zero-knowledge proof settlement.\n\nTotal Settled: $200,000,000.00 AUD\nTransaction Hash: 0x9b8a...3f1c\nStatus: PAID (Zero Limits Clearance Verified)\n\nAttached is the immutable smart contract invoice and the proof of purchase. The treasury reserves have been automatically rebalanced across the distributed ledger.',
      attachments: [{ name: 'SmartContract_Invoice_VAL2941.pdf', size: '1.2 MB', icon: FileText }, { name: 'Ledger_Verification.hash', size: '256 B', icon: FileText }]
    },
    {
      id: 3,
      category: 'maps',
      subject: 'Tactical Route Map: Westfield Chatswood to Artarmon Central Hub',
      sender: 'Sovereign Logistics Command',
      date: 'Oct 12, 10:00 AM',
      read: true,
      content: 'Your secure delivery vector has been locked and encrypted. Autonomous escort drones are currently mapping real-time traffic anomalies.\n\nOrigin: Westfield Chatswood (Secured Loading Bay)\nDestination: Artarmon Sovereign Hub (Vault 4)\nThreat Level: Zero (Path Clear)\n\nThe Sovereign Logistics dashboard is streaming live telemetry. Proceed to the command center to monitor the asset transfer.',
      attachments: [{ name: 'Route_Map_Secure_Vector.png', size: '3.4 MB', icon: MapIcon }, { name: 'Drone_Telemetry_Log.json', size: '840 KB', icon: FileText }]
    },
    {
      id: 4,
      category: 'login',
      subject: 'Sovereign Identity Verification Code',
      sender: 'Valourian Shield',
      date: 'Oct 10, 09:45 AM',
      read: true,
      content: 'A new session initialization was detected from your primary visual interface.\n\nVerification Code: 849-201-XYZ\n\nPlease submit this code via your neural interface to bypass the retinal firewall. This code is valid for exactly 180 seconds and is shielded against external interception.',
      attachments: []
    }
  ], [user]);

  // Combine static and db messages
  const allMessages = useMemo(() => {
    const combined = [...messages, ...dbMessages.map(m => ({"""

content = content.replace(target1, replace1)

# Remove old messages array
# find where `const messages = [` starts and remove it up to `];\n  const [searchQuery`
target2 = content[content.find("const messages = ["):content.find("  const [searchQuery")]
content = content.replace(target2, "")


with open('src/components/messagecenter/MessageCenter.tsx', 'w') as f:
    f.write(content)
