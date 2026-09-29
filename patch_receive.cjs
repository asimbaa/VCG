const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

// 1. Update transferType union
content = content.replace(
  'useState<"standard" | "au_bsb" | "payid" | "credit_card" | "digital_bsb_card" | "digital_assets" | "uber_vouchers" | "scan_qr">("standard");',
  'useState<"standard" | "au_bsb" | "payid" | "credit_card" | "digital_bsb_card" | "digital_assets" | "uber_vouchers" | "scan_qr" | "receive_qr">("standard");'
);

// 2. Add QR Canvas Import
if (!content.includes('QRCodeCanvas')) {
  content = content.replace(
    'import { jsPDF } from "jspdf";',
    'import { jsPDF } from "jspdf";\nimport { QRCodeCanvas } from "qrcode.react";'
  );
}

// 3. Add states for Receive QR
const stateHookPos = content.indexOf('const [recentScans, setRecentScans]');
if (stateHookPos !== -1 && !content.includes('receiveAsset')) {
  content = content.replace(
    'const [recentScans, setRecentScans] = useState<{data: string, type: string, timestamp: Date}[]>([]);',
    'const [recentScans, setRecentScans] = useState<{data: string, type: string, timestamp: Date}[]>([]);\n  const [receiveAsset, setReceiveAsset] = useState<"fiat" | "crypto">("fiat");\n  const [receiveReqAmount, setReceiveReqAmount] = useState("");'
  );
}

// 4. Add Receive button in sidebar
const scanButton = `<button
          onClick={() => setTransferType("scan_qr")}
          className={\`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 \${
            transferType === "scan_qr"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }\`}
        >
          <QrCode className="w-4 h-4" /> Scan QR
        </button>`;

const newButtons = `<button
          onClick={() => setTransferType("scan_qr")}
          className={\`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 \${
            transferType === "scan_qr"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }\`}
        >
          <QrCode className="w-4 h-4" /> Scan to Pay
        </button>
        <button
          onClick={() => setTransferType("receive_qr")}
          className={\`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 \${
            transferType === "receive_qr"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200/50"
          }\`}
        >
          <QrCode className="w-4 h-4" /> Receive Payment
        </button>`;
        
content = content.replace(scanButton, newButtons);

// 5. Add Receive UI view
const renderBlock = `{/* Render Main Content Panel */}
      {transferType === "scan_qr" ? (`;

const receiveUI = `{/* Render Main Content Panel */}
      {transferType === "receive_qr" ? (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:col-start-3 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Receive Payment</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Generate a unique QR code to accept payments instantly into your Valourian OS accounts.
              </p>
              
              <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm mx-auto mb-8">
                <button 
                  onClick={() => setReceiveAsset("fiat")} 
                  className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${receiveAsset === 'fiat' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}\`}
                >
                  Fiat (PayID)
                </button>
                <button 
                  onClick={() => setReceiveAsset("crypto")} 
                  className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${receiveAsset === 'crypto' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}\`}
                >
                  Crypto Asset
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-100 relative group">
                  <div className="absolute inset-0 border-4 border-dashed border-indigo-100 rounded-3xl pointer-events-none group-hover:border-indigo-300 transition-colors"></div>
                  <div className="p-6">
                    <QRCodeCanvas 
                      value={receiveAsset === 'fiat' 
                        ? \`\${user?.email || 'network@valourian.com'}\${receiveReqAmount ? \`?amount=\${receiveReqAmount}\` : ''}\`
                        : \`ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F\${receiveReqAmount ? \`?amount=\${receiveReqAmount}\` : ''}\`
                      }
                      size={200}
                      level={"Q"}
                      fgColor="#0f172a"
                      imageSettings={{
                        src: receiveAsset === 'fiat' ? "https://cdn-icons-png.flaticon.com/512/2830/2830284.png" : "https://cdn-icons-png.flaticon.com/512/6001/6001368.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-sm mx-auto space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block text-left mb-1">Request Specific Amount (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={receiveReqAmount}
                      onChange={(e) => setReceiveReqAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-left">
                  <div className="truncate pr-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{receiveAsset === 'fiat' ? 'Your PayID / Email' : 'Your Default Wallet'}</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{receiveAsset === 'fiat' ? (user?.email || 'network@valourian.com') : '0x71C...976F'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(receiveAsset === 'fiat' ? (user?.email || 'network@valourian.com') : 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
                      toast.success("Address Copied!");
                    }}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : transferType === "scan_qr" ? (`;

content = content.replace(renderBlock, receiveUI);

// 6. Update the scanner logic slightly to handle "?amount=" stripping for PayID/Crypto
const oldScannerOnScan = `onScan={(data) => {
                  toast.success("Code Detected!");
                  const isCrypto = data.toLowerCase().includes('0x') || data.toLowerCase().includes('bitcoin:') || data.toLowerCase().includes('ethereum:');
                  const isPayId = data.includes('@') || /^\\+?[0-9]{10,14}$/.test(data) || /^[0-9]{11}$/.test(data);
                  const type = isCrypto ? 'crypto' : isPayId ? 'payid' : 'standard';
                  
                  setRecentScans(prev => {
                    const newScan = { data, type, timestamp: new Date() };`;

const newScannerOnScan = `onScan={(data) => {
                  toast.success("Code Detected!");
                  let cleanData = data;
                  let parsedAmount = "";
                  if (data.includes('?amount=')) {
                    const parts = data.split('?amount=');
                    cleanData = parts[0];
                    parsedAmount = parts[1];
                  }

                  const isCrypto = cleanData.toLowerCase().includes('0x') || cleanData.toLowerCase().includes('bitcoin:') || cleanData.toLowerCase().includes('ethereum:');
                  const isPayId = cleanData.includes('@') || /^\\+?[0-9]{10,14}$/.test(cleanData) || /^[0-9]{11}$/.test(cleanData);
                  const type = isCrypto ? 'crypto' : isPayId ? 'payid' : 'standard';
                  
                  setRecentScans(prev => {
                    const newScan = { data: cleanData, type, timestamp: new Date() };`;

content = content.replace(oldScannerOnScan, newScannerOnScan);

const oldCryptoSet = `                  if (isCrypto) {
                    setCryptoAddress(data);
                    setTransferType("digital_assets");
                  } else if (isPayId) {
                    setPayIdValue(data);
                    setTransferType("payid");
                    if (data.includes('@')) setPayIdType('email');
                    else if (/^[0-9]{11}$/.test(data)) setPayIdType('abn');
                    else setPayIdType('phone');
                  } else {
                    setRecipient(data);
                    setAmount("");
                    setTransferType("standard");
                  }`;

const newCryptoSet = `                  if (isCrypto) {
                    setCryptoAddress(cleanData);
                    if (parsedAmount) setAmount(parsedAmount);
                    setTransferType("digital_assets");
                  } else if (isPayId) {
                    setPayIdValue(cleanData);
                    if (parsedAmount) setAmount(parsedAmount);
                    setTransferType("payid");
                    if (cleanData.includes('@')) setPayIdType('email');
                    else if (/^[0-9]{11}$/.test(cleanData)) setPayIdType('abn');
                    else setPayIdType('phone');
                  } else {
                    setRecipient(cleanData);
                    setAmount(parsedAmount || "");
                    setTransferType("standard");
                  }`;

content = content.replace(oldCryptoSet, newCryptoSet);

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
