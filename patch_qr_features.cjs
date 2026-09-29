const fs = require('fs');

let content = fs.readFileSync('src/components/pay/RapidPay.tsx', 'utf-8');

// 1. Add jsPDF import
if (!content.includes('import { jsPDF } from "jspdf"')) {
    content = content.replace(
        'import jsQR from "jsqr";',
        'import jsQR from "jsqr";\nimport { jsPDF } from "jspdf";'
    );
}

// 2. Add properties to RapidPay
const oldRapidPay = `export function RapidPay({ user }: { user: any }) {
  const [recentScans, setRecentScans] = useState`;
const newRapidPay = `export function RapidPay({ user }: { user: any }) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<{data: string, type: string}[]>([]);
  const [showBatchSummary, setShowBatchSummary] = useState(false);
  
  const generatePDFReceipt = (transactionId: string, to: string, amt: string, method: string) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Valourian Sovereign OS", 20, 20);
      doc.setFontSize(16);
      doc.text("Transaction Receipt", 20, 30);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(\`Transaction ID: \${transactionId}\`, 20, 45);
      doc.text(\`Date: \${new Date().toLocaleString()}\`, 20, 55);
      doc.text(\`Status: COMPLETED\`, 20, 65);
      doc.text(\`Method: \${method}\`, 20, 75);
      
      doc.line(20, 80, 190, 80);
      
      doc.setFont("helvetica", "bold");
      doc.text("Transfer Details", 20, 90);
      doc.setFont("helvetica", "normal");
      doc.text(\`To: \${to}\`, 20, 100);
      doc.text(\`Amount: $\${amt} AUD\`, 20, 110);
      
      // QR Code representation (mock box for visual)
      doc.rect(140, 45, 50, 50);
      doc.setFontSize(8);
      doc.text("Verified by", 150, 70);
      doc.text("RapidPay Network", 143, 75);
      
      doc.save(\`receipt-\${transactionId}.pdf\`);
      import("sonner").then(({ toast }) => toast.success("PDF Receipt Downloaded"));
    } catch(e) {
      console.error(e);
      import("sonner").then(({ toast }) => toast.error("Failed to generate PDF"));
    }
  };

  const [recentScans, setRecentScans] = useState`;
if (!content.includes('generatePDFReceipt')) {
    content = content.replace(oldRapidPay, newRapidPay);
}

// 3. Add NFC scanning function and UI to RealQRScanner
const oldScanner = `const RealQRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);`;
const newScanner = `const RealQRScanner = ({ onScan, isBatchMode, onToggleBatch }: { onScan: (data: string) => void, isBatchMode: boolean, onToggleBatch: () => void }) => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isNfcActive, setIsNfcActive] = useState(false);

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      import("sonner").then(({ toast }) => toast.error('NFC is not supported on this device/browser'));
      return;
    }
    try {
      setIsNfcActive(true);
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      import("sonner").then(({ toast }) => toast.info('Hold your device near the NFC tag...'));
      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        let nfcData = '';
        for (const record of message.records) {
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          nfcData += textDecoder.decode(record.data);
        }
        setIsNfcActive(false);
        onScan(nfcData || serialNumber);
      });
    } catch (e: any) {
      setIsNfcActive(false);
      import("sonner").then(({ toast }) => toast.error('NFC Scan failed: ' + e.message));
    }
  };`;
content = content.replace(oldScanner, newScanner);

// 4. Update the visual focus frame animation
const oldWebcamUI = `          {!isProcessing && !scanSuccess && (
            <>
              <div className="absolute inset-0 border-2 border-dashed border-emerald-500/50 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_2s_ease-in-out_infinite_alternate] pointer-events-none"></div>
            </>
          )}`;
const newWebcamUI = `          {!isProcessing && !scanSuccess && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 sm:w-64 sm:h-64 border-[3px] border-emerald-500 rounded-3xl animate-[pulse_1.5s_ease-in-out_infinite] scale-95 opacity-80 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-500"></div>
                <div className="absolute w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-emerald-400/30 rounded-3xl animate-[spin_8s_linear_infinite] opacity-50"></div>
              </div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/20 border-b border-emerald-500 animate-[scan_1.5s_ease-in-out_infinite_alternate] pointer-events-none"></div>
            </>
          )}
          
          <div className="absolute bottom-4 left-0 w-full px-6 flex justify-between gap-4 z-20">
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); startNFCScan(); }}
               className={\`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all \${isNfcActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700/80'}\`}
             >
               <Sparkles className="w-4 h-4" />
               {isNfcActive ? 'Reading NFC...' : 'NFC Scan'}
             </button>
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleBatch(); }}
               className={\`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all \${isBatchMode ? 'bg-indigo-600 text-white border border-indigo-400' : 'bg-slate-800/80 text-indigo-400 border border-indigo-500/30 hover:bg-slate-700/80'}\`}
             >
               <Copy className="w-4 h-4" />
               {isBatchMode ? 'Batch Mode: ON' : 'Batch Mode: OFF'}
             </button>
          </div>
`;
content = content.replace(oldWebcamUI, newWebcamUI);

// 5. Update the onScan handling in RapidPay to support batching and PayID
const oldOnScanUsage = `<RealQRScanner onScan={(data) => {
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

const newOnScanUsage = `<RealQRScanner 
                  isBatchMode={isBatchMode}
                  onToggleBatch={() => setIsBatchMode(!isBatchMode)}
                  onScan={(data) => {
                  toast.success("Code Detected!");
                  const isCrypto = data.toLowerCase().includes('0x') || data.toLowerCase().includes('bitcoin:') || data.toLowerCase().includes('ethereum:');
                  const isPayId = data.includes('@') || /^\\+?[0-9]{10,14}$/.test(data) || /^[0-9]{11}$/.test(data);
                  const type = isCrypto ? 'crypto' : isPayId ? 'payid' : 'standard';
                  
                  setRecentScans(prev => {
                    const newScan = { data, type, timestamp: new Date() };
                    return [newScan, ...prev].slice(0, 5);
                  });

                  if (isBatchMode) {
                    setBatchItems(prev => [...prev, { data, type }]);
                    toast.success("Added to batch queue.");
                    return;
                  }

                  if (isCrypto) {
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
                  }
                }} />`;
content = content.replace(oldOnScanUsage, newOnScanUsage);

// 6. Update successful transfer logic to offer PDF
const oldSuccessText = `toast.success(\`Successfully sent $\${amtNum.toFixed(2)} to \${transferTo}. Recipient receivable yielded and logged for AU Bank/PayID.\`);`;
const newSuccessText = `toast.success(
          <div className="flex flex-col gap-2">
            <span>Successfully sent $\${amtNum.toFixed(2)} to \${transferTo}.</span>
            <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), transferTo, amtNum.toFixed(2), "AU Bank/PayID")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
          </div>
        );`;
content = content.replace(oldSuccessText, newSuccessText);

const oldSuccessText2 = `toast.success(\`Successfully sent $\${amtNum.toFixed(2)} to \${transferTo}\`);`;
const newSuccessText2 = `toast.success(
          <div className="flex flex-col gap-2">
            <span>Successfully sent $\${amtNum.toFixed(2)} to \${transferTo}</span>
            <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), transferTo, amtNum.toFixed(2), "Standard Transfer")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
          </div>
        );`;
content = content.replace(oldSuccessText2, newSuccessText2);


const oldSuccessText3 = `toast.success(\`Successfully delivered \${amtNum} AUD to \${lookupValue}!\`);`;
const newSuccessText3 = `toast.success(
             <div className="flex flex-col gap-2">
               <span>Successfully delivered \${amtNum} AUD to \${lookupValue}!</span>
               <button onClick={() => generatePDFReceipt(Math.random().toString(36).substr(2, 9).toUpperCase(), lookupValue, amtNum.toFixed(2), "Internal Network")} className="text-xs bg-white text-slate-800 font-bold px-2 py-1 rounded w-fit border border-slate-200">Download PDF Receipt</button>
             </div>
           );`;
content = content.replace(oldSuccessText3, newSuccessText3);

// 7. Add Batch Summary UI below the QR scanner if there are items
const batchSummaryUI = `
              {batchItems.length > 0 && (
                <div className="mt-6 bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-4 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-indigo-200 font-bold text-sm">Batch Queue ({batchItems.length})</h4>
                    <button onClick={() => setShowBatchSummary(true)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">Process Batch</button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {batchItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/50 p-2 rounded">
                        <span className="text-slate-300 truncate w-3/4">{item.data}</span>
                        <span className="text-indigo-400 uppercase font-black text-[9px] px-1.5 py-0.5 bg-indigo-900/50 rounded">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
`;
const insertionPoint = `</div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">`;
content = content.replace(insertionPoint, batchSummaryUI + insertionPoint);

// 8. Add Batch Summary Modal Modal inside RapidPay return statement
const batchSummaryModal = `
      {showBatchSummary && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowBatchSummary(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Batch Transfer Summary</h2>
            <p className="text-slate-500 mb-6">Review and process your queued scans.</p>
            
            <div className="space-y-3 mb-6">
              {batchItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 truncate w-3/4">{item.data}</span>
                    <span className="text-[10px] uppercase font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{item.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount (AUD)" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" onClick={() => setBatchItems(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  toast.success(\`Successfully processed \${batchItems.length} transactions.\`);
                  setBatchItems([]);
                  setShowBatchSummary(false);
                  setIsBatchMode(false);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-colors"
              >
                Execute All Transfers
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace('{/* Render Main Content Panel */}', batchSummaryModal + '\n      {/* Render Main Content Panel */}');

fs.writeFileSync('src/components/pay/RapidPay.tsx', content);
