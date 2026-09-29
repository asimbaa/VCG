const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

// Add recentScans state to RapidPay component
const oldRapidPay = `export function RapidPay({ user }: { user: any }) {
  const [amount, setAmount] = useState("");`;
const newRapidPay = `export function RapidPay({ user }: { user: any }) {
  const [amount, setAmount] = useState("");
  const [recentScans, setRecentScans] = useState<{data: string, type: string, timestamp: Date}[]>([]);`;
content = content.replace(oldRapidPay, newRapidPay);

// Update onScan logic to add to recentScans
const oldOnScan = `<RealQRScanner onScan={(data) => {
                  toast.success("QR Code Detected!");
                  if (data.toLowerCase().includes('0x') || data.toLowerCase().includes('bitcoin:') || data.toLowerCase().includes('ethereum:')) {
                    setCryptoAddress(data);
                    setTransferType("digital_assets");
                  } else {
                    setRecipient(data);
                    setAmount("");
                    setTransferType("standard");
                  }
                }} />`;
const newOnScan = `<RealQRScanner onScan={(data) => {
                  toast.success("QR Code Detected!");
                  const isCrypto = data.toLowerCase().includes('0x') || data.toLowerCase().includes('bitcoin:') || data.toLowerCase().includes('ethereum:');
                  
                  setRecentScans(prev => {
                    const newScan = { data, type: isCrypto ? 'crypto' : 'merchant', timestamp: new Date() };
                    return [newScan, ...prev].slice(0, 5);
                  });

                  if (isCrypto) {
                    setCryptoAddress(data);
                    setTransferType("digital_assets");
                  } else {
                    setRecipient(data);
                    setAmount("");
                    setTransferType("standard");
                  }
                }} />`;
content = content.replace(oldOnScan, newOnScan);

// Add the recent scans UI
const oldUI = `              </div>
            </div>
          </div>
        </div>
      ) : transferType === "digital_assets" ? (`;

const newUI = `              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-slate-800">Recent Scans</h4>
              </div>
              <div className="space-y-3">
                {recentScans.length === 0 ? (
                   <p className="text-sm text-slate-500">No recent scans.</p>
                ) : (
                  recentScans.map((scan, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          {scan.type === 'crypto' ? <Bitcoin className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-700 truncate">{scan.data}</p>
                          <p className="text-[10px] text-slate-500">{scan.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      ) : transferType === "digital_assets" ? (`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
